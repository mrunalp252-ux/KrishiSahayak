const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const controller = require('../controllers/adminController');

router.get('/dashboard', auth, authorize('admin'), controller.getDashboard);
router.get('/users', auth, authorize('admin'), controller.getUsers);
router.put('/users/:id', auth, authorize('admin'), controller.updateUser);
router.get('/audit-logs', auth, authorize('admin'), controller.getAuditLogs);

module.exports = router;
