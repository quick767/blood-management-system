const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Donor is required']
  },
  bloodGroup: {
    type: String,
    required: [true, 'Blood group is required'],
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [350, 'Minimum donation is 350ml'],
    max: [500, 'Maximum donation is 500ml'],
    default: 450
  },
  donationDate: {
    type: Date,
    required: [true, 'Donation date is required'],
    default: Date.now
  },
  location: {
    center: {
      type: String,
      required: [true, 'Donation center is required']
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'completed', 'expired'],
    default: 'pending'
  },
  medicalScreening: {
    hemoglobin: {
      type: Number,
      min: [12.5, 'Hemoglobin level too low'],
      max: [20, 'Hemoglobin level too high']
    },
    bloodPressure: {
      systolic: {
        type: Number,
        min: [90, 'Systolic pressure too low'],
        max: [180, 'Systolic pressure too high']
      },
      diastolic: {
        type: Number,
        min: [60, 'Diastolic pressure too low'],
        max: [100, 'Diastolic pressure too high']
      }
    },
    temperature: {
      type: Number,
      min: [36, 'Temperature too low'],
      max: [37.5, 'Temperature too high']
    },
    weight: {
      type: Number,
      min: [45, 'Weight too low for donation']
    },
    pulse: {
      type: Number,
      min: [50, 'Pulse too low'],
      max: [100, 'Pulse too high']
    }
  },
  testResults: {
    hiv: {
      type: String,
      enum: ['negative', 'positive', 'pending'],
      default: 'pending'
    },
    hepatitisB: {
      type: String,
      enum: ['negative', 'positive', 'pending'],
      default: 'pending'
    },
    hepatitisC: {
      type: String,
      enum: ['negative', 'positive', 'pending'],
      default: 'pending'
    },
    syphilis: {
      type: String,
      enum: ['negative', 'positive', 'pending'],
      default: 'pending'
    }
  },
  expiryDate: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 35 * 24 * 60 * 60 * 1000); // 35 days from donation
    }
  },
  notes: String,
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date,
  rejectionReason: String
}, {
  timestamps: true
});

// Index for efficient queries
donationSchema.index({ donor: 1, donationDate: -1 });
donationSchema.index({ bloodGroup: 1, status: 1 });
donationSchema.index({ status: 1, expiryDate: 1 });
donationSchema.index({ "location.coordinates": "2dsphere" });

// Check if donation is expired
donationSchema.methods.isExpired = function() {
  return this.expiryDate < new Date();
};

// Check if all tests are negative
donationSchema.methods.isTestClear = function() {
  const tests = this.testResults;
  return tests.hiv === 'negative' && 
         tests.hepatitisB === 'negative' && 
         tests.hepatitisC === 'negative' && 
         tests.syphilis === 'negative';
};

// Auto-update status based on test results and expiry
donationSchema.pre('save', function(next) {
  if (this.isExpired() && this.status === 'approved') {
    this.status = 'expired';
  }
  
  if (this.status === 'pending' && this.isTestClear() && this.medicalScreening.hemoglobin) {
    this.status = 'approved';
    this.approvedAt = new Date();
  }
  
  next();
});

module.exports = mongoose.model('Donation', donationSchema);

