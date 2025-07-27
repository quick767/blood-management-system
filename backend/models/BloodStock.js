const mongoose = require('mongoose');

const bloodStockSchema = new mongoose.Schema({
  bloodGroup: {
    type: String,
    required: [true, 'Blood group is required'],
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    unique: true
  },
  totalUnits: {
    type: Number,
    required: [true, 'Total units is required'],
    min: [0, 'Total units cannot be negative'],
    default: 0
  },
  availableUnits: {
    type: Number,
    required: [true, 'Available units is required'],
    min: [0, 'Available units cannot be negative'],
    default: 0
  },
  reservedUnits: {
    type: Number,
    default: 0,
    min: [0, 'Reserved units cannot be negative']
  },
  expiredUnits: {
    type: Number,
    default: 0,
    min: [0, 'Expired units cannot be negative']
  },
  usedUnits: {
    type: Number,
    default: 0,
    min: [0, 'Used units cannot be negative']
  },
  minimumThreshold: {
    type: Number,
    default: 10,
    min: [0, 'Minimum threshold cannot be negative']
  },
  criticalThreshold: {
    type: Number,
    default: 5,
    min: [0, 'Critical threshold cannot be negative']
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  lastDonationDate: Date,
  lastRequestDate: Date,
  stockHistory: [{
    date: {
      type: Date,
      default: Date.now
    },
    action: {
      type: String,
      enum: ['donation_added', 'blood_issued', 'expired_removed', 'manual_adjustment'],
      required: true
    },
    quantity: {
      type: Number,
      required: true
    },
    previousStock: Number,
    newStock: Number,
    reference: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'stockHistory.referenceModel'
    },
    referenceModel: {
      type: String,
      enum: ['Donation', 'BloodRequest', 'User']
    },
    notes: String,
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  alerts: [{
    type: {
      type: String,
      enum: ['low_stock', 'critical_stock', 'expired_units', 'high_demand'],
      required: true
    },
    message: String,
    isActive: {
      type: Boolean,
      default: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    acknowledgedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    acknowledgedAt: Date
  }]
}, {
  timestamps: true
});

// Indexes for efficient queries
bloodStockSchema.index({ bloodGroup: 1 });
bloodStockSchema.index({ availableUnits: 1 });
bloodStockSchema.index({ lastUpdated: -1 });

// Virtual for stock status
bloodStockSchema.virtual('stockStatus').get(function() {
  if (this.availableUnits <= this.criticalThreshold) {
    return 'critical';
  } else if (this.availableUnits <= this.minimumThreshold) {
    return 'low';
  } else if (this.availableUnits > this.minimumThreshold * 2) {
    return 'good';
  } else {
    return 'adequate';
  }
});

// Method to add stock from donation
bloodStockSchema.methods.addStock = function(quantity, donationId, performedBy) {
  const previousStock = this.availableUnits;
  this.availableUnits += quantity;
  this.totalUnits += quantity;
  this.lastUpdated = new Date();
  this.lastDonationDate = new Date();
  
  // Add to history
  this.stockHistory.push({
    action: 'donation_added',
    quantity: quantity,
    previousStock: previousStock,
    newStock: this.availableUnits,
    reference: donationId,
    referenceModel: 'Donation',
    performedBy: performedBy
  });
  
  // Remove low stock alerts if stock is now adequate
  if (this.availableUnits > this.minimumThreshold) {
    this.alerts.forEach(alert => {
      if (['low_stock', 'critical_stock'].includes(alert.type) && alert.isActive) {
        alert.isActive = false;
      }
    });
  }
  
  return this.save();
};

// Method to issue blood for request
bloodStockSchema.methods.issueBlood = function(quantity, requestId, performedBy) {
  if (this.availableUnits < quantity) {
    throw new Error('Insufficient stock available');
  }
  
  const previousStock = this.availableUnits;
  this.availableUnits -= quantity;
  this.usedUnits += quantity;
  this.lastUpdated = new Date();
  this.lastRequestDate = new Date();
  
  // Add to history
  this.stockHistory.push({
    action: 'blood_issued',
    quantity: -quantity,
    previousStock: previousStock,
    newStock: this.availableUnits,
    reference: requestId,
    referenceModel: 'BloodRequest',
    performedBy: performedBy
  });
  
  // Check for low stock alerts
  this.checkAndCreateAlerts();
  
  return this.save();
};

// Method to remove expired units
bloodStockSchema.methods.removeExpiredUnits = function(quantity, performedBy, notes) {
  const previousStock = this.availableUnits;
  this.availableUnits = Math.max(0, this.availableUnits - quantity);
  this.expiredUnits += quantity;
  this.lastUpdated = new Date();
  
  // Add to history
  this.stockHistory.push({
    action: 'expired_removed',
    quantity: -quantity,
    previousStock: previousStock,
    newStock: this.availableUnits,
    performedBy: performedBy,
    notes: notes || 'Expired units removed'
  });
  
  // Check for low stock alerts
  this.checkAndCreateAlerts();
  
  return this.save();
};

// Method to manually adjust stock
bloodStockSchema.methods.adjustStock = function(newQuantity, performedBy, notes) {
  const previousStock = this.availableUnits;
  const difference = newQuantity - this.availableUnits;
  
  this.availableUnits = newQuantity;
  this.totalUnits += difference;
  this.lastUpdated = new Date();
  
  // Add to history
  this.stockHistory.push({
    action: 'manual_adjustment',
    quantity: difference,
    previousStock: previousStock,
    newStock: this.availableUnits,
    performedBy: performedBy,
    notes: notes || 'Manual stock adjustment'
  });
  
  // Check for alerts
  this.checkAndCreateAlerts();
  
  return this.save();
};

// Method to check and create alerts
bloodStockSchema.methods.checkAndCreateAlerts = function() {
  const now = new Date();
  
  // Remove old alerts of the same type
  this.alerts = this.alerts.filter(alert => 
    !['low_stock', 'critical_stock'].includes(alert.type) || !alert.isActive
  );
  
  if (this.availableUnits <= this.criticalThreshold) {
    this.alerts.push({
      type: 'critical_stock',
      message: `Critical stock alert: Only ${this.availableUnits} units of ${this.bloodGroup} blood remaining`,
      createdAt: now
    });
  } else if (this.availableUnits <= this.minimumThreshold) {
    this.alerts.push({
      type: 'low_stock',
      message: `Low stock alert: Only ${this.availableUnits} units of ${this.bloodGroup} blood remaining`,
      createdAt: now
    });
  }
};

// Static method to initialize all blood groups
bloodStockSchema.statics.initializeAllBloodGroups = async function() {
  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  
  for (const bloodGroup of bloodGroups) {
    await this.findOneAndUpdate(
      { bloodGroup },
      { 
        bloodGroup,
        $setOnInsert: {
          totalUnits: 0,
          availableUnits: 0,
          reservedUnits: 0,
          expiredUnits: 0,
          usedUnits: 0,
          minimumThreshold: 10,
          criticalThreshold: 5
        }
      },
      { upsert: true, new: true }
    );
  }
};

// Pre-save middleware to validate stock consistency
bloodStockSchema.pre('save', function(next) {
  // Ensure available units don't exceed total units
  if (this.availableUnits > this.totalUnits) {
    this.totalUnits = this.availableUnits;
  }
  
  // Ensure critical threshold is less than minimum threshold
  if (this.criticalThreshold >= this.minimumThreshold) {
    this.criticalThreshold = Math.max(0, this.minimumThreshold - 1);
  }
  
  this.lastUpdated = new Date();
  next();
});

module.exports = mongoose.model('BloodStock', bloodStockSchema);

