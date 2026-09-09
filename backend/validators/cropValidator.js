const { body } = require('express-validator');
const { SOIL_TYPES, SEASONS } = require('../utils/constants');

const createCropValidation = [
  body().custom((body) => {
    if (!body || (!body.name && !body.cropName)) {
      throw new Error('Crop name is required');
    }
    if (body && !body.name && body.cropName) {
      body.name = body.cropName;
    }
    return true;
  }),
  body('suitableSoils')
    .optional()
    .isArray()
    .withMessage('Suitable soils must be an array'),
  body('suitableSeasons')
    .optional()
    .isArray()
    .withMessage('Suitable seasons must be an array'),
  body('waterRequirement')
    .optional()
    .isIn(['low', 'moderate', 'medium', 'high'])
    .withMessage('Invalid water requirement'),
  body('tempRange').optional().isObject().withMessage('Temperature range must be an object'),
  body('tempRange.min').optional().isNumeric(),
  body('tempRange.max').optional().isNumeric(),
];

const recommendationValidation = [
  body('soilType')
    .notEmpty()
    .withMessage('Soil type is required')
    .isIn(SOIL_TYPES)
    .withMessage('Invalid soil type'),
  body('season')
    .notEmpty()
    .withMessage('Season is required')
    .isIn(SEASONS)
    .withMessage('Invalid season'),
  body('waterAvailability')
    .notEmpty()
    .withMessage('Water availability is required')
    .isIn(['abundant', 'moderate', 'scarce'])
    .withMessage('Invalid water availability option'),
];

module.exports = {
  createCropValidation,
  recommendationValidation,
};
