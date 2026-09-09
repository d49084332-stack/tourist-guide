const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken, isAdmin } = require('../middleware/auth');

router.get('/dashboard', authenticateToken, isAdmin, adminController.getDashboard);
router.get('/users', authenticateToken, isAdmin, adminController.getUsers);
router.get('/users/:id', authenticateToken, isAdmin, adminController.getUserDetails);
router.get('/feedback', authenticateToken, isAdmin, adminController.getFeedback);
router.delete('/feedback/:id', authenticateToken, isAdmin, adminController.deleteFeedback);
router.get('/destinations', authenticateToken, isAdmin, adminController.getAllDestinations);
router.get('/recommendations', authenticateToken, isAdmin, adminController.getRecommendationsData);

module.exports = router;
