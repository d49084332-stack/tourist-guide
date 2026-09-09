const express = require('express');
const router = express.Router();
const hotelController = require('../controllers/hotelController');
const { authenticateToken, isAdmin } = require('../middleware/auth');

router.get('/', hotelController.getHotels);
router.get('/:id', hotelController.getHotelById);
router.post('/', authenticateToken, isAdmin, hotelController.createHotel);
router.put('/:id', authenticateToken, isAdmin, hotelController.updateHotel);
router.delete('/:id', authenticateToken, isAdmin, hotelController.deleteHotel);

module.exports = router;
