const mongoose = require('mongoose');

const travelPlanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Trip name is required'],
    trim: true
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  destinations: [{
    destinationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Destination'
    },
    visitDate: Date,
    duration: String,
    notes: String
  }],
  totalBudget: {
    type: Number,
    min: 0
  },
  budget: {
    type: String,
    enum: ['Budget', 'Mid-range', 'Premium', 'Luxury']
  },
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('TravelPlan', travelPlanSchema);
