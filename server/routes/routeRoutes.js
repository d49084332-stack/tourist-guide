const express = require('express');
const router = express.Router();
const routeController = require('../controllers/routeController');

router.get('/plan', routeController.planRoute);
router.get('/popular', routeController.getPopularRoutes);
router.get('/reverse-geocode', routeController.reverseGeocodeLocation);

module.exports = router;

