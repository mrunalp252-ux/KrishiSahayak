const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { recommendationValidation } = require('../validators/cropValidator');
const controller = require('../controllers/recommendationController');

router.post('/', auth, ...recommendationValidation, validate, controller.getRecommendation);
router.post('/crops', auth, ...recommendationValidation, validate, controller.getRecommendation);
router.get('/history', auth, controller.getHistory);

module.exports = router;
