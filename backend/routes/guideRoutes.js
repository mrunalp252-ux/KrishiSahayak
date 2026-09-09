const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const controller = require('../controllers/guideController');

router.get('/', controller.getAll);
router.get('/crop/:cropId', controller.getByCrop);
router.get('/:id', controller.getOne);
router.post('/', auth, authorize('admin', 'expert'), controller.create);
router.put('/:id', auth, authorize('admin', 'expert'), controller.update);
router.delete('/:id', auth, authorize('admin'), controller.delete);

module.exports = router;
