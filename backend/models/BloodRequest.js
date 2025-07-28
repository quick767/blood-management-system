const mongoose = require('mongoose');

const bloodRequestSchema = new mongoose.Schema({
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Requester is required']
  },
  patient: {
    name: {
      type: String,
      required: [true, 'Patient name is required'],
      trim: true
    },
    age: {
      type: Number,
      required: [true, 'Patient age is required'],
      min: [0, 'Age cannot be negative'],
      max: [120, 'Age cannot exceed 120']
    },
    gender: {
      type: String,
      required: [true, 'Patient gender is required'],
      enum: ['male', 'female', 'other']
    },
    bloodGroup: {
      type: String,
      required: [true, 'Patient blood group is required'],
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
    },
    weight: {
      type: Number,
      min: [1, 'Weight must be positive']
    },
    condition: {
      type: String,
      required: [true, 'Medical condition/reason is required']
    }
  },
  hospital: {
    name: {
      type: String,
      required: [true, 'Hospital name is required']
    },
    address: {
      street: String,
      city: {
        type: String,
        required: [true, 'Hospital city is required']
      },
      state: {
        type: String,
        required: [true, 'Hospital state is required']
      },
      zipCode: String
    },
    contactNumber: {
      type: String,
      required: [true, 'Hospital contact number is required']
    },
    contactPhone: {
      type: String
    },
    contactPerson: {
      type: String
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  bloodType: {
    type: String,
    required: [true, 'Blood type is required'],
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1 unit'],
    max: [10, 'Cannot request more than 10 units at once']
  },
  urgency: {
    type: String,
    required: [true, 'Urgency level is required'],
    enum: ['normal', 'urgent', 'critical', 'scheduled'],
    default: 'normal'
  },
  requiredBy: {
    type: Date,
    required: [true, 'Required by date is required'],
    validate: {
      validator: function(date) {
        return date > new Date();
      },
      message: 'Required by date must be in the future'
    }
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'partially_fulfilled', 'fulfilled', 'rejected', 'expired'],
    default: 'pending'
  },
  fulfillment: {
    unitsProvided: {
      type: Number,
      default: 0,
      min: [0, 'Units provided cannot be negative']
    },
    donations: [{
      donation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Donation'
      },
      units: {
        type: Number,
        min: [1, 'Units must be at least 1']
      },
      providedAt: {
        type: Date,
        default: Date.now
      }
    }],
    fulfilledAt: Date
  },
  priority: {
    type: Number,
    default: function() {
      const urgencyScores = { scheduled: 1, normal: 2, urgent: 3, critical: 4 };
      const timeScore = Math.max(1, 5 - Math.floor((this.requiredBy - Date.now()) / (24 * 60 * 60 * 1000)));
      return urgencyScores[this.urgency] * timeScore;
    }
  },
  doctorInfo: {
    name: {
      type: String,
      required: [true, 'Doctor name is required']
    },
    license: String,
    contact: String,
    signature: String // Base64 encoded signature
  },
  documents: [{
    type: {
      type: String,
      enum: ['prescription', 'medical_report', 'id_proof', 'other']
    },
    filename: String,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  notes: String,
  adminNotes: String,
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date,
  rejectionReason: String
}, {
  timestamps: true
});

// Indexes for efficient queries
bloodRequestSchema.index({ requester: 1, createdAt: -1 });
bloodRequestSchema.index({ bloodType: 1, status: 1, urgency: 1 });
bloodRequestSchema.index({ status: 1, requiredBy: 1 });
bloodRequestSchema.index({ priority: -1, createdAt: -1 });
bloodRequestSchema.index({ "hospital.coordinates": "2dsphere" });

// Check if request is expired
bloodRequestSchema.methods.isExpired = function() {
  return this.requiredBy < new Date() && this.status !== 'fulfilled';
};

// Calculate fulfillment percentage
bloodRequestSchema.methods.getFulfillmentPercentage = function() {
  return Math.round((this.fulfillment.unitsProvided / this.quantity) * 100);
};

// Check if request is fully fulfilled
bloodRequestSchema.methods.isFullyFulfilled = function() {
  return this.fulfillment.unitsProvided >= this.quantity;
};

// Auto-update status based on fulfillment and expiry
bloodRequestSchema.pre('save', function(next) {
  if (this.isExpired() && ['pending', 'approved', 'partially_fulfilled'].includes(this.status)) {
    this.status = 'expired';
  }
  
  if (this.isFullyFulfilled() && this.status !== 'fulfilled') {
    this.status = 'fulfilled';
    this.fulfillment.fulfilledAt = new Date();
  } else if (this.fulfillment.unitsProvided > 0 && this.fulfillment.unitsProvided < this.quantity) {
    this.status = 'partially_fulfilled';
  }
  
  next();
});

// Update priority before saving
bloodRequestSchema.pre('save', function(next) {
  const urgencyScores = { scheduled: 1, normal: 2, urgent: 3, critical: 4 };
  const daysUntilRequired = Math.max(1, Math.ceil((this.requiredBy - Date.now()) / (24 * 60 * 60 * 1000)));
  const timeScore = Math.max(1, 6 - daysUntilRequired);
  this.priority = urgencyScores[this.urgency] * timeScore;
  next();
});

module.exports = mongoose.model('BloodRequest', bloodRequestSchema);

