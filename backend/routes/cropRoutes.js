const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const validate = require('../middleware/validate');
const authorize = require('../middleware/authorize');
const { createCropValidation } = require('../validators/cropValidator');
const controller = require('../controllers/cropController');

router.get('/', controller.getAll);
router.get('/:id', controller.getOne);
router.post('/', auth, authorize('admin'), ...createCropValidation, validate, controller.create);
router.put('/:id', auth, authorize('admin'), controller.update);
router.delete('/:id', auth, authorize('admin'), controller.delete);

module.exports = router;
