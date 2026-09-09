const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const controller = require('../controllers/expertController');

router.get('/stats', auth, authorize('expert', 'admin'), controller.getStats);
router.get('/queries', auth, authorize('expert', 'admin'), controller.getQueries);
router.post('/respond', auth, authorize('expert', 'admin'), controller.respondToQuery);
router.post('/queries/:id/respond', auth, authorize('expert', 'admin'), controller.respondToQuery);
router.post('/guidance', auth, authorize('expert', 'admin'), controller.publishGuidance);

module.exports = router;
