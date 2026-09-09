const Feedback = require('../models/Feedback');

// @desc    Submit feedback or review (About Page)
// @route   POST /api/feedback
// @access  Public (or Private with auth info)
exports.submitFeedback = async (req, res) => {
  try {
    const {
      userName,
      userEmail,
      type = 'app_review',
      category = 'Travel Experience',
      rating,
      comment,
      destination,
      hotelName,
      tripDate
    } = req.body;

    if (!comment || comment.trim().length < 5) {
      return res.status(400).json({
        success: false,
        message: 'Feedback comment must be at least 5 characters long'
      });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid rating between 1 and 5'
      });
    }

    const feedback = await Feedback.create({
      userId: req.user ? req.user.userId : null,
      userName: userName || (req.user ? req.user.name : 'Anonymous Traveler'),
      userEmail: userEmail || (req.user ? req.user.email : ''),
      type,
      category,
      rating: parseInt(rating, 10),
      destination,
      hotelName,
      tripDate,
      comment: comment.trim()
    });

    res.status(201).json({
      success: true,
      message: 'Thank you for your valuable feedback! It has been successfully recorded.',
      feedback
    });
  } catch (error) {
    console.error('Feedback submit error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to submit feedback'
    });
  }
};

// @desc    Get reviews and feedback metrics (About page display)
// @route   GET /api/feedback
// @access  Public
exports.getFeedbackAndReviews = async (req, res) => {
  try {
    const { type, category, limit = 20, page = 1 } = req.query;

    const query = { status: 'published' };
    if (type) query.type = type;
    if (category) query.category = category;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Feedback.countDocuments(query);
    const feedbacks = await Feedback.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Aggregate statistics
    const allPublished = await Feedback.find({ status: 'published' }).select('rating category');
    const totalCount = allPublished.length;

    let avgRating = 4.8;
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

    if (totalCount > 0) {
      const sum = allPublished.reduce((acc, f) => {
        const r = Math.min(5, Math.max(1, Math.round(f.rating)));
        distribution[r] = (distribution[r] || 0) + 1;
        return acc + f.rating;
      }, 0);
      avgRating = parseFloat((sum / totalCount).toFixed(1));
    } else {
      // Default initial baseline distribution for display
      distribution[5] = 42;
      distribution[4] = 8;
      distribution[3] = 2;
      distribution[2] = 1;
      distribution[1] = 0;
      avgRating = 4.8;
    }

    res.status(200).json({
      success: true,
      total: totalCount || total,
      avgRating,
      distribution,
      feedbacks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
