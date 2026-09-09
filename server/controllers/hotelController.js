const Hotel = require('../models/Hotel');

// @desc    Get all hotels with filtering
// @route   GET /api/hotels
// @access  Public
exports.getHotels = async (req, res) => {
  try {
    const {
      city,
      state,
      search,
      nearHighway,
      nearDestination,
      priceRange,
      minRating,
      page = 1,
      limit = 20
    } = req.query;

    const query = {};

    if (city) {
      query.city = { $regex: city, $options: 'i' };
    }

    if (state) {
      query.state = { $regex: state, $options: 'i' };
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
        { 'location.address': { $regex: search, $options: 'i' } },
        { nearDestination: { $regex: search, $options: 'i' } }
      ];
    }

    if (nearHighway) {
      query.nearHighway = { $regex: nearHighway, $options: 'i' };
    }

    if (nearDestination) {
      query.nearDestination = { $regex: nearDestination, $options: 'i' };
    }

    if (priceRange) {
      query.priceRange = priceRange;
    }

    if (minRating) {
      query.rating = { $gte: parseFloat(minRating) };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Hotel.countDocuments(query);
    const hotels = await Hotel.find(query)
      .sort({ rating: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: hotels.length,
      total,
      pages: Math.ceil(total / parseInt(limit)),
      hotels
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single hotel by ID
// @route   GET /api/hotels/:id
// @access  Public
exports.getHotelById = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found'
      });
    }

    res.status(200).json({
      success: true,
      hotel
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create hotel
// @route   POST /api/hotels
// @access  Private/Admin
exports.createHotel = async (req, res) => {
  try {
    const hotel = await Hotel.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Hotel created successfully',
      hotel
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update hotel
// @route   PUT /api/hotels/:id
// @access  Private/Admin
exports.updateHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Hotel updated successfully',
      hotel
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete hotel
// @route   DELETE /api/hotels/:id
// @access  Private/Admin
exports.deleteHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findByIdAndDelete(req.params.id);

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Hotel deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
