const { body } = require('express-validator');

const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').trim().isEmail().withMessage('Must be a valid email').normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/\d/)
    .withMessage('Password must contain at least one number'),
  body('mobile')
    .optional({ checkFalsy: true })
    .custom((val) => {
      if (!val || typeof val !== 'string' || val.trim() === '') return true;
      const cleaned = val.trim().replace(/[\s\-()]/g, '');
      if (!/^\+?[0-9]{10,15}$/.test(cleaned)) {
        throw new Error('Invalid mobile number');
      }
      return true;
    }),
  body('phone')
    .optional({ checkFalsy: true })
    .custom((val) => {
      if (!val || typeof val !== 'string' || val.trim() === '') return true;
      const cleaned = val.trim().replace(/[\s\-()]/g, '');
      if (!/^\+?[0-9]{10,15}$/.test(cleaned)) {
        throw new Error('Invalid phone number');
      }
      return true;
    }),
  body('role')
    .optional({ checkFalsy: true })
    .isIn(['farmer', 'admin', 'expert'])
    .withMessage('Invalid role'),
  body('language')
    .optional({ checkFalsy: true })
    .isIn(['en', 'hi', 'mr'])
    .withMessage('Invalid language'),
  body('preferredLanguage')
    .optional({ checkFalsy: true })
    .isIn(['en', 'hi', 'mr'])
    .withMessage('Invalid language'),
];

const loginValidation = [
  body('email').trim().isEmail().withMessage('Must be a valid email').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

const forgotPasswordValidation = [
  body('email').trim().isEmail().withMessage('Must be a valid email').normalizeEmail(),
];

const resetPasswordValidation = [
  body('token').notEmpty().withMessage('Token is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),
];

const changePasswordValidation = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long'),
];

module.exports = {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  changePasswordValidation,
};
