const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  destinationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Destination',
    required: true
  },
  rating: {
    type: Number,
    required: [true, 'Please provide a rating'],
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: [true, 'Please provide a comment'],
    minlength: [10, 'Comment must be at least 10 characters'],
    maxlength: [1000, 'Comment must not exceed 1000 characters']
  },
  helpful: {
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

// Index for unique review per user per destination
reviewSchema.index({ userId: 1, destinationId: 1 }, { unique: true });

// Post-save middleware to update destination rating
reviewSchema.post('save', async function() {
  const Review = mongoose.model('Review', reviewSchema);
  const Destination = mongoose.model('Destination');
  
  const reviews = await Review.find({ destinationId: this.destinationId });
  
  if (reviews.length > 0) {
    const avgRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
    await Destination.findByIdAndUpdate(
      this.destinationId,
      {
        rating: avgRating,
        reviewCount: reviews.length
      }
    );
  }
});

module.exports = mongoose.model('Review', reviewSchema);
