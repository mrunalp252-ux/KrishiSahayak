const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createFarmValidation, updateFarmValidation } = require('../validators/farmValidator');
const controller = require('../controllers/farmController');

router.get('/', auth, controller.getAll);
router.post('/', auth, ...createFarmValidation, validate, controller.create);
router.get('/:id', auth, controller.getOne);
router.put('/:id', auth, ...updateFarmValidation, validate, controller.update);
router.delete('/:id', auth, controller.delete);

module.exports = router;
