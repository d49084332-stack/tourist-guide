const axios = require('axios');
const Recommendation = require('../models/Recommendation');
const User = require('../models/User');
const Destination = require('../models/Destination');

// AI Recommendation Service
class RecommendationService {
  static async generateRecommendations(userId) {
    try {
      // Get user data
      const user = await User.findById(userId)
        .populate('favoriteDestinations')
        .populate('viewedDestinations.destinationId');

      if (!user) {
        throw new Error('User not found');
      }

      // Get all destinations
      const allDestinations = await Destination.find();

      // Calculate recommendation scores
      const recommendations = this.calculateScores(user, allDestinations);

      // Sort by score and get top 5
      const topRecommendations = recommendations
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);

      // Save recommendations to database
      for (const rec of topRecommendations) {
        await Recommendation.findOneAndUpdate(
          { userId, destinationId: rec.destination._id },
          {
            score: rec.score,
            reason: rec.reason,
            matchedInterests: rec.matchedInterests,
            matchedActivities: rec.matchedActivities
          },
          { upsert: true }
        );
      }

      return topRecommendations;
    } catch (error) {
      throw error;
    }
  }

  static calculateScores(user, destinations) {
    return destinations.map(destination => {
      let score = 0;
      const matchedInterests = [];
      const matchedActivities = [];

      // Interest matching (30 points)
      if (user.preferences.interests && user.preferences.interests.length > 0) {
        const categoryMatches = user.preferences.interests.filter(
          interest => destination.category.toLowerCase().includes(interest.toLowerCase())
        );
        const pointPerMatch = 30 / user.preferences.interests.length;
        score += categoryMatches.length * pointPerMatch;
        matchedInterests.push(...categoryMatches);
      }

      // Activity matching (25 points)
      if (user.preferences.preferredActivities && destination.activities) {
        const activityMatches = destination.activities.filter(
          activity => user.preferences.preferredActivities.some(
            pref => pref.toLowerCase().includes(activity.toLowerCase()) ||
                     activity.toLowerCase().includes(pref.toLowerCase())
          )
        );
        const pointPerActivity = 25 / Math.max(user.preferences.preferredActivities.length, 1);
        score += activityMatches.length * pointPerActivity;
        matchedActivities.push(...activityMatches);
      }

      // Budget matching (20 points)
      if (user.preferences.budget && destination.estimatedBudget) {
        if (user.preferences.budget === destination.estimatedBudget) {
          score += 20;
        }
      }

      // Location preference matching (15 points)
      if (user.preferences.preferredLocations && user.preferences.preferredLocations.length > 0) {
        const locationMatch = user.preferences.preferredLocations.some(
          location => destination.state.toLowerCase().includes(location.toLowerCase()) ||
                      destination.city.toLowerCase().includes(location.toLowerCase())
        );
        if (locationMatch) {
          score += 15;
        }
      }

      // Rating bonus (10 points)
      if (destination.rating >= 4) {
        score += 10;
      }

      // Search history match (bonus 5 points)
      if (user.searchHistory && user.searchHistory.length > 0) {
        const searchMatches = user.searchHistory.filter(search =>
          destination.name.toLowerCase().includes(search.query.toLowerCase()) ||
          destination.description.toLowerCase().includes(search.query.toLowerCase())
        );
        if (searchMatches.length > 0) {
          score += 5;
        }
      }

      // Avoid already favorited destinations (reduce score)
      const isFavorited = user.favoriteDestinations.some(
        fav => fav._id.toString() === destination._id.toString()
      );
      if (isFavorited) {
        score *= 0.5; // Half the score for already favorited
      }

      return {
        destination,
        score: Math.min(100, score),
        reason: `Based on your interests in ${destination.category} and ${matchedActivities.join(', ') || 'various activities'}`,
        matchedInterests,
        matchedActivities
      };
    });
  }
}

// @desc    Get AI recommendations for user
// @route   GET /api/recommendations
// @access  Private
exports.getRecommendations = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { limit = 5 } = req.query;

    const recommendations = await Recommendation.find({ userId })
      .populate('destinationId')
      .sort('-score')
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: recommendations.length,
      recommendations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Generate new recommendations
// @route   POST /api/recommendations/generate
// @access  Private
exports.generateRecommendations = async (req, res) => {
  try {
    const userId = req.user.userId;

    const recommendations = await RecommendationService.generateRecommendations(userId);

    res.status(200).json({
      success: true,
      message: 'Recommendations generated successfully',
      recommendations: recommendations.map(rec => ({
        destination: rec.destination,
        score: rec.score,
        reason: rec.reason,
        matchedInterests: rec.matchedInterests,
        matchedActivities: rec.matchedActivities
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get recommendation history
// @route   GET /api/recommendations/history
// @access  Private
exports.getRecommendationHistory = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const recommendations = await Recommendation.find({ userId })
      .populate('destinationId')
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Recommendation.countDocuments({ userId });

    res.status(200).json({
      success: true,
      count: recommendations.length,
      total,
      pages: Math.ceil(total / parseInt(limit)),
      recommendations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  RecommendationService,
  getRecommendations: exports.getRecommendations,
  generateRecommendations: exports.generateRecommendations,
  getRecommendationHistory: exports.getRecommendationHistory
};
