const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { authenticateToken } = require('../middleware/auth');
const { validateReview } = require('../middleware/validation');

router.post('/', authenticateToken, validateReview, reviewController.createReview);
router.get('/:destinationId', reviewController.getReviews);
router.get('/user/:destinationId', authenticateToken, reviewController.getUserReview);
router.put('/:id', authenticateToken, validateReview, reviewController.updateReview);
router.delete('/:id', authenticateToken, reviewController.deleteReview);

module.exports = router;
