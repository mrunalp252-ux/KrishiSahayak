const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const controller = require('../controllers/diseaseController');

router.get('/', controller.getAll);
router.get('/search', controller.search);
router.get('/:id', controller.getOne);
router.post('/', auth, authorize('admin'), controller.create);
router.put('/:id', auth, authorize('admin'), controller.update);
router.delete('/:id', auth, authorize('admin'), controller.delete);

module.exports = router;
