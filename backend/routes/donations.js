const express = require('express');
const { body, query, validationResult } = require('express-validator');
const Donation = require('../models/Donation');
const User = require('../models/User');
const BloodStock = require('../models/BloodStock');
const { auth, adminAuth, donorAuth, resourceAuth } = require('../middleware/auth');
const { sendDonationApprovedEmail } = require('../utils/email');

const router = express.Router();

// @route   POST /api/donations
// @desc    Create a new donation
// @access  Private/Donor
router.post('/', [
  auth,
  donorAuth,
  body('bloodGroup').isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).withMessage('Invalid blood group'),
  body('quantity').optional().isInt({ min: 350, max: 500 }).withMessage('Quantity must be between 350ml and 500ml'),
  body('donationDate').optional().isISO8601().withMessage('Invalid donation date'),
  body('location.center').notEmpty().withMessage('Donation center is required'),
  body('location.address.city').notEmpty().withMessage('City is required'),
  body('location.address.state').notEmpty().withMessage('State is required'),
  body('medicalScreening.hemoglobin').optional().isFloat({ min: 12.5, max: 20 }).withMessage('Hemoglobin must be between 12.5 and 20'),
  body('medicalScreening.weight').optional().isFloat({ min: 45 }).withMessage('Weight must be at least 45kg')
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

    const donor = await User.findById(req.user._id);

    // Check if donor can donate
    if (!donor.canDonate()) {
      return res.status(400).json({
        message: 'You are not eligible to donate at this time. Please wait 56 days from your last donation.'
      });
    }

    // Check for pending donations
    const pendingDonation = await Donation.findOne({
      donor: req.user._id,
      status: 'pending'
    });

    if (pendingDonation) {
      return res.status(400).json({
        message: 'You already have a pending donation. Please wait for approval.'
      });
    }

    const donationData = {
      donor: req.user._id,
      bloodGroup: req.body.bloodGroup || donor.bloodGroup,
      quantity: req.body.quantity || 450,
      donationDate: req.body.donationDate || new Date(),
      location: req.body.location,
      medicalScreening: req.body.medicalScreening || {},
      notes: req.body.notes
    };

    const donation = new Donation(donationData);
    await donation.save();

    // Populate donor information
    await donation.populate('donor', 'name email phone bloodGroup');

    res.status(201).json({
      message: 'Donation registered successfully',
      donation
    });

  } catch (error) {
    console.error('Create donation error:', error);
    res.status(500).json({
      message: 'Server error while creating donation',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/donations
// @desc    Get donations with filters
// @access  Private
router.get('/', [
  auth,
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('status').optional().isIn(['pending', 'approved', 'rejected', 'completed', 'expired']).withMessage('Invalid status'),
  query('bloodGroup').optional().isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).withMessage('Invalid blood group'),
  query('donorId').optional().isMongoId().withMessage('Invalid donor ID')
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
    
    if (req.query.status) filter.status = req.query.status;
    if (req.query.bloodGroup) filter.bloodGroup = req.query.bloodGroup;
    if (req.query.donorId) filter.donor = req.query.donorId;

    // If not admin, only show own donations
    if (req.user.role !== 'admin') {
      filter.donor = req.user._id;
    }

    // Get donations with pagination
    const donations = await Donation.find(filter)
      .populate('donor', 'name email phone bloodGroup')
      .populate('approvedBy', 'name')
      .sort({ donationDate: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Donation.countDocuments(filter);

    res.json({
      donations,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalDonations: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Get donations error:', error);
    res.status(500).json({
      message: 'Server error while fetching donations'
    });
  }
});

// @route   GET /api/donations/:id
// @desc    Get donation by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id)
      .populate('donor', 'name email phone bloodGroup address')
      .populate('approvedBy', 'name email');

    if (!donation) {
      return res.status(404).json({
        message: 'Donation not found'
      });
    }

    // Check if user can access this donation
    if (req.user.role !== 'admin' && req.user._id.toString() !== donation.donor._id.toString()) {
      return res.status(403).json({
        message: 'Access denied. You can only view your own donations.'
      });
    }

    res.json({ donation });

  } catch (error) {
    console.error('Get donation error:', error);
    res.status(500).json({
      message: 'Server error while fetching donation'
    });
  }
});

// @route   PUT /api/donations/:id
// @desc    Update donation (admin only)
// @access  Private/Admin
router.put('/:id', [
  auth,
  adminAuth,
  body('status').optional().isIn(['pending', 'approved', 'rejected', 'completed', 'expired']).withMessage('Invalid status'),
  body('rejectionReason').optional().isLength({ min: 1 }).withMessage('Rejection reason cannot be empty'),
  body('testResults.hiv').optional().isIn(['negative', 'positive', 'pending']).withMessage('Invalid HIV test result'),
  body('testResults.hepatitisB').optional().isIn(['negative', 'positive', 'pending']).withMessage('Invalid Hepatitis B test result'),
  body('testResults.hepatitisC').optional().isIn(['negative', 'positive', 'pending']).withMessage('Invalid Hepatitis C test result'),
  body('testResults.syphilis').optional().isIn(['negative', 'positive', 'pending']).withMessage('Invalid Syphilis test result')
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

    const donation = await Donation.findById(req.params.id).populate('donor');

    if (!donation) {
      return res.status(404).json({
        message: 'Donation not found'
      });
    }

    const allowedUpdates = ['status', 'testResults', 'medicalScreening', 'rejectionReason', 'notes'];
    const updates = {};

    // Only include allowed fields
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    // If approving donation, add approval info
    if (req.body.status === 'approved' && donation.status !== 'approved') {
      updates.approvedBy = req.user._id;
      updates.approvedAt = new Date();

      // Update donor's last donation date
      await User.findByIdAndUpdate(donation.donor._id, {
        'medicalInfo.lastDonationDate': donation.donationDate
      });

      // Add to blood stock
      try {
        let bloodStock = await BloodStock.findOne({ bloodGroup: donation.bloodGroup });
        if (!bloodStock) {
          bloodStock = new BloodStock({ bloodGroup: donation.bloodGroup });
        }
        await bloodStock.addStock(1, donation._id, req.user._id); // 1 unit per donation
      } catch (stockError) {
        console.error('Error updating blood stock:', stockError);
      }

      // Send approval email
      try {
        await sendDonationApprovedEmail(donation, donation.donor);
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
      }
    }

    // If rejecting, require rejection reason
    if (req.body.status === 'rejected' && !req.body.rejectionReason) {
      return res.status(400).json({
        message: 'Rejection reason is required when rejecting a donation'
      });
    }

    const updatedDonation = await Donation.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('donor', 'name email phone bloodGroup')
     .populate('approvedBy', 'name');

    res.json({
      message: 'Donation updated successfully',
      donation: updatedDonation
    });

  } catch (error) {
    console.error('Update donation error:', error);
    res.status(500).json({
      message: 'Server error while updating donation'
    });
  }
});

// @route   DELETE /api/donations/:id
// @desc    Delete donation
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({
        message: 'Donation not found'
      });
    }

    // Check if user can delete this donation
    if (req.user.role !== 'admin' && req.user._id.toString() !== donation.donor.toString()) {
      return res.status(403).json({
        message: 'Access denied. You can only delete your own donations.'
      });
    }

    // Only allow deletion of pending donations
    if (donation.status !== 'pending') {
      return res.status(400).json({
        message: 'Only pending donations can be deleted'
      });
    }

    await Donation.findByIdAndDelete(req.params.id);

    res.json({
      message: 'Donation deleted successfully'
    });

  } catch (error) {
    console.error('Delete donation error:', error);
    res.status(500).json({
      message: 'Server error while deleting donation'
    });
  }
});

