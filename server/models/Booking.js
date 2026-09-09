const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  bookingId: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  hotelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
    required: false,
    default: null
  },
  hotelName: {
    type: String,
    required: true
  },
  hotelAddress: {
    type: String,
    required: true
  },
  hotelCity: {
    type: String
  },
  hotelImage: {
    type: String
  },
  roomType: {
    type: String,
    required: true
  },
  roomPricePerNight: {
    type: Number,
    required: true
  },
  checkInDate: {
    type: Date,
    required: true
  },
  checkOutDate: {
    type: Date,
    required: true
  },
  guests: {
    type: Number,
    required: true,
    default: 1
  },
  roomsCount: {
    type: Number,
    required: true,
    default: 1
  },
  nights: {
    type: Number,
    required: true,
    default: 1
  },
  roomCost: {
    type: Number,
    required: true
  },
  taxAmount: {
    type: Number,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['PhonePe', 'Google Pay', 'QR Code', 'Credit Card', 'Debit Card'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed', 'Refunded'],
    default: 'Completed'
  },
  transactionId: {
    type: String,
    required: true
  },
  bookingStatus: {
    type: String,
    enum: ['Confirmed', 'Completed', 'Cancelled'],
    default: 'Confirmed'
  },
  specialRequests: {
    type: String
  },
  guestDetails: {
    fullName: String,
    email: String,
    phone: String
  },
  isCompletedTrip: {
    type: Boolean,
    default: false
  },
  tripSummary: {
    type: String
  },
  placesVisited: [{
    type: String
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Booking', bookingSchema);
