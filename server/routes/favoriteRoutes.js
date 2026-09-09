const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favoriteController');
const { authenticateToken } = require('../middleware/auth');

router.post('/:destinationId', authenticateToken, favoriteController.addFavorite);
router.delete('/:destinationId', authenticateToken, favoriteController.removeFavorite);
router.get('/', authenticateToken, favoriteController.getFavorites);
router.get('/check/:destinationId', authenticateToken, favoriteController.checkFavorite);

module.exports = router;
