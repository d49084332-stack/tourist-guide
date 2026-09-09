const express = require('express');
const router = express.Router();
const travelPlanController = require('../controllers/travelPlanController');
const { authenticateToken } = require('../middleware/auth');
const { validateTravelPlan } = require('../middleware/validation');

router.get('/', authenticateToken, travelPlanController.getTravelPlans);
router.post('/', authenticateToken, validateTravelPlan, travelPlanController.createTravelPlan);
router.get('/:id', authenticateToken, travelPlanController.getTravelPlan);
router.put('/:id', authenticateToken, travelPlanController.updateTravelPlan);
router.delete('/:id', authenticateToken, travelPlanController.deleteTravelPlan);
router.post('/:id/destinations', authenticateToken, travelPlanController.addDestinationToplan);
router.delete('/:id/destinations/:destinationId', authenticateToken, travelPlanController.removeDestinationFromPlan);

module.exports = router;
