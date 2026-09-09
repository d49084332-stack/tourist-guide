const Favorite = require('../models/Favorite');
const Destination = require('../models/Destination');
const User = require('../models/User');

// @desc    Add favorite destination
// @route   POST /api/favorites/:destinationId
// @access  Private
exports.addFavorite = async (req, res) => {
  try {
    const { destinationId } = req.params;
    const userId = req.user.userId;

    // Check if destination exists
    const destination = await Destination.findById(destinationId);
    if (!destination) {
      return res.status(404).json({
        success: false,
        message: 'Destination not found'
      });
    }

    // Check if already favorited
    const existing = await Favorite.findOne({ userId, destinationId });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Already added to favorites'
      });
    }

    // Create favorite
    const favorite = await Favorite.create({ userId, destinationId });

    // Add to user's favorite destinations
    await User.findByIdAndUpdate(
      userId,
      { $push: { favoriteDestinations: destinationId } }
    );

    res.status(201).json({
      success: true,
      message: 'Added to favorites',
      favorite
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Remove favorite destination
// @route   DELETE /api/favorites/:destinationId
// @access  Private
exports.removeFavorite = async (req, res) => {
  try {
    const { destinationId } = req.params;
    const userId = req.user.userId;

    const favorite = await Favorite.findOneAndDelete({ userId, destinationId });

    if (!favorite) {
      return res.status(404).json({
        success: false,
        message: 'Favorite not found'
      });
    }

    // Remove from user's favorite destinations
    await User.findByIdAndUpdate(
      userId,
      { $pull: { favoriteDestinations: destinationId } }
    );

    res.status(200).json({
      success: true,
      message: 'Removed from favorites'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get user's favorites
// @route   GET /api/favorites
// @access  Private
exports.getFavorites = async (req, res) => {
  try {
    const userId = req.user.userId;

    const favorites = await Favorite.find({ userId })
      .populate('destinationId')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: favorites.length,
      favorites: favorites.map(fav => fav.destinationId)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Check if destination is favorited
// @route   GET /api/favorites/check/:destinationId
// @access  Private
exports.checkFavorite = async (req, res) => {
  try {
    const { destinationId } = req.params;
    const userId = req.user.userId;

    const favorite = await Favorite.findOne({ userId, destinationId });

    res.status(200).json({
      success: true,
      isFavorited: !!favorite
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
