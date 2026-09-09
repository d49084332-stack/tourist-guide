const User = require('../models/User');

// @desc    Get user profile
// @route   GET /api/user/profile
// @access  Private
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .populate('favoriteDestinations');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/user/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { name, avatar } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { name, avatar },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update user preferences
// @route   PUT /api/user/preferences
// @access  Private
exports.updatePreferences = async (req, res) => {
  try {
    const { interests, budget, travelStyle, preferredActivities, preferredLocations, tripDuration } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      {
        preferences: {
          interests,
          budget,
          travelStyle,
          preferredActivities,
          preferredLocations,
          tripDuration
        }
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Preferences updated successfully',
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Add to search history
// @route   POST /api/user/search-history
// @access  Private
exports.addSearchHistory = async (req, res) => {
  try {
    const { query } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      {
        $push: {
          searchHistory: {
            query,
            timestamp: new Date()
          }
        }
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Search history updated'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get search history
// @route   GET /api/user/search-history
// @access  Private
exports.getSearchHistory = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    res.status(200).json({
      success: true,
      searchHistory: user.searchHistory.reverse().slice(0, 20)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
