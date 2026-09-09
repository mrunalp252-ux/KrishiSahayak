const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { authLimiter } = require('../middleware/rateLimiter');
const {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation
} = require('../validators/authValidator');
const controller = require('../controllers/authController');

const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }
  return auth(req, res, next);
};

router.post('/register', authLimiter, ...registerValidation, validate, controller.register);
router.post('/login', authLimiter, ...loginValidation, validate, controller.login);
router.get('/me', auth, (req, res) => res.json({ success: true, user: req.user }));
router.post('/refresh-token', controller.refreshToken);
router.post('/refresh', controller.refreshToken);
router.post('/logout', optionalAuth, controller.logout);
router.post('/forgot-password', authLimiter, ...forgotPasswordValidation, validate, controller.forgotPassword);
router.post('/reset-password', ...resetPasswordValidation, validate, controller.resetPassword);

module.exports = router;
