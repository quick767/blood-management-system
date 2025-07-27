const express = require('express');
const { query, validationResult } = require('express-validator');
const User = require('../models/User');
const Donation = require('../models/Donation');
const BloodRequest = require('../models/BloodRequest');
const BloodStock = require('../models/BloodStock');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard data
// @access  Private/Admin
router.get('/dashboard', [auth, adminAuth], async (req, res) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const dashboardData = await Promise.all([
      // User statistics
      User.aggregate([
        {
          $group: {
            _id: '$role',
            total: { $sum: 1 },
            active: { $sum: { $cond: ['$isActive', 1, 0] } },
            verified: { $sum: { $cond: ['$isVerified', 1, 0] } },
            newThisMonth: {
              $sum: {
                $cond: [
                  { $gte: ['$createdAt', thirtyDaysAgo] },
                  1,
                  0
                ]
              }
            }
          }
        }
      ]),

      // Donation statistics
      Donation.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalQuantity: { $sum: '$quantity' },
            thisWeek: {
              $sum: {
                $cond: [
                  { $gte: ['$donationDate', sevenDaysAgo] },
                  1,
                  0
                ]
              }
            }
          }
        }
      ]),

      // Blood request statistics
      BloodRequest.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalQuantity: { $sum: '$quantity' },
            thisWeek: {
              $sum: {
                $cond: [
                  { $gte: ['$createdAt', sevenDaysAgo] },
                  1,
                  0
                ]
              }
            }
          }
        }
      ]),

      // Blood stock summary
      BloodStock.aggregate([
        {
          $group: {
            _id: null,
            totalUnits: { $sum: '$availableUnits' },
            lowStockCount: {
              $sum: {
                $cond: [
                  { $lte: ['$availableUnits', '$minimumThreshold'] },
                  1,
                  0
                ]
              }
            },
            criticalStockCount: {
              $sum: {
                $cond: [
                  { $lte: ['$availableUnits', '$criticalThreshold'] },
                  1,
                  0
                ]
              }
            }
          }
        }
      ]),

      // Recent activities
      Promise.all([
        // Recent donations
        Donation.find({})
          .populate('donor', 'name bloodGroup')
          .sort({ createdAt: -1 })
          .limit(5),
        
        // Recent requests
        BloodRequest.find({})
          .populate('requester', 'name')
          .sort({ createdAt: -1 })
          .limit(5),
        
        // Recent user registrations
        User.find({})
          .select('name role bloodGroup createdAt')
          .sort({ createdAt: -1 })
          .limit(5)
      ]),

      // Pending items count
      Promise.all([
        Donation.countDocuments({ status: 'pending' }),
        BloodRequest.countDocuments({ status: 'pending' }),
        BloodRequest.countDocuments({ urgency: 'critical', status: { $in: ['pending', 'approved'] } })
      ]),

      // Monthly trends (last 6 months)
      Promise.all([
        // Donation trends
        Donation.aggregate([
          {
            $match: {
              donationDate: { $gte: new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000) }
            }
          },
          {
            $group: {
              _id: {
                year: { $year: '$donationDate' },
                month: { $month: '$donationDate' }
              },
              count: { $sum: 1 },
              approved: { $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] } }
            }
          },
          { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]),
        
        // Request trends
        BloodRequest.aggregate([
          {
            $match: {
              createdAt: { $gte: new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000) }
            }
          },
          {
            $group: {
              _id: {
                year: { $year: '$createdAt' },
                month: { $month: '$createdAt' }
              },
              count: { $sum: 1 },
              fulfilled: { $sum: { $cond: [{ $eq: ['$status', 'fulfilled'] }, 1, 0] } }
            }
          },
          { $sort: { '_id.year': 1, '_id.month': 1 } }
        ])
      ])
    ]);

    // Format the response
    const [
      userStats,
      donationStats,
      requestStats,
      stockSummary,
      recentActivities,
      pendingCounts,
      trends
    ] = dashboardData;

    const [recentDonations, recentRequests, recentUsers] = recentActivities;
    const [pendingDonations, pendingRequests, criticalRequests] = pendingCounts;
    const [donationTrends, requestTrends] = trends;

    res.json({
      summary: {
        users: userStats,
        donations: donationStats,
        requests: requestStats,
        stock: stockSummary[0] || { totalUnits: 0, lowStockCount: 0, criticalStockCount: 0 }
      },
      recentActivities: {
        donations: recentDonations,
        requests: recentRequests,
        users: recentUsers
      },
      pendingItems: {
        donations: pendingDonations,
        requests: pendingRequests,
        criticalRequests: criticalRequests
      },
      trends: {
        donations: donationTrends,
        requests: requestTrends
      }
    });

  } catch (error) {
    console.error('Get admin dashboard error:', error);
    res.status(500).json({
      message: 'Server error while fetching dashboard data'
    });
  }
});

