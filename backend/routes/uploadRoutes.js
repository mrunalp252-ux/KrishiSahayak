const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const upload = require('../middleware/upload');
const controller = require('../controllers/uploadController');

router.post('/image', auth, upload.single('image'), controller.uploadImage);

module.exports = router;
