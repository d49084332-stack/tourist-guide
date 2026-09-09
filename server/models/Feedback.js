const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  userName: {
    type: String,
    required: true,
    trim: true
  },
  userEmail: {
    type: String
  },
  type: {
    type: String,
    enum: ['app_review', 'trip_review', 'general_feedback'],
    default: 'app_review'
  },
  category: {
    type: String,
    enum: [
      'Travel Experience',
      'Hotel Experience',
      'Route Accuracy',
      'App Usability',
      'Booking Experience',
      'Payment Experience',
      'Suggestions for Improvement',
      'Customer Support',
      'Other'
    ],
    default: 'Travel Experience'
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  destination: {
    type: String
  },
  hotelName: {
    type: String
  },
  tripDate: {
    type: String
  },
  comment: {
    type: String,
    required: true,
    trim: true,
    minlength: 5,
    maxlength: 1200
  },
  status: {
    type: String,
    enum: ['published', 'pending', 'hidden'],
    default: 'published'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Feedback', feedbackSchema);
