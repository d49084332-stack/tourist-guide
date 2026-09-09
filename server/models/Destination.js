const mongoose = require('mongoose');

const destinationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Destination name is required'],
    trim: true
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  shortDescription: {
    type: String,
    maxlength: 200
  },
  country: {
    type: String,
    default: 'India'
  },
  state: {
    type: String,
    required: [true, 'State is required']
  },
  city: String,
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: [Number], // [longitude, latitude]
    address: String
  },
  images: [{
    url: String,
    alt: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  category: {
    type: String,
    enum: ['Beach', 'Hill Station', 'Historical', 'Religious', 'Adventure', 'Wildlife', 'Nature', 'Heritage', 'Cultural', 'Family', 'Shopping', 'Food', 'Waterfalls'],
    required: true
  },
  activities: [String],
  bestTimeToVisit: String,
  estimatedBudget: {
    type: String,
    enum: ['Budget', 'Mid-range', 'Premium', 'Luxury']
  },
  duration: String,
  facilities: [String],
  travelTips: String,
  nearbyPlaces: [String],
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  featured: {
    type: Boolean,
    default: false
  },
  popular: {
    type: Boolean,
    default: false
  },
  viewCount: {
    type: Number,
    default: 0
  },
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

// Create geospatial index
destinationSchema.index({ 'location': '2dsphere' });

// Pre-save middleware to create slug
destinationSchema.pre('save', function(next) {
  if (!this.slug) {
    this.slug = this.name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '');
  }
  next();
});

module.exports = mongoose.model('Destination', destinationSchema);
