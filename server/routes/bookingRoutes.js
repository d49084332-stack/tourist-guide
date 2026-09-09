const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { authenticateToken, isAdmin } = require('../middleware/auth');

router.post('/', authenticateToken, bookingController.createBooking);
router.get('/my-bookings', authenticateToken, bookingController.getMyBookings);
router.get('/admin/all', authenticateToken, isAdmin, bookingController.getAllBookingsAdmin);
router.get('/:id', authenticateToken, bookingController.getBookingById);
router.put('/:id/complete-trip', authenticateToken, bookingController.markTripCompleted);
router.put('/:id/cancel', authenticateToken, bookingController.cancelBooking);

module.exports = router;
