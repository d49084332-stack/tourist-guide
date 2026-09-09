const Review = require('../models/Review');
const Destination = require('../models/Destination');

// @desc    Create review
// @route   POST /api/reviews
// @access  Private
exports.createReview = async (req, res) => {
  try {
    const { destinationId, rating, comment } = req.body;
    const userId = req.user.userId;

    // Check if destination exists
    const destination = await Destination.findById(destinationId);
    if (!destination) {
      return res.status(404).json({
        success: false,
        message: 'Destination not found'
      });
    }

    // Check if user already reviewed this destination
    const existingReview = await Review.findOne({ userId, destinationId });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this destination'
      });
    }

    const review = await Review.create({
      userId,
      destinationId,
      rating,
      comment
    });

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      review
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get reviews for destination
// @route   GET /api/reviews/:destinationId
// @access  Public
exports.getReviews = async (req, res) => {
  try {
    const { destinationId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const reviews = await Review.find({ destinationId: destinationId })
      .populate('userId', 'name avatar')
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Review.countDocuments({ destinationId });

    res.status(200).json({
      success: true,
      count: reviews.length,
      total,
      pages: Math.ceil(total / parseInt(limit)),
      reviews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private
exports.updateReview = async (req, res) => {
  try {
    let review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if user owns the review
    if (review.userId.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this review'
      });
    }

    review = await Review.findByIdAndUpdate(
      req.params.id,
      { rating: req.body.rating, comment: req.body.comment },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Review updated successfully',
      review
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if user owns the review or is admin
    if (review.userId.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this review'
      });
    }

    await Review.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get user's review for a destination
// @route   GET /api/reviews/user/:destinationId
// @access  Private
exports.getUserReview = async (req, res) => {
  try {
    const { destinationId } = req.params;
    const userId = req.user.userId;

    const review = await Review.findOne({ userId, destinationId });

    res.status(200).json({
      success: true,
      review: review || null
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
