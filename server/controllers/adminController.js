const User = require('../models/User');
const Destination = require('../models/Destination');
const Review = require('../models/Review');
const Recommendation = require('../models/Recommendation');
const TravelPlan = require('../models/TravelPlan');
const Favorite = require('../models/Favorite');

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private/Admin
exports.getDashboard = async (req, res) => {
  try {
    // Get statistics
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalDestinations = await Destination.countDocuments();
    const totalReviews = await Review.countDocuments();
    const totalRecommendations = await Recommendation.countDocuments();
    const totalFavorites = await Favorite.countDocuments();
    const totalTravelPlans = await TravelPlan.countDocuments();

    // Get most viewed destinations
    const mostViewed = await Destination.find()
      .sort('-viewCount')
      .limit(5);

    // Get top-rated destinations
    const topRated = await Destination.find()
      .sort('-rating')
      .limit(5);

    // Get recent users
    const recentUsers = await User.find({ role: 'user' })
      .sort('-createdAt')
      .limit(10)
      .select('name email avatar createdAt');

    // Get average rating
    const reviews = await Review.aggregate([
      { $group: { _id: null, avgRating: { $avg: '$rating' } } }
    ]);
    const averageRating = reviews.length > 0 ? reviews[0].avgRating.toFixed(2) : 0;

    // Get popular categories
    const popularCategories = await Destination.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    res.status(200).json({
      success: true,
      statistics: {
        totalUsers,
        totalDestinations,
        totalReviews,
        totalRecommendations,
        totalFavorites,
        totalTravelPlans,
        averageRating
      },
      mostViewed,
      topRated,
      recentUsers,
      popularCategories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;

    let filter = { role: 'user' };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const users = await User.find(filter)
      .select('-password')
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      pages: Math.ceil(total / parseInt(limit)),
      users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get user details
// @route   GET /api/admin/users/:id
// @access  Private/Admin
exports.getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('favoriteDestinations');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user statistics
    const favoriteCount = await Favorite.countDocuments({ userId: user._id });
    const reviewCount = await Review.countDocuments({ userId: user._id });
    const recommendationCount = await Recommendation.countDocuments({ userId: user._id });
    const travelPlanCount = await TravelPlan.countDocuments({ userId: user._id });

    res.status(200).json({
      success: true,
      user: {
        ...user.toObject(),
        stats: {
          favoriteCount,
          reviewCount,
          recommendationCount,
          travelPlanCount
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all feedback/reviews
// @route   GET /api/admin/feedback
// @access  Private/Admin
exports.getFeedback = async (req, res) => {
  try {
    const { page = 1, limit = 20, rating } = req.query;

    let filter = {};
    if (rating) {
      filter.rating = parseInt(rating);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const reviews = await Review.find(filter)
      .populate('userId', 'name email avatar')
      .populate('destinationId', 'name')
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Review.countDocuments(filter);

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

// @desc    Delete inappropriate feedback
// @route   DELETE /api/admin/feedback/:id
// @access  Private/Admin
exports.deleteFeedback = async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

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

// @desc    Get all destinations
// @route   GET /api/admin/destinations
// @access  Private/Admin
exports.getAllDestinations = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, category } = req.query;

    let filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (category) {
      filter.category = category;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const destinations = await Destination.find(filter)
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Destination.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: destinations.length,
      total,
      pages: Math.ceil(total / parseInt(limit)),
      destinations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get recommendations data
// @route   GET /api/admin/recommendations
// @access  Private/Admin
exports.getRecommendationsData = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const recommendations = await Recommendation.find()
      .populate('userId', 'name email')
      .populate('destinationId', 'name')
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Recommendation.countDocuments();

    // Get recommendation statistics
    const topDestinations = await Recommendation.aggregate([
      { $group: { _id: '$destinationId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $lookup: { from: 'destinations', localField: '_id', foreignField: '_id', as: 'destination' } }
    ]);

    res.status(200).json({
      success: true,
      count: recommendations.length,
      total,
      pages: Math.ceil(total / parseInt(limit)),
      recommendations,
      topRecommendedDestinations: topDestinations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
