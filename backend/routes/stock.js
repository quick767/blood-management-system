const express = require('express');
const { body, query, validationResult } = require('express-validator');
const BloodStock = require('../models/BloodStock');
const Donation = require('../models/Donation');
const User = require('../models/User');
const { auth, adminAuth } = require('../middleware/auth');
const { sendLowStockAlert } = require('../utils/email');

const router = express.Router();

// @route   GET /api/stock
// @desc    Get blood stock levels
// @access  Private
router.get('/', [
  auth,
  query('bloodGroup').optional().isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).withMessage('Invalid blood group'),
  query('status').optional().isIn(['all', 'low', 'critical', 'good']).withMessage('Invalid status filter')
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

    // Build filter
    const filter = {};
    if (req.query.bloodGroup) {
      filter.bloodGroup = req.query.bloodGroup;
    }

    // Get all blood stock
    let bloodStock = await BloodStock.find(filter).sort({ bloodGroup: 1 });

    // Initialize blood groups if they don't exist
    if (bloodStock.length === 0) {
      await BloodStock.initializeAllBloodGroups();
      bloodStock = await BloodStock.find(filter).sort({ bloodGroup: 1 });
    }

    // Filter by status if requested
    if (req.query.status && req.query.status !== 'all') {
      bloodStock = bloodStock.filter(stock => {
        const status = stock.stockStatus;
        return status === req.query.status;
      });
    }

    // Add virtual fields and format response
    const stockWithStatus = bloodStock.map(stock => {
      const stockObj = stock.toObject({ virtuals: true });
      
      // Calculate additional metrics
      stockObj.utilizationRate = stock.totalUnits > 0 ? 
        Math.round((stock.usedUnits / stock.totalUnits) * 100) : 0;
      
      stockObj.expiryRate = stock.totalUnits > 0 ? 
        Math.round((stock.expiredUnits / stock.totalUnits) * 100) : 0;
      
      // Days since last donation/request
      if (stock.lastDonationDate) {
        stockObj.daysSinceLastDonation = Math.floor(
          (Date.now() - stock.lastDonationDate.getTime()) / (1000 * 60 * 60 * 24)
        );
      }
      
      if (stock.lastRequestDate) {
        stockObj.daysSinceLastRequest = Math.floor(
          (Date.now() - stock.lastRequestDate.getTime()) / (1000 * 60 * 60 * 24)
        );
      }
      
      return stockObj;
    });

    res.json({
      bloodStock: stockWithStatus,
      summary: {
        totalBloodGroups: stockWithStatus.length,
        totalUnits: stockWithStatus.reduce((sum, stock) => sum + stock.availableUnits, 0),
        lowStockCount: stockWithStatus.filter(stock => stock.stockStatus === 'low').length,
        criticalStockCount: stockWithStatus.filter(stock => stock.stockStatus === 'critical').length
      }
    });

  } catch (error) {
    console.error('Get blood stock error:', error);
    res.status(500).json({
      message: 'Server error while fetching blood stock'
    });
  }
});

// @route   GET /api/stock/:bloodGroup
// @desc    Get specific blood group stock details
// @access  Private
router.get('/:bloodGroup', [
  auth,
  query('includeHistory').optional().isBoolean().withMessage('includeHistory must be boolean')
], async (req, res) => {
  try {
    const { bloodGroup } = req.params;
    
    // Validate blood group
    const validBloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    if (!validBloodGroups.includes(bloodGroup)) {
      return res.status(400).json({
        message: 'Invalid blood group'
      });
    }

    let bloodStock = await BloodStock.findOne({ bloodGroup });
    
    if (!bloodStock) {
      // Initialize if doesn't exist
      bloodStock = new BloodStock({ bloodGroup });
      await bloodStock.save();
    }

    // Include history if requested
    if (req.query.includeHistory === 'true') {
      await bloodStock.populate('stockHistory.performedBy', 'name');
      await bloodStock.populate('alerts.acknowledgedBy', 'name');
    } else {
      // Exclude history for lighter response
      bloodStock = await BloodStock.findOne({ bloodGroup }).select('-stockHistory');
    }

    const stockObj = bloodStock.toObject({ virtuals: true });
    
    // Add additional metrics
    stockObj.utilizationRate = bloodStock.totalUnits > 0 ? 
      Math.round((bloodStock.usedUnits / bloodStock.totalUnits) * 100) : 0;
    
    stockObj.expiryRate = bloodStock.totalUnits > 0 ? 
      Math.round((bloodStock.expiredUnits / bloodStock.totalUnits) * 100) : 0;

    // Get recent donations for this blood group
    const recentDonations = await Donation.find({
      bloodGroup,
      status: 'approved'
    })
    .populate('donor', 'name')
    .sort({ donationDate: -1 })
    .limit(5);

    res.json({
      bloodStock: stockObj,
      recentDonations
    });

  } catch (error) {
    console.error('Get blood stock details error:', error);
    res.status(500).json({
      message: 'Server error while fetching blood stock details'
    });
  }
});