// @route   GET /api/donations/stats/overview
// @desc    Get donation statistics
// @access  Private/Admin
router.get('/stats/overview', [auth, adminAuth], async (req, res) => {
  try {
    const stats = await Promise.all([
      // Donations by status
      Donation.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalQuantity: { $sum: '$quantity' }
          }
        }
      ]),

      // Donations by blood group
      Donation.aggregate([
        { $match: { status: 'approved' } },
        {
          $group: {
            _id: '$bloodGroup',
            count: { $sum: 1 },
            totalQuantity: { $sum: '$quantity' }
          }
        }
      ]),

      // Monthly donation trends (last 12 months)
      Donation.aggregate([
        {
          $match: {
            donationDate: { $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$donationDate' },
              month: { $month: '$donationDate' }
            },
            count: { $sum: 1 },
            totalQuantity: { $sum: '$quantity' }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]),

      // Top donors (by donation count)
      Donation.aggregate([
        { $match: { status: 'approved' } },
        {
          $group: {
            _id: '$donor',
            donationCount: { $sum: 1 },
            totalQuantity: { $sum: '$quantity' },
            lastDonation: { $max: '$donationDate' }
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
            totalQuantity: 1,
            lastDonation: 1
          }
        }
      ])
    ]);

    res.json({
      donationsByStatus: stats[0],
      donationsByBloodGroup: stats[1],
      monthlyTrends: stats[2],
      topDonors: stats[3]
    });

  } catch (error) {
    console.error('Get donation stats error:', error);
    res.status(500).json({
      message: 'Server error while fetching donation statistics'
    });
  }
});

// @route   GET /api/donations/pending/count
// @desc    Get count of pending donations (admin only)
// @access  Private/Admin
router.get('/pending/count', [auth, adminAuth], async (req, res) => {
  try {
    const pendingCount = await Donation.countDocuments({ status: 'pending' });
    
    res.json({
      pendingDonations: pendingCount
    });

  } catch (error) {
    console.error('Get pending donations count error:', error);
    res.status(500).json({
      message: 'Server error while fetching pending donations count'
    });
  }
});

// @route   POST /api/donations/:id/approve
// @desc    Quick approve donation (admin only)
// @access  Private/Admin
router.post('/:id/approve', [auth, adminAuth], async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id).populate('donor');

    if (!donation) {
      return res.status(404).json({
        message: 'Donation not found'
      });
    }

    if (donation.status !== 'pending') {
      return res.status(400).json({
        message: 'Only pending donations can be approved'
      });
    }

    // Update donation status
    donation.status = 'approved';
    donation.approvedBy = req.user._id;
    donation.approvedAt = new Date();

    await donation.save();

    // Update donor's last donation date
    await User.findByIdAndUpdate(donation.donor._id, {
      'medicalInfo.lastDonationDate': donation.donationDate
    });

    // Add to blood stock
    try {
      let bloodStock = await BloodStock.findOne({ bloodGroup: donation.bloodGroup });
      if (!bloodStock) {
        bloodStock = new BloodStock({ bloodGroup: donation.bloodGroup });
      }
      await bloodStock.addStock(1, donation._id, req.user._id);
    } catch (stockError) {
      console.error('Error updating blood stock:', stockError);
    }

    // Send approval email
    try {
      await sendDonationApprovedEmail(donation, donation.donor);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
    }

    await donation.populate('approvedBy', 'name');

    res.json({
      message: 'Donation approved successfully',
      donation
    });

  } catch (error) {
    console.error('Approve donation error:', error);
    res.status(500).json({
      message: 'Server error while approving donation'
    });
  }
});

module.exports = router;

