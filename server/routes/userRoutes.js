const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken } = require('../middleware/auth');

router.get('/profile', authenticateToken, userController.getProfile);
router.put('/profile', authenticateToken, userController.updateProfile);
router.put('/preferences', authenticateToken, userController.updatePreferences);
router.post('/search-history', authenticateToken, userController.addSearchHistory);
router.get('/search-history', authenticateToken, userController.getSearchHistory);

module.exports = router;
