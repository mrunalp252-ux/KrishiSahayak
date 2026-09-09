const express = require('express');
const router = express.Router();
const { optionalAuth } = require('../middleware/auth');
const controller = require('../controllers/weatherController');

router.get('/current', optionalAuth, controller.getCurrentWeather);
router.get('/forecast', optionalAuth, controller.getForecast);

module.exports = router;
