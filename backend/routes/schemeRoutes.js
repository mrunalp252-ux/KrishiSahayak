const express = require('express');
const router = express.Router();
const controller = require('../controllers/schemeController');
const { auth } = require('../middleware/auth');
const authorize = require('../middleware/authorize');

router.get('/', controller.getAll);
router.post('/seed', auth, authorize('admin'), controller.seed);
router.get('/:id', controller.getOne);

module.exports = router;
