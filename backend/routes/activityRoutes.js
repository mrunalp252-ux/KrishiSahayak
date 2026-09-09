const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const controller = require('../controllers/activityController');

router.get('/', auth, controller.getAll);
router.post('/', auth, controller.create);
router.post('/generate-plan', auth, controller.generatePlan);
router.post('/generate/:farmId', auth, (req, res, next) => { req.body.farmId = req.params.farmId; return controller.generatePlan(req, res, next); });
router.get('/activities/:farmId', auth, (req, res, next) => { req.query.farm = req.params.farmId; return controller.getAll(req, res, next); });
router.post('/activities', auth, controller.create);
router.put('/activities/:id', auth, controller.update);
router.delete('/activities/:id', auth, controller.delete);
router.get('/:id', auth, controller.getOne);
router.put('/:id', auth, controller.update);
router.put('/:id/complete', auth, controller.complete);
router.delete('/:id', auth, controller.delete);

module.exports = router;
