const express = require('express');
const { body, query, validationResult } = require('express-validator');
const BloodRequest = require('../models/BloodRequest');
const User = require('../models/User');
const BloodStock = require('../models/BloodStock');
const Donation = require('../models/Donation');
const { auth, adminAuth, requestRateLimit } = require('../middleware/auth');
const { sendRequestApprovedEmail, sendRequestFulfilledEmail } = require('../utils/email');

const router = express.Router();

// @route   POST /api/requests
// @desc    Create a new blood request
// @access  Private
router.post('/', [
  auth,
  requestRateLimit,
  body('patient.name').trim().isLength({ min: 2, max: 100 }).withMessage('Patient name must be between 2 and 100 characters'),
  body('patient.age').isInt({ min: 0, max: 120 }).withMessage('Patient age must be between 0 and 120'),
  body('patient.gender').isIn(['male', 'female', 'other']).withMessage('Invalid gender'),
  body('patient.condition').trim().isLength({ min: 5 }).withMessage('Medical condition must be at least 5 characters'),
  body('hospital.name').trim().isLength({ min: 2 }).withMessage('Hospital name is required'),
  body('hospital.address.city').trim().isLength({ min: 2 }).withMessage('Hospital city is required'),
  body('hospital.address.state').trim().isLength({ min: 2 }).withMessage('Hospital state is required'),
  body('hospital.contactPhone').optional().isLength({ min: 10 }).withMessage('Hospital contact must be valid'),
  body('bloodType').isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).withMessage('Invalid blood type'),
  body('quantity').isInt({ min: 1, max: 10 }).withMessage('Quantity must be between 1 and 10 units'),
  body('urgency').isIn(['normal', 'urgent', 'critical', 'scheduled']).withMessage('Invalid urgency level'),
  body('requiredBy').isISO8601().withMessage('Invalid required by date'),
  body('doctorInfo.name').trim().isLength({ min: 2 }).withMessage('Doctor name is required')
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

    // Validate required by date is in the future
    const requiredByDate = new Date(req.body.requiredBy);
    if (requiredByDate <= new Date()) {
      return res.status(400).json({
        message: 'Required by date must be in the future'
      });
    }

    // Check for duplicate active requests
    const existingRequest = await BloodRequest.findOne({
      requester: req.user._id,
      bloodType: req.body.bloodType,
      status: { $in: ['pending', 'approved', 'partially_fulfilled'] }
    });

    if (existingRequest) {
      return res.status(400).json({
        message: 'You already have an active request for this blood type'
      });
    }

    const requestData = {
      requester: req.user._id,
      patient: req.body.patient,
      hospital: req.body.hospital,
      bloodType: req.body.bloodType,
      quantity: req.body.quantity,
      urgency: req.body.urgency,
      requiredBy: requiredByDate,
      doctorInfo: req.body.doctorInfo,
      notes: req.body.notes
    };

    const bloodRequest = new BloodRequest(requestData);
    await bloodRequest.save();

    // Populate requester information
    await bloodRequest.populate('requester', 'name email phone');

    res.status(201).json({
      message: 'Blood request created successfully',
      request: bloodRequest
    });

  } catch (error) {
    console.error('Create blood request error:', error);
    res.status(500).json({
      message: 'Server error while creating blood request',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/requests
// @desc    Get blood requests with filters
// @access  Private
router.get('/', [
  auth,
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('status').optional().isIn(['pending', 'approved', 'partially_fulfilled', 'fulfilled', 'rejected', 'expired']).withMessage('Invalid status'),
  query('bloodType').optional().isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).withMessage('Invalid blood type'),
  query('urgency').optional().isIn(['normal', 'urgent', 'critical', 'scheduled']).withMessage('Invalid urgency'),
  query('requesterId').optional().isMongoId().withMessage('Invalid requester ID')
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
    if (req.query.bloodType) filter.bloodType = req.query.bloodType;
    if (req.query.urgency) filter.urgency = req.query.urgency;
    if (req.query.requesterId) filter.requester = req.query.requesterId;

    // If not admin, only show own requests
    if (req.user.role !== 'admin') {
      filter.requester = req.user._id;
    }

    // Get requests with pagination
    const requests = await BloodRequest.find(filter)
      .populate('requester', 'name email phone')
      .populate('approvedBy', 'name')
      .populate('fulfillment.donations.donation', 'donationDate bloodGroup quantity')
      .sort({ priority: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await BloodRequest.countDocuments(filter);

    res.json({
      requests,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalRequests: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Get blood requests error:', error);
    res.status(500).json({
      message: 'Server error while fetching blood requests'
    });
  }
});

// @route   GET /api/requests/requester/:requesterId
// @desc    Get requests by requester ID
// @access  Private
router.get('/requester/:requesterId', [auth], async (req, res) => {
  try {
    const requesterId = req.params.requesterId;
    
    // Check if user can access these requests
    if (req.user.role !== 'admin' && req.user._id.toString() !== requesterId) {
      return res.status(403).json({
        message: 'Access denied. You can only view your own requests.'
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = { requester: requesterId };
    
    if (req.query.status) filter.status = req.query.status;
    if (req.query.urgency) filter.urgency = req.query.urgency;
    if (req.query.dateFrom) filter.createdAt = { $gte: new Date(req.query.dateFrom) };
    if (req.query.dateTo) {
      filter.createdAt = filter.createdAt || {};
      filter.createdAt.$lte = new Date(req.query.dateTo);
    }
    if (req.query.search) {
      filter['patient.name'] = { $regex: req.query.search, $options: 'i' };
    }

    // Get requests with pagination
    const requests = await BloodRequest.find(filter)
      .populate('requester', 'name email phone')
      .populate('approvedBy', 'name')
      .populate('fulfillment.donations.donation', 'donationDate bloodGroup quantity')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await BloodRequest.countDocuments(filter);

    res.json({
      requests,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalRequests: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Get requester requests error:', error);
    res.status(500).json({
      message: 'Server error while fetching requester requests'
    });
  }
});

// @route   GET /api/requests/:id
// @desc    Get blood request by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const request = await BloodRequest.findById(req.params.id)
      .populate('requester', 'name email phone address')
      .populate('approvedBy', 'name email')
      .populate('fulfillment.donations.donation', 'donationDate bloodGroup quantity donor')
      .populate('fulfillment.donations.donation.donor', 'name bloodGroup');

    if (!request) {
      return res.status(404).json({
        message: 'Blood request not found'
      });
    }

    // Check if user can access this request
    if (req.user.role !== 'admin' && req.user._id.toString() !== request.requester._id.toString()) {
      return res.status(403).json({
        message: 'Access denied. You can only view your own requests.'
      });
    }

    res.json({ request });

  } catch (error) {
    console.error('Get blood request error:', error);
    res.status(500).json({
      message: 'Server error while fetching blood request'
    });
  }
});

// @route   PUT /api/requests/:id
// @desc    Update blood request
// @access  Private
router.put('/:id', [
  auth,
  body('urgency').optional().isIn(['normal', 'urgent', 'critical', 'scheduled']).withMessage('Invalid urgency level'),
  body('requiredBy').optional().isISO8601().withMessage('Invalid required by date'),
  body('status').optional().isIn(['pending', 'approved', 'partially_fulfilled', 'fulfilled', 'rejected', 'expired']).withMessage('Invalid status')
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

    const request = await BloodRequest.findById(req.params.id).populate('requester');

    if (!request) {
      return res.status(404).json({
        message: 'Blood request not found'
      });
    }

    // Check permissions
    const isOwner = req.user._id.toString() === request.requester._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        message: 'Access denied. You can only update your own requests.'
      });
    }

    // Determine allowed updates based on role and request status
    let allowedUpdates = [];
    
    if (isAdmin) {
      allowedUpdates = ['status', 'urgency', 'requiredBy', 'adminNotes', 'rejectionReason'];
      
      // If approving request
      if (req.body.status === 'approved' && request.status !== 'approved') {
        req.body.approvedBy = req.user._id;
        req.body.approvedAt = new Date();
        
        // Send approval email
        try {
          await sendRequestApprovedEmail(request, request.requester);
        } catch (emailError) {
          console.error('Email sending failed:', emailError);
        }
      }
      
      // If rejecting, require rejection reason
      if (req.body.status === 'rejected' && !req.body.rejectionReason) {
        return res.status(400).json({
          message: 'Rejection reason is required when rejecting a request'
        });
      }
    } else {
      // Regular users can only update certain fields if request is pending
      if (request.status === 'pending') {
        allowedUpdates = ['urgency', 'requiredBy', 'notes', 'hospital', 'doctorInfo'];
      } else {
        return res.status(400).json({
          message: 'You can only update pending requests'
        });
      }
    }

    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    // Validate required by date if provided
    if (updates.requiredBy) {
      const requiredByDate = new Date(updates.requiredBy);
      if (requiredByDate <= new Date()) {
        return res.status(400).json({
          message: 'Required by date must be in the future'
        });
      }
    }

    const updatedRequest = await BloodRequest.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('requester', 'name email phone')
     .populate('approvedBy', 'name');

    res.json({
      message: 'Blood request updated successfully',
      request: updatedRequest
    });

  } catch (error) {
    console.error('Update blood request error:', error);
    res.status(500).json({
      message: 'Server error while updating blood request'
    });
  }
});

// @route   DELETE /api/requests/:id
// @desc    Delete blood request
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const request = await BloodRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        message: 'Blood request not found'
      });
    }

    // Check if user can delete this request
    if (req.user.role !== 'admin' && req.user._id.toString() !== request.requester.toString()) {
      return res.status(403).json({
        message: 'Access denied. You can only delete your own requests.'
      });
    }

    // Only allow deletion of pending requests
    if (request.status !== 'pending') {
      return res.status(400).json({
        message: 'Only pending requests can be deleted'
      });
    }

    await BloodRequest.findByIdAndDelete(req.params.id);

    res.json({
      message: 'Blood request deleted successfully'
    });

  } catch (error) {
    console.error('Delete blood request error:', error);
    res.status(500).json({
      message: 'Server error while deleting blood request'
    });
  }
});

