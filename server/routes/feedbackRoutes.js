const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');
const { optionalAuth } = require('../middleware/auth');

router.post('/', optionalAuth, feedbackController.submitFeedback);
router.get('/', feedbackController.getFeedbackAndReviews);

module.exports = router;
