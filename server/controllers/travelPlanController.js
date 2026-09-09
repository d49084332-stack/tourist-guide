const TravelPlan = require('../models/TravelPlan');
const Destination = require('../models/Destination');

// @desc    Get user's travel plans
// @route   GET /api/travel-plans
// @access  Private
exports.getTravelPlans = async (req, res) => {
  try {
    const userId = req.user.userId;

    const plans = await TravelPlan.find({ userId })
      .populate('destinations.destinationId')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: plans.length,
      plans
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single travel plan
// @route   GET /api/travel-plans/:id
// @access  Private
exports.getTravelPlan = async (req, res) => {
  try {
    const plan = await TravelPlan.findById(req.params.id)
      .populate('destinations.destinationId');

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Travel plan not found'
      });
    }

    // Check ownership
    if (plan.userId.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this plan'
      });
    }

    res.status(200).json({
      success: true,
      plan
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create travel plan
// @route   POST /api/travel-plans
// @access  Private
exports.createTravelPlan = async (req, res) => {
  try {
    const { name, startDate, endDate, destinations, budget, notes } = req.body;
    const userId = req.user.userId;

    // Validate dates
    if (new Date(endDate) <= new Date(startDate)) {
      return res.status(400).json({
        success: false,
        message: 'End date must be after start date'
      });
    }

    const plan = await TravelPlan.create({
      userId,
      name,
      startDate,
      endDate,
      destinations: destinations || [],
      budget,
      notes
    });

    res.status(201).json({
      success: true,
      message: 'Travel plan created successfully',
      plan
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update travel plan
// @route   PUT /api/travel-plans/:id
// @access  Private
exports.updateTravelPlan = async (req, res) => {
  try {
    let plan = await TravelPlan.findById(req.params.id);

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Travel plan not found'
      });
    }

    // Check ownership
    if (plan.userId.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this plan'
      });
    }

    plan = await TravelPlan.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('destinations.destinationId');

    res.status(200).json({
      success: true,
      message: 'Travel plan updated successfully',
      plan
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete travel plan
// @route   DELETE /api/travel-plans/:id
// @access  Private
exports.deleteTravelPlan = async (req, res) => {
  try {
    const plan = await TravelPlan.findById(req.params.id);

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Travel plan not found'
      });
    }

    // Check ownership
    if (plan.userId.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this plan'
      });
    }

    await TravelPlan.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Travel plan deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Add destination to travel plan
// @route   POST /api/travel-plans/:id/destinations
// @access  Private
exports.addDestinationToplan = async (req, res) => {
  try {
    const { destinationId, visitDate, duration, notes } = req.body;

    let plan = await TravelPlan.findById(req.params.id);

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Travel plan not found'
      });
    }

    // Check ownership
    if (plan.userId.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Check if destination exists
    const destination = await Destination.findById(destinationId);
    if (!destination) {
      return res.status(404).json({
        success: false,
        message: 'Destination not found'
      });
    }

    plan.destinations.push({ destinationId, visitDate, duration, notes });
    await plan.save();

    plan = await plan.populate('destinations.destinationId');

    res.status(200).json({
      success: true,
      message: 'Destination added to plan',
      plan
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Remove destination from travel plan
// @route   DELETE /api/travel-plans/:id/destinations/:destinationId
// @access  Private
exports.removeDestinationFromPlan = async (req, res) => {
  try {
    const { id, destinationId } = req.params;

    let plan = await TravelPlan.findById(id);

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Travel plan not found'
      });
    }

    // Check ownership
    if (plan.userId.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    plan.destinations = plan.destinations.filter(
      dest => dest.destinationId.toString() !== destinationId
    );
    await plan.save();

    plan = await plan.populate('destinations.destinationId');

    res.status(200).json({
      success: true,
      message: 'Destination removed from plan',
      plan
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
