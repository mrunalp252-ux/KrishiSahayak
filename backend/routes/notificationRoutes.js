const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const controller = require('../controllers/notificationController');

router.get('/', auth, controller.getAll);
router.get('/unread-count', auth, controller.getUnreadCount);
router.put('/read-all', auth, controller.markAllAsRead);
router.put('/:id/read', auth, controller.markAsRead);
router.delete('/:id', auth, controller.delete);

module.exports = router;
