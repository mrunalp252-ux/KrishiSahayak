const { param, query } = require('express-validator');

const mongoIdValidation = (paramName) => [
  param(paramName).isMongoId().withMessage(`Invalid ID format for ${paramName}`),
];

const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('sort').optional().isString().withMessage('Sort must be a string'),
];

const searchValidation = [
  query('q')
    .optional()
    .isString()
    .withMessage('Search query must be a string')
    .trim()
    .notEmpty()
    .withMessage('Search query cannot be empty if provided'),
];

module.exports = {
  mongoIdValidation,
  paginationValidation,
  searchValidation,
};