// @route   GET /api/admin/analytics
// @desc    Get detailed analytics data
// @access  Private/Admin
router.get('/analytics', [
  auth,
  adminAuth,
  query('period').optional().isIn(['7d', '30d', '90d', '1y']).withMessage('Invalid period'),
  query('bloodGroup').optional().isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).withMessage('Invalid blood group')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const period = req.query.period || '30d';
    const bloodGroup = req.query.bloodGroup;

    // Calculate date range
    const now = new Date();
    let startDate;
    
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Build match filters
    const donationMatch = { donationDate: { $gte: startDate } };
    const requestMatch = { createdAt: { $gte: startDate } };
    
    if (bloodGroup) {
      donationMatch.bloodGroup = bloodGroup;
      requestMatch.bloodType = bloodGroup;
    }

    const analyticsData = await Promise.all([
      // Donation analytics
      Donation.aggregate([
        { $match: donationMatch },
        {
          $group: {
            _id: {
              date: { $dateToString: { format: '%Y-%m-%d', date: '$donationDate' } },
              status: '$status'
            },
            count: { $sum: 1 },
            quantity: { $sum: '$quantity' }
          }
        },
        { $sort: { '_id.date': 1 } }
      ]),

      // Request analytics
      BloodRequest.aggregate([
        { $match: requestMatch },
        {
          $group: {
            _id: {
              date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
              status: '$status',
              urgency: '$urgency'
            },
            count: { $sum: 1 },
            quantity: { $sum: '$quantity' }
          }
        },
        { $sort: { '_id.date': 1 } }
      ]),

      // Blood group distribution
      Promise.all([
        Donation.aggregate([
          { $match: donationMatch },
          {
            $group: {
              _id: '$bloodGroup',
              donations: { $sum: 1 },
              totalQuantity: { $sum: '$quantity' },
              approved: { $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] } }
            }
          }
        ]),
        BloodRequest.aggregate([
          { $match: requestMatch },
          {
            $group: {
              _id: '$bloodType',
              requests: { $sum: 1 },
              totalQuantity: { $sum: '$quantity' },
              fulfilled: { $sum: { $cond: [{ $eq: ['$status', 'fulfilled'] }, 1, 0] } }
            }
          }
        ])
      ]),

      // Geographic distribution
      Promise.all([
        User.aggregate([
          { $match: { role: 'donor', isActive: true } },
          {
            $group: {
              _id: {
                state: '$address.state',
                city: '$address.city'
              },
              donorCount: { $sum: 1 }
            }
          },
          { $sort: { donorCount: -1 } },
          { $limit: 20 }
        ]),
        BloodRequest.aggregate([
          { $match: requestMatch },
          {
            $group: {
              _id: {
                state: '$hospital.address.state',
                city: '$hospital.address.city'
              },
              requestCount: { $sum: 1 }
            }
          },
          { $sort: { requestCount: -1 } },
          { $limit: 20 }
        ])
      ]),

      // Performance metrics
      Promise.all([
        // Average fulfillment time
        BloodRequest.aggregate([
          {
            $match: {
              ...requestMatch,
              status: 'fulfilled',
              'fulfillment.fulfilledAt': { $exists: true }
            }
          },
          {
            $project: {
              fulfillmentTime: {
                $subtract: ['$fulfillment.fulfilledAt', '$createdAt']
              }
            }
          },
          {
            $group: {
              _id: null,
              avgFulfillmentTime: { $avg: '$fulfillmentTime' },
              minFulfillmentTime: { $min: '$fulfillmentTime' },
              maxFulfillmentTime: { $max: '$fulfillmentTime' }
            }
          }
        ]),
        
        // Donation approval rate
        Donation.aggregate([
          { $match: donationMatch },
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              approved: { $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] } },
              rejected: { $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] } }
            }
          }
        ])
      ])
    ]);

    const [
      donationTimeline,
      requestTimeline,
      bloodGroupDistribution,
      geographicDistribution,
      performanceMetrics
    ] = analyticsData;

    const [donationsByBloodGroup, requestsByBloodGroup] = bloodGroupDistribution;
    const [donorsByLocation, requestsByLocation] = geographicDistribution;
    const [fulfillmentMetrics, approvalMetrics] = performanceMetrics;

    res.json({
      period,
      bloodGroup: bloodGroup || 'all',
      timeline: {
        donations: donationTimeline,
        requests: requestTimeline
      },
      bloodGroupDistribution: {
        donations: donationsByBloodGroup,
        requests: requestsByBloodGroup
      },
      geographicDistribution: {
        donors: donorsByLocation,
        requests: requestsByLocation
      },
      performance: {
        fulfillment: fulfillmentMetrics[0] || {},
        approval: approvalMetrics[0] || {}
      }
    });

  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      message: 'Server error while fetching analytics data'
    });
  }
});

