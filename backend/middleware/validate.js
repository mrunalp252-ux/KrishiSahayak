const { validationResult } = require('express-validator');

/**
 * Validation result checker middleware.
 * Used AFTER express-validator validation rules in the route chain.
 * Pattern: router.post('/route', [...validationRules], validate, controller)
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }

  const extractedErrors = [];
  errors.array().forEach(err => {
    extractedErrors.push({ [err.path || err.param || 'field']: err.msg });
  });

  return res.status(400).json({
    success: false,
    message: 'Validation failed',
    errors: extractedErrors,
  });
};

module.exports = validate;