// @route   POST /api/requests/:id/fulfill
// @desc    Fulfill blood request (admin only)
// @access  Private/Admin
router.post('/:id/fulfill', [
  auth,
  adminAuth,
  body('donationIds').isArray({ min: 1 }).withMessage('At least one donation ID is required'),
  body('donationIds.*').isMongoId().withMessage('Invalid donation ID'),
  body('units').isArray({ min: 1 }).withMessage('Units array is required'),
  body('units.*').isInt({ min: 1 }).withMessage('Each unit must be at least 1')
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

    const { donationIds, units } = req.body;

    if (donationIds.length !== units.length) {
      return res.status(400).json({
        message: 'Donation IDs and units arrays must have the same length'
      });
    }

    const request = await BloodRequest.findById(req.params.id).populate('requester');

    if (!request) {
      return res.status(404).json({
        message: 'Blood request not found'
      });
    }

    if (!['approved', 'partially_fulfilled'].includes(request.status)) {
      return res.status(400).json({
        message: 'Only approved or partially fulfilled requests can be fulfilled'
      });
    }

    // Verify donations exist and are approved
    const donations = await Donation.find({
      _id: { $in: donationIds },
      bloodGroup: request.bloodType,
      status: 'approved'
    });

    if (donations.length !== donationIds.length) {
      return res.status(400).json({
        message: 'Some donations are not found or not approved'
      });
    }

    // Calculate total units being provided
    const totalUnitsProvided = units.reduce((sum, unit) => sum + unit, 0);
    const newTotalUnits = request.fulfillment.unitsProvided + totalUnitsProvided;

    if (newTotalUnits > request.quantity) {
      return res.status(400).json({
        message: 'Total units would exceed requested quantity'
      });
    }

    // Add fulfillment entries
    const fulfillmentEntries = donationIds.map((donationId, index) => ({
      donation: donationId,
      units: units[index],
      providedAt: new Date()
    }));

    request.fulfillment.donations.push(...fulfillmentEntries);
    request.fulfillment.unitsProvided = newTotalUnits;

    // Update blood stock
    try {
      const bloodStock = await BloodStock.findOne({ bloodGroup: request.bloodType });
      if (bloodStock) {
        await bloodStock.issueBlood(totalUnitsProvided, request._id, req.user._id);
      }
    } catch (stockError) {
      console.error('Error updating blood stock:', stockError);
    }

    await request.save();

    // Send fulfillment email if fully fulfilled
    if (request.status === 'fulfilled') {
      try {
        await sendRequestFulfilledEmail(request, request.requester);
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
      }
    }

    await request.populate('fulfillment.donations.donation', 'donationDate bloodGroup quantity');

    res.json({
      message: 'Blood request fulfilled successfully',
      request,
      unitsProvided: totalUnitsProvided,
      fulfillmentPercentage: request.getFulfillmentPercentage()
    });

  } catch (error) {
    console.error('Fulfill blood request error:', error);
    res.status(500).json({
      message: 'Server error while fulfilling blood request'
    });
  }
});

