const express = require('express');
const { body, query, validationResult } = require('express-validator');
const User = require('../models/User');
const Donation = require('../models/Donation');
const BloodRequest = require('../models/BloodRequest');
const { auth, adminAuth, resourceAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users
// @desc    Get all users (admin only)
// @access  Private/Admin
router.get('/', [
  auth,
  adminAuth,
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('role').optional().isIn(['admin', 'donor', 'recipient']).withMessage('Invalid role'),
  query('bloodGroup').optional().isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).withMessage('Invalid blood group'),
  query('isActive').optional().isBoolean().withMessage('isActive must be boolean'),
  query('search').optional().isLength({ min: 1 }).withMessage('Search term cannot be empty')
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

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = {};
    
    if (req.query.role) filter.role = req.query.role;
    if (req.query.bloodGroup) filter.bloodGroup = req.query.bloodGroup;
    if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';
    
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
        { phone: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    // Get users with pagination
    const users = await User.find(filter)
      .select('-password -verificationToken -resetPasswordToken')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(filter);

    res.json({
      users: users.map(user => user.getPublicProfile()),
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalUsers: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      message: 'Server error while fetching users'
    });
  }
});

// @route   GET /api/users/donors
// @desc    Get available donors by blood group
// @access  Private
router.get('/donors', [
  auth,
  query('bloodGroup').optional().isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).withMessage('Invalid blood group'),
  query('city').optional().isLength({ min: 1 }).withMessage('City cannot be empty'),
  query('state').optional().isLength({ min: 1 }).withMessage('State cannot be empty'),
  query('available').optional().isBoolean().withMessage('Available must be boolean')
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

    // Build filter for donors
    const filter = {
      role: 'donor',
      isActive: true,
      isVerified: true
    };

    if (req.query.bloodGroup) filter.bloodGroup = req.query.bloodGroup;
    if (req.query.city) filter['address.city'] = { $regex: req.query.city, $options: 'i' };
    if (req.query.state) filter['address.state'] = { $regex: req.query.state, $options: 'i' };

    let donors = await User.find(filter)
      .select('name bloodGroup age gender address.city address.state phone createdAt medicalInfo.lastDonationDate')
      .sort({ 'medicalInfo.lastDonationDate': 1 });

    // Filter by availability if requested
    if (req.query.available === 'true') {
      donors = donors.filter(donor => donor.canDonate());
    }

    // Add donation eligibility info
    const donorsWithEligibility = donors.map(donor => {
      const donorObj = donor.toObject();
      donorObj.canDonate = donor.canDonate();
      
      if (donor.medicalInfo.lastDonationDate) {
        const daysSinceLastDonation = Math.floor((Date.now() - donor.medicalInfo.lastDonationDate.getTime()) / (1000 * 60 * 60 * 24));
        donorObj.daysSinceLastDonation = daysSinceLastDonation;
        donorObj.nextEligibleDate = new Date(donor.medicalInfo.lastDonationDate.getTime() + (56 * 24 * 60 * 60 * 1000));
      }
      
      return donorObj;
    });

    res.json({
      donors: donorsWithEligibility,
      total: donorsWithEligibility.length
    });

  } catch (error) {
    console.error('Get donors error:', error);
    res.status(500).json({
      message: 'Server error while fetching donors'
    });
  }
});

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -verificationToken -resetPasswordToken');

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    // Check if user can access this profile
    if (req.user.role !== 'admin' && req.user._id.toString() !== user._id.toString()) {
      return res.status(403).json({
        message: 'Access denied. You can only view your own profile.'
      });
    }

    res.json({
      user: user.getPublicProfile()
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      message: 'Server error while fetching user'
    });
  }
});

// @route   PUT /api/users/:id
// @desc    Update user (admin only)
// @access  Private/Admin
router.put('/:id', [
  auth,
  adminAuth,
  body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('role').optional().isIn(['admin', 'donor', 'recipient']).withMessage('Invalid role'),
  body('isActive').optional().isBoolean().withMessage('isActive must be boolean'),
  body('isVerified').optional().isBoolean().withMessage('isVerified must be boolean')
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

    const allowedUpdates = ['name', 'role', 'isActive', 'isVerified', 'phone', 'age', 'gender', 'address', 'medicalInfo'];
    const updates = {};

    // Only include allowed fields
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).select('-password -verificationToken -resetPasswordToken');

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    res.json({
      message: 'User updated successfully',
      user: user.getPublicProfile()
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      message: 'Server error while updating user'
    });
  }
});

// @route   DELETE /api/users/:id
// @desc    Delete user (admin only)
// @access  Private/Admin
router.delete('/:id', [auth, adminAuth], async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    // Prevent deleting the last admin
    if (user.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin', isActive: true });
      if (adminCount <= 1) {
        return res.status(400).json({
          message: 'Cannot delete the last admin user'
        });
      }
    }

    // Soft delete by deactivating instead of removing
    user.isActive = false;
    await user.save();

    res.json({
      message: 'User deactivated successfully'
    });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      message: 'Server error while deleting user'
    });
  }
});

// @route   GET /api/users/:id/dashboard
// @desc    Get user dashboard data
// @access  Private
router.get('/:id/dashboard', [auth, resourceAuth], async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    let dashboardData = {
      user: user.getPublicProfile()
    };

    if (user.role === 'donor') {
      // Get donor statistics
      const donations = await Donation.find({ donor: userId })
        .sort({ donationDate: -1 })
        .limit(5)
        .populate('approvedBy', 'name');

      const donationStats = await Donation.aggregate([
        { $match: { donor: user._id } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalQuantity: { $sum: '$quantity' }
          }
        }
      ]);

      dashboardData.donations = {
        recent: donations,
        stats: donationStats,
        canDonate: user.canDonate(),
        totalDonations: donations.length
      };

    } else if (user.role === 'recipient') {
      // Get recipient statistics
      const requests = await BloodRequest.find({ requester: userId })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('approvedBy', 'name');

      const requestStats = await BloodRequest.aggregate([
        { $match: { requester: user._id } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalQuantity: { $sum: '$quantity' }
          }
        }
      ]);

      dashboardData.requests = {
        recent: requests,
        stats: requestStats,
        totalRequests: requests.length
      };
    }

    res.json(dashboardData);

  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({
      message: 'Server error while fetching dashboard data'
    });
  }
});

// @route   GET /api/users/stats/overview
// @desc    Get user statistics overview (admin only)
// @access  Private/Admin
router.get('/stats/overview', [auth, adminAuth], async (req, res) => {
  try {
    const stats = await Promise.all([
      // Total users by role
      User.aggregate([
        {
          $group: {
            _id: '$role',
            count: { $sum: 1 },
            active: { $sum: { $cond: ['$isActive', 1, 0] } },
            verified: { $sum: { $cond: ['$isVerified', 1, 0] } }
          }
        }
      ]),

      // Users by blood group
      User.aggregate([
        { $match: { isActive: true } },
        {
          $group: {
            _id: '$bloodGroup',
            count: { $sum: 1 },
            donors: { $sum: { $cond: [{ $eq: ['$role', 'donor'] }, 1, 0] } }
          }
        }
      ]),

      // Recent registrations (last 30 days)
      User.aggregate([
        {
          $match: {
            createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
          }
        },
        {
          $group: {
            _id: {
              date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.date': 1 } }
      ])
    ]);

    res.json({
      usersByRole: stats[0],
      usersByBloodGroup: stats[1],
      recentRegistrations: stats[2]
    });

  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      message: 'Server error while fetching user statistics'
    });
  }
});

module.exports = router;

