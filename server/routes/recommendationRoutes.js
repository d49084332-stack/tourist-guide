const express = require('express');
const router = express.Router();
const recommendationController = require('../controllers/recommendationController');
const { authenticateToken } = require('../middleware/auth');

router.get('/', authenticateToken, recommendationController.getRecommendations);
router.post('/generate', authenticateToken, recommendationController.generateRecommendations);
router.get('/history', authenticateToken, recommendationController.getRecommendationHistory);

module.exports = router;