// @route   GET /api/requests/stats/overview
// @desc    Get blood request statistics
// @access  Private/Admin
router.get('/stats/overview', [auth, adminAuth], async (req, res) => {
  try {
    const stats = await Promise.all([
      // Requests by status
      BloodRequest.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalQuantity: { $sum: '$quantity' }
          }
        }
      ]),

      // Requests by blood type
      BloodRequest.aggregate([
        {
          $group: {
            _id: '$bloodType',
            count: { $sum: 1 },
            totalQuantity: { $sum: '$quantity' },
            fulfilled: { $sum: { $cond: [{ $eq: ['$status', 'fulfilled'] }, 1, 0] } }
          }
        }
      ]),

      // Requests by urgency
      BloodRequest.aggregate([
        {
          $group: {
            _id: '$urgency',
            count: { $sum: 1 },
            avgFulfillmentTime: {
              $avg: {
                $cond: [
                  { $eq: ['$status', 'fulfilled'] },
                  { $subtract: ['$fulfillment.fulfilledAt', '$createdAt'] },
                  null
                ]
              }
            }
          }
        }
      ]),

      // Monthly request trends (last 12 months)
      BloodRequest.aggregate([
        {
          $match: {
            createdAt: { $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            count: { $sum: 1 },
            totalQuantity: { $sum: '$quantity' },
            fulfilled: { $sum: { $cond: [{ $eq: ['$status', 'fulfilled'] }, 1, 0] } }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ])
    ]);

    res.json({
      requestsByStatus: stats[0],
      requestsByBloodType: stats[1],
      requestsByUrgency: stats[2],
      monthlyTrends: stats[3]
    });

  } catch (error) {
    console.error('Get request stats error:', error);
    res.status(500).json({
      message: 'Server error while fetching request statistics'
    });
  }
});

// @route   GET /api/requests/pending/count
// @desc    Get count of pending requests (admin only)
// @access  Private/Admin
router.get('/pending/count', [auth, adminAuth], async (req, res) => {
  try {
    const pendingCount = await BloodRequest.countDocuments({ status: 'pending' });
    const criticalCount = await BloodRequest.countDocuments({ 
      status: { $in: ['pending', 'approved'] },
      urgency: 'critical'
    });
    
    res.json({
      pendingRequests: pendingCount,
      criticalRequests: criticalCount
    });

  } catch (error) {
    console.error('Get pending requests count error:', error);
    res.status(500).json({
      message: 'Server error while fetching pending requests count'
    });
  }
});

module.exports = router;

