const express = require('express');
const router = express.Router();
const destinationController = require('../controllers/destinationController');
const { authenticateToken, isAdmin } = require('../middleware/auth');
const { validateDestination, validateId } = require('../middleware/validation');

// Public routes
router.get('/', destinationController.getDestinations);
router.get('/ai-discover', destinationController.aiDiscoverDestinations);
router.get('/live-beaches', destinationController.getLiveBeaches);
router.get('/popular', destinationController.getPopular);
router.get('/featured', destinationController.getFeatured);
router.get('/category/:category', destinationController.getByCategory);
router.get('/:id', destinationController.getDestination);


// Admin routes
router.post('/', authenticateToken, isAdmin, validateDestination, destinationController.createDestination);
router.put('/:id', authenticateToken, isAdmin, validateDestination, destinationController.updateDestination);
router.delete('/:id', authenticateToken, isAdmin, destinationController.deleteDestination);

module.exports = router;
