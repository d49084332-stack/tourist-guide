const Destination = require('../models/Destination');
const User = require('../models/User');
const { discoverDestinationsWithAI } = require('../services/aiExploreService');
const { discoverLiveBeaches } = require('../services/placesService');

// @desc    Get all destinations
// @route   GET /api/destinations
// @access  Public
exports.getDestinations = async (req, res) => {
  try {
    const { page = 1, limit = 12, search, category, state, budget, rating, sortBy = '-createdAt' } = req.query;

    let filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
        { state: { $regex: search, $options: 'i' } }
      ];
    }

    if (category) filter.category = category;
    if (state) filter.state = { $regex: state, $options: 'i' };
    if (budget) filter.estimatedBudget = budget;
    if (rating) filter.rating = { $gte: parseFloat(rating) };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    let destinations = await Destination.find(filter)
      .sort(sortBy)
      .skip(skip)
      .limit(parseInt(limit));

    let total = await Destination.countDocuments(filter);

    // If a search was performed and zero destinations found in DB, use AI to discover genuine destinations!
    if (search && destinations.length === 0) {
      console.log(`[Explore] 0 DB results for "${search}", triggering AI destination discovery...`);
      try {
        const aiDestinations = await discoverDestinationsWithAI(search, category || '');
        if (aiDestinations.length > 0) {
          destinations = aiDestinations;
          total = aiDestinations.length;
        }
      } catch (aiErr) {
        console.warn('[Explore] AI destination discovery fallback error:', aiErr.message);
      }
    }

    res.status(200).json({
      success: true,
      count: destinations.length,
      total,
      pages: Math.ceil(total / parseInt(limit)) || 1,
      currentPage: parseInt(page),
      destinations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    AI Real-Time Destination Discovery
// @route   GET /api/destinations/ai-discover
// @access  Public
exports.aiDiscoverDestinations = async (req, res) => {
  try {
    const { q, category } = req.query;
    const destinations = await discoverDestinationsWithAI(q || 'Top Indian Destinations', category || '');

    res.status(200).json({
      success: true,
      count: destinations.length,
      destinations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Discover map-verified beaches in real time
// @route   GET /api/destinations/live-beaches
// @access  Public
exports.getLiveBeaches = async (req, res) => {
  try {
    const beaches = await discoverLiveBeaches(req.query.state || '');
    res.status(200).json({ success: true, count: beaches.length, destinations: beaches });
  } catch (error) {
    res.status(502).json({ success: false, message: 'Live beach map service is temporarily unavailable.' });
  }
};


// @desc    Get single destination
// @route   GET /api/destinations/:id
// @access  Public
exports.getDestination = async (req, res) => {
  try {
    const destination = await Destination.findById(req.params.id);

    if (!destination) {
      return res.status(404).json({
        success: false,
        message: 'Destination not found'
      });
    }

    // Increment view count
    destination.viewCount += 1;
    await destination.save();

    // Add to user's viewed destinations if logged in
    if (req.user) {
      await User.findByIdAndUpdate(
        req.user.userId,
        {
          $push: {
            viewedDestinations: {
              destinationId: destination._id,
              viewedAt: new Date()
            }
          }
        }
      );
    }

    res.status(200).json({
      success: true,
      destination
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get popular destinations
// @route   GET /api/destinations/popular
// @access  Public
exports.getPopular = async (req, res) => {
  try {
    const destinations = await Destination.find({ popular: true })
      .limit(8)
      .sort('-viewCount');

    res.status(200).json({
      success: true,
      destinations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get featured destinations
// @route   GET /api/destinations/featured
// @access  Public
exports.getFeatured = async (req, res) => {
  try {
    const destinations = await Destination.find({ featured: true })
      .limit(6);

    res.status(200).json({
      success: true,
      destinations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create destination (Admin only)
// @route   POST /api/destinations
// @access  Private/Admin
exports.createDestination = async (req, res) => {
  try {
    const destination = await Destination.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Destination created successfully',
      destination
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update destination (Admin only)
// @route   PUT /api/destinations/:id
// @access  Private/Admin
exports.updateDestination = async (req, res) => {
  try {
    let destination = await Destination.findById(req.params.id);

    if (!destination) {
      return res.status(404).json({
        success: false,
        message: 'Destination not found'
      });
    }

    destination = await Destination.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Destination updated successfully',
      destination
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete destination (Admin only)
// @route   DELETE /api/destinations/:id
// @access  Private/Admin
exports.deleteDestination = async (req, res) => {
  try {
    const destination = await Destination.findByIdAndDelete(req.params.id);

    if (!destination) {
      return res.status(404).json({
        success: false,
        message: 'Destination not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Destination deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get destinations by category
// @route   GET /api/destinations/category/:category
// @access  Public
exports.getByCategory = async (req, res) => {
  try {
    const destinations = await Destination.find({ category: req.params.category });

    res.status(200).json({
      success: true,
      count: destinations.length,
      destinations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
