const Booking = require('../models/Booking');
const Hotel = require('../models/Hotel');

// Generate unique Booking ID
const generateBookingId = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `BK-2026-${code}`;
};

// @desc    Create a new hotel booking with secure payment confirmation
// @route   POST /api/bookings
// @access  Private
exports.createBooking = async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      hotelId,
      liveHotel = false,
      hotelName,
      hotelAddress,
      hotelCity,
      roomPricePerNight: requestedRoomPrice,
      roomType,
      checkInDate,
      checkOutDate,
      guests = 1,
      roomsCount = 1,
      paymentMethod,
      specialRequests,
      guestDetails
    } = req.body;

    if ((!hotelId && !liveHotel) || !roomType || !checkInDate || !checkOutDate || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Missing required booking information'
      });
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid dates provided'
      });
    }

    const diffTime = checkOut.getTime() - checkIn.getTime();
    const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (nights <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Check-out date must be after check-in date'
      });
    }

    // Live route hotels are discovered from current map data and do not have local room inventory.
    // Keep their reservation as a request using the displayed live rate; stored hotels use verified inventory below.
    const hotel = hotelId ? await Hotel.findById(hotelId) : null;
    if (liveHotel) {
      const roomPrice = Number(requestedRoomPrice);
      if (!hotelName || !hotelAddress || !Number.isFinite(roomPrice) || roomPrice <= 0) {
        return res.status(400).json({ success: false, message: 'Live hotel details are incomplete.' });
      }

      const roomCost = roomPrice * nights * parseInt(roomsCount, 10);
      const taxAmount = Math.round(roomCost * 0.12);
      const totalAmount = roomCost + taxAmount;
      const transactionId = `TXN-${paymentMethod.replace(/\s+/g, '').toUpperCase()}-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const booking = await Booking.create({
        bookingId: generateBookingId(),
        userId,
        hotelId: null,
        hotelName,
        hotelAddress,
        hotelCity: hotelCity || 'Tourist Destination',
        roomType,
        roomPricePerNight: roomPrice,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        guests: parseInt(guests, 10),
        roomsCount: parseInt(roomsCount, 10),
        nights,
        roomCost,
        taxAmount,
        totalAmount,
        paymentMethod,
        paymentStatus: 'Completed',
        transactionId,
        bookingStatus: 'Confirmed',
        specialRequests,
        guestDetails: guestDetails || { fullName: req.user.name, email: req.user.email },
        tripSummary: `Reserved ${hotelName} for ${nights} night${nights > 1 ? 's' : ''}.`,
        placesVisited: [hotelCity || hotelName]
      });

      return res.status(201).json({
        success: true,
        message: 'Live hotel reservation confirmed and payment processed successfully!',
        booking
      });
    }

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: 'Selected hotel not found'
      });
    }

    const selectedRoom = hotel.rooms.find(r => r.roomType === roomType);
    if (!selectedRoom) {
      return res.status(404).json({
        success: false,
        message: 'Selected room type not available in this hotel'
      });
    }

    // Compute costs
    const roomPricePerNight = selectedRoom.pricePerNight;
    const roomCost = roomPricePerNight * nights * parseInt(roomsCount, 10);
    const taxAmount = Math.round(roomCost * 0.12); // 12% GST
    const totalAmount = roomCost + taxAmount;

    // Secure simulated transaction ID
    const transactionId = `TXN-${paymentMethod.replace(/\s+/g, '').toUpperCase()}-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const bookingId = generateBookingId();

    const booking = await Booking.create({
      bookingId,
      userId,
      hotelId: hotel._id,
      hotelName: hotel.name,
      hotelAddress: hotel.location.address,
      hotelCity: hotel.city,
      hotelImage: hotel.images?.[0]?.url || selectedRoom.roomImage,
      roomType,
      roomPricePerNight,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      guests: parseInt(guests, 10),
      roomsCount: parseInt(roomsCount, 10),
      nights,
      roomCost,
      taxAmount,
      totalAmount,
      paymentMethod,
      paymentStatus: 'Completed',
      transactionId,
      bookingStatus: 'Confirmed',
      specialRequests,
      guestDetails: guestDetails || {
        fullName: req.user.name,
        email: req.user.email
      },
      tripSummary: `Stayed at ${hotel.name} in ${hotel.city} for ${nights} night${nights > 1 ? 's' : ''}.`,
      placesVisited: hotel.nearDestination ? [hotel.nearDestination] : [hotel.city]
    });

    res.status(201).json({
      success: true,
      message: 'Booking confirmed and payment processed successfully!',
      booking
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create booking'
    });
  }
};

// @desc    Get user bookings (including completed trips)
// @route   GET /api/bookings/my-bookings
// @access  Private
exports.getMyBookings = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { status, completedOnly } = req.query;

    const query = { userId };

    if (status) {
      query.bookingStatus = status;
    }

    if (completedOnly === 'true') {
      // Either marked completed or checkout in the past
      query.$or = [
        { isCompletedTrip: true },
        { bookingStatus: 'Completed' },
        { checkOutDate: { $lt: new Date() } }
      ];
    }

    const bookings = await Booking.find(query)
      .populate('hotelId')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single booking by ID
// @route   GET /api/bookings/:id
// @access  Private
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('hotelId');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check ownership or admin
    if (booking.userId.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this booking'
      });
    }

    res.status(200).json({
      success: true,
      booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Mark trip as completed with summary and places visited
// @route   PUT /api/bookings/:id/complete-trip
// @access  Private
exports.markTripCompleted = async (req, res) => {
  try {
    const { tripSummary, placesVisited } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.userId.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    booking.isCompletedTrip = true;
    booking.bookingStatus = 'Completed';
    if (tripSummary) booking.tripSummary = tripSummary;
    if (placesVisited && Array.isArray(placesVisited)) booking.placesVisited = placesVisited;

    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Trip marked as completed successfully',
      booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.userId.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    booking.bookingStatus = 'Cancelled';
    booking.paymentStatus = 'Refunded';
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Booking cancelled and refund initiated successfully',
      booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all bookings (Admin)
// @route   GET /api/bookings/admin/all
// @access  Private/Admin
exports.getAllBookingsAdmin = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('userId', 'name email')
      .populate('hotelId', 'name city')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
