const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const controller = require('../controllers/weatherController');

router.get('/current', auth, controller.getCurrentWeather);
router.get('/forecast', auth, controller.getForecast);

module.exports = router;
