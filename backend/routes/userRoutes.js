const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');
const upload = require('../middleware/upload');
const { changePasswordValidation } = require('../validators/authValidator');
const controller = require('../controllers/userController');
const adminController = require('../controllers/adminController');

router.get('/', auth, authorize('admin'), adminController.getUsers);

router.get('/me', auth, controller.getProfile);
router.get('/profile', auth, controller.getProfile);
router.put('/me', auth, controller.updateProfile);
router.put('/profile', auth, controller.updateProfile);
router.put('/me/password', auth, ...changePasswordValidation, validate, controller.changePassword);
router.put('/profile/password', auth, ...changePasswordValidation, validate, controller.changePassword);
router.post('/me/avatar', auth, upload.single('avatar'), controller.uploadProfileImage);
router.post('/profile/avatar', auth, upload.single('avatar'), controller.uploadProfileImage);

router.get('/:id', auth, authorize('admin', 'expert'), adminController.getUserById);
router.put('/:id', auth, authorize('admin'), adminController.updateUser);
router.delete('/:id', auth, authorize('admin'), adminController.deleteUser);

module.exports = router;