// @route   PUT /api/stock/:bloodGroup
// @desc    Update blood stock (admin only)
// @access  Private/Admin
router.put('/:bloodGroup', [
  auth,
  adminAuth,
  body('availableUnits').optional().isInt({ min: 0 }).withMessage('Available units must be non-negative'),
  body('minimumThreshold').optional().isInt({ min: 0 }).withMessage('Minimum threshold must be non-negative'),
  body('criticalThreshold').optional().isInt({ min: 0 }).withMessage('Critical threshold must be non-negative'),
  body('notes').optional().isLength({ min: 1 }).withMessage('Notes cannot be empty')
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

    const { bloodGroup } = req.params;
    
    // Validate blood group
    const validBloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    if (!validBloodGroups.includes(bloodGroup)) {
      return res.status(400).json({
        message: 'Invalid blood group'
      });
    }

    let bloodStock = await BloodStock.findOne({ bloodGroup });
    
    if (!bloodStock) {
      bloodStock = new BloodStock({ bloodGroup });
    }

    // Handle manual stock adjustment
    if (req.body.availableUnits !== undefined) {
      await bloodStock.adjustStock(req.body.availableUnits, req.user._id, req.body.notes);
    }

    // Update thresholds
    if (req.body.minimumThreshold !== undefined) {
      bloodStock.minimumThreshold = req.body.minimumThreshold;
    }
    
    if (req.body.criticalThreshold !== undefined) {
      bloodStock.criticalThreshold = req.body.criticalThreshold;
    }

    await bloodStock.save();

    res.json({
      message: 'Blood stock updated successfully',
      bloodStock: bloodStock.toObject({ virtuals: true })
    });

  } catch (error) {
    console.error('Update blood stock error:', error);
    res.status(500).json({
      message: 'Server error while updating blood stock'
    });
  }
});

// @route   POST /api/stock/:bloodGroup/remove-expired
// @desc    Remove expired blood units (admin only)
// @access  Private/Admin
router.post('/:bloodGroup/remove-expired', [
  auth,
  adminAuth,
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('reason').optional().isLength({ min: 1 }).withMessage('Reason cannot be empty')
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

    const { bloodGroup } = req.params;
    const { quantity, reason } = req.body;
    
    // Validate blood group
    const validBloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    if (!validBloodGroups.includes(bloodGroup)) {
      return res.status(400).json({
        message: 'Invalid blood group'
      });
    }

    const bloodStock = await BloodStock.findOne({ bloodGroup });
    
    if (!bloodStock) {
      return res.status(404).json({
        message: 'Blood stock not found'
      });
    }

    if (bloodStock.availableUnits < quantity) {
      return res.status(400).json({
        message: 'Not enough units available to remove'
      });
    }

    await bloodStock.removeExpiredUnits(quantity, req.user._id, reason || 'Expired units removed');

    res.json({
      message: 'Expired units removed successfully',
      bloodStock: bloodStock.toObject({ virtuals: true })
    });

  } catch (error) {
    console.error('Remove expired units error:', error);
    res.status(500).json({
      message: 'Server error while removing expired units'
    });
  }
});

// @route   GET /api/stock/alerts/active
// @desc    Get active stock alerts (admin only)
// @access  Private/Admin
router.get('/alerts/active', [auth, adminAuth], async (req, res) => {
  try {
    const stockWithAlerts = await BloodStock.find({
      'alerts.isActive': true
    }).select('bloodGroup availableUnits alerts');

    const activeAlerts = [];
    
    stockWithAlerts.forEach(stock => {
      stock.alerts.forEach(alert => {
        if (alert.isActive) {
          activeAlerts.push({
            _id: alert._id,
            bloodGroup: stock.bloodGroup,
            type: alert.type,
            message: alert.message,
            createdAt: alert.createdAt,
            currentStock: stock.availableUnits
          });
        }
      });
    });

    // Sort by creation date (newest first)
    activeAlerts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({
      alerts: activeAlerts,
      totalActiveAlerts: activeAlerts.length
    });

  } catch (error) {
    console.error('Get active alerts error:', error);
    res.status(500).json({
      message: 'Server error while fetching active alerts'
    });
  }
});

