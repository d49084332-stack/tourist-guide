const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomType: {
    type: String,
    required: true,
    enum: ['Standard Room', 'Deluxe Room', 'Super Deluxe', 'Executive Suite', 'Presidential Suite', 'Family Suite', 'Heritage Villa']
  },
  roomImage: {
    type: String,
    default: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800'
  },
  description: {
    type: String,
    default: 'Comfortable air-conditioned room with modern amenities, premium bedding, and scenic view.'
  },
  maxGuests: {
    type: Number,
    default: 2,
    min: 1
  },
  facilities: [{
    type: String
  }],
  pricePerNight: {
    type: Number,
    required: true,
    min: 0
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  totalRooms: {
    type: Number,
    default: 5
  }
});

const hotelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Hotel name is required'],
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  shortDescription: {
    type: String
  },
  category: {
    type: String,
    default: 'Hotel'
  },
  city: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  location: {
    address: {
      type: String,
      required: true
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  images: [{
    url: String,
    alt: String
  }],
  rating: {
    type: Number,
    default: 4.5,
    min: 0,
    max: 5
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  priceRange: {
    type: String,
    enum: ['Budget', 'Mid-range', 'Luxury', 'Heritage'],
    default: 'Mid-range'
  },
  facilities: [{
    type: String
  }],
  contactPhone: {
    type: String,
    default: '+91 98765 43210'
  },
  contactEmail: {
    type: String,
    default: 'stay@touristguide.com'
  },
  rooms: [roomSchema],
  nearHighway: {
    type: String
  },
  nearDestination: {
    type: String
  },
  featured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

hotelSchema.index({ 'location.coordinates': '2dsphere' });

module.exports = mongoose.model('Hotel', hotelSchema);