// @route   GET /api/admin/reports/summary
// @desc    Get summary report
// @access  Private/Admin
router.get('/reports/summary', [
  auth,
  adminAuth,
  query('startDate').optional().isISO8601().withMessage('Invalid start date'),
  query('endDate').optional().isISO8601().withMessage('Invalid end date')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const startDate = req.query.startDate ? new Date(req.query.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();

    const reportData = await Promise.all([
      // User summary
      User.aggregate([
        {
          $group: {
            _id: '$role',
            total: { $sum: 1 },
            active: { $sum: { $cond: ['$isActive', 1, 0] } },
            verified: { $sum: { $cond: ['$isVerified', 1, 0] } },
            newInPeriod: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $gte: ['$createdAt', startDate] },
                      { $lte: ['$createdAt', endDate] }
                    ]
                  },
                  1,
                  0
                ]
              }
            }
          }
        }
      ]),

      // Donation summary
      Donation.aggregate([
        {
          $match: {
            donationDate: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalQuantity: { $sum: '$quantity' }
          }
        }
      ]),

      // Request summary
      BloodRequest.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalQuantity: { $sum: '$quantity' }
          }
        }
      ]),

      // Current stock levels
      BloodStock.find({}).select('bloodGroup availableUnits totalUnits usedUnits expiredUnits'),

      // Top performers
      Promise.all([
        // Top donors
        Donation.aggregate([
          {
            $match: {
              status: 'approved',
              donationDate: { $gte: startDate, $lte: endDate }
            }
          },
          {
            $group: {
              _id: '$donor',
              donationCount: { $sum: 1 },
              totalQuantity: { $sum: '$quantity' }
            }
          },
          { $sort: { donationCount: -1 } },
          { $limit: 10 },
          {
            $lookup: {
              from: 'users',
              localField: '_id',
              foreignField: '_id',
              as: 'donor'
            }
          },
          { $unwind: '$donor' },
          {
            $project: {
              donorName: '$donor.name',
              donorBloodGroup: '$donor.bloodGroup',
              donationCount: 1,
              totalQuantity: 1
            }
          }
        ]),

        // Most requested blood types
        BloodRequest.aggregate([
          {
            $match: {
              createdAt: { $gte: startDate, $lte: endDate }
            }
          },
          {
            $group: {
              _id: '$bloodType',
              requestCount: { $sum: 1 },
              totalQuantity: { $sum: '$quantity' },
              fulfilled: { $sum: { $cond: [{ $eq: ['$status', 'fulfilled'] }, 1, 0] } }
            }
          },
          { $sort: { requestCount: -1 } }
        ])
      ])
    ]);

    const [
      userSummary,
      donationSummary,
      requestSummary,
      currentStock,
      topPerformers
    ] = reportData;

    const [topDonors, mostRequestedBloodTypes] = topPerformers;

    res.json({
      reportPeriod: {
        startDate,
        endDate
      },
      summary: {
        users: userSummary,
        donations: donationSummary,
        requests: requestSummary,
        currentStock
      },
      topPerformers: {
        donors: topDonors,
        requestedBloodTypes: mostRequestedBloodTypes
      },
      generatedAt: new Date()
    });

  } catch (error) {
    console.error('Get summary report error:', error);
    res.status(500).json({
      message: 'Server error while generating summary report'
    });
  }
});

// @route   GET /api/admin/system/health
// @desc    Get system health status
// @access  Private/Admin
router.get('/system/health', [auth, adminAuth], async (req, res) => {
  try {
    const healthData = await Promise.all([
      // Database connectivity
      User.countDocuments({}),
      
      // Recent activity
      Promise.all([
        Donation.countDocuments({ createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } }),
        BloodRequest.countDocuments({ createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } }),
        User.countDocuments({ createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } })
      ]),
      
      // System alerts
      BloodStock.countDocuments({
        $expr: { $lte: ['$availableUnits', '$criticalThreshold'] }
      }),
      
      // Pending items
      Promise.all([
        Donation.countDocuments({ status: 'pending' }),
        BloodRequest.countDocuments({ status: 'pending' })
      ])
    ]);

    const [
      totalUsers,
      recentActivity,
      criticalStockCount,
      pendingItems
    ] = healthData;

    const [recentDonations, recentRequests, recentRegistrations] = recentActivity;
    const [pendingDonations, pendingRequests] = pendingItems;

    const systemHealth = {
      status: 'healthy',
      timestamp: new Date(),
      database: {
        connected: true,
        totalUsers
      },
      activity: {
        last24Hours: {
          donations: recentDonations,
          requests: recentRequests,
          registrations: recentRegistrations
        }
      },
      alerts: {
        criticalStock: criticalStockCount,
        pendingDonations,
        pendingRequests
      }
    };

    // Determine overall health status
    if (criticalStockCount > 0 || pendingDonations > 10 || pendingRequests > 20) {
      systemHealth.status = 'warning';
    }

    if (criticalStockCount > 3 || pendingDonations > 50 || pendingRequests > 100) {
      systemHealth.status = 'critical';
    }

    res.json(systemHealth);

  } catch (error) {
    console.error('Get system health error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Unable to determine system health',
      timestamp: new Date()
    });
  }
});

module.exports = router;