// @route   POST /api/stock/alerts/:alertId/acknowledge
// @desc    Acknowledge stock alert (admin only)
// @access  Private/Admin
router.post('/alerts/:alertId/acknowledge', [auth, adminAuth], async (req, res) => {
  try {
    const { alertId } = req.params;

    const bloodStock = await BloodStock.findOne({
      'alerts._id': alertId
    });

    if (!bloodStock) {
      return res.status(404).json({
        message: 'Alert not found'
      });
    }

    const alert = bloodStock.alerts.id(alertId);
    if (!alert) {
      return res.status(404).json({
        message: 'Alert not found'
      });
    }

    alert.isActive = false;
    alert.acknowledgedBy = req.user._id;
    alert.acknowledgedAt = new Date();

    await bloodStock.save();

    res.json({
      message: 'Alert acknowledged successfully'
    });

  } catch (error) {
    console.error('Acknowledge alert error:', error);
    res.status(500).json({
      message: 'Server error while acknowledging alert'
    });
  }
});

// @route   POST /api/stock/send-low-stock-alerts
// @desc    Send low stock alerts to admins (admin only)
// @access  Private/Admin
router.post('/send-low-stock-alerts', [auth, adminAuth], async (req, res) => {
  try {
    // Get all blood stock with low or critical levels
    const lowStockItems = await BloodStock.find({
      $expr: {
        $or: [
          { $lte: ['$availableUnits', '$criticalThreshold'] },
          { $lte: ['$availableUnits', '$minimumThreshold'] }
        ]
      }
    });

    if (lowStockItems.length === 0) {
      return res.json({
        message: 'No low stock items found'
      });
    }

    // Get admin emails
    const admins = await User.find({ 
      role: 'admin', 
      isActive: true 
    }).select('email');
    
    const adminEmails = admins.map(admin => admin.email);

    if (adminEmails.length === 0) {
      return res.status(400).json({
        message: 'No active admin users found'
      });
    }

    // Send alerts for each low stock item
    const alertPromises = lowStockItems.map(stock => {
      const threshold = stock.availableUnits <= stock.criticalThreshold ? 
        stock.criticalThreshold : stock.minimumThreshold;
      
      return sendLowStockAlert(
        adminEmails,
        stock.bloodGroup,
        stock.availableUnits,
        threshold
      );
    });

    await Promise.allSettled(alertPromises);

    res.json({
      message: 'Low stock alerts sent successfully',
      alertsSent: lowStockItems.length,
      recipientCount: adminEmails.length
    });

  } catch (error) {
    console.error('Send low stock alerts error:', error);
    res.status(500).json({
      message: 'Server error while sending low stock alerts'
    });
  }
});

// @route   GET /api/stock/stats/overview
// @desc    Get stock statistics overview (admin only)
// @access  Private/Admin
router.get('/stats/overview', [auth, adminAuth], async (req, res) => {
  try {
    const stats = await Promise.all([
      // Overall stock summary
      BloodStock.aggregate([
        {
          $group: {
            _id: null,
            totalUnits: { $sum: '$availableUnits' },
            totalUsed: { $sum: '$usedUnits' },
            totalExpired: { $sum: '$expiredUnits' },
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

      // Stock by blood group
      BloodStock.find({}).select('bloodGroup availableUnits totalUnits usedUnits expiredUnits'),

      // Recent stock movements (from history)
      BloodStock.aggregate([
        { $unwind: '$stockHistory' },
        { $sort: { 'stockHistory.date': -1 } },
        { $limit: 20 },
        {
          $project: {
            bloodGroup: 1,
            action: '$stockHistory.action',
            quantity: '$stockHistory.quantity',
            date: '$stockHistory.date',
            previousStock: '$stockHistory.previousStock',
            newStock: '$stockHistory.newStock'
          }
        }
      ])
    ]);

    res.json({
      summary: stats[0][0] || {
        totalUnits: 0,
        totalUsed: 0,
        totalExpired: 0,
        lowStockCount: 0,
        criticalStockCount: 0
      },
      stockByBloodGroup: stats[1],
      recentMovements: stats[2]
    });

  } catch (error) {
    console.error('Get stock stats error:', error);
    res.status(500).json({
      message: 'Server error while fetching stock statistics'
    });
  }
});

// @route   POST /api/stock/initialize
// @desc    Initialize all blood groups (admin only)
// @access  Private/Admin
router.post('/initialize', [auth, adminAuth], async (req, res) => {
  try {
    await BloodStock.initializeAllBloodGroups();
    
    const bloodStock = await BloodStock.find({}).sort({ bloodGroup: 1 });
    
    res.json({
      message: 'Blood stock initialized successfully',
      bloodStock
    });

  } catch (error) {
    console.error('Initialize blood stock error:', error);
    res.status(500).json({
      message: 'Server error while initializing blood stock'
    });
  }
});

module.exports = router;

