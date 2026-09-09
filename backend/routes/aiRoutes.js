const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { aiLimiter } = require('../middleware/rateLimiter');
const controller = require('../controllers/aiController');

router.post('/chat', auth, aiLimiter, controller.chat);
router.get('/conversations', auth, controller.getConversations);
router.get('/conversations/:id', auth, controller.getConversation);
router.post('/analyze-image', auth, aiLimiter, upload.single('image'), controller.analyzeImage);
router.post('/analyze-crop', auth, aiLimiter, upload.single('image'), controller.analyzeImage);

module.exports = router;

