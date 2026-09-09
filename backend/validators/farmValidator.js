const { body } = require('express-validator');
const { SOIL_TYPES, IRRIGATION_TYPES } = require('../utils/constants');

const normalizeFarmData = (req, res, next) => {
  if (req.body) {
    if (req.body.name && !req.body.farmName) req.body.farmName = req.body.name;
    if (req.body.size !== undefined && req.body.landSize === undefined) req.body.landSize = req.body.size;
    if (req.body.unit && !req.body.landUnit) req.body.landUnit = req.body.unit;
    if (req.body.location) {
      if (typeof req.body.location === 'object') {
        if (req.body.location.state && !req.body.state) req.body.state = req.body.location.state;
        if (req.body.location.district && !req.body.district) req.body.district = req.body.location.district;
        if (req.body.location.village && !req.body.village) req.body.village = req.body.location.village;
      } else if (typeof req.body.location === 'string' && !req.body.state) {
        req.body.state = req.body.location;
      }
    }
    if (!req.body.district && req.body.state) req.body.district = req.body.state;
    if (!req.body.irrigationType) req.body.irrigationType = 'rainfed';
  }
  next();
};

const normalizeUpdateFarmData = (req, res, next) => {
  if (req.body) {
    if (req.body.name && !req.body.farmName) req.body.farmName = req.body.name;
    if (req.body.size !== undefined && req.body.landSize === undefined) req.body.landSize = req.body.size;
    if (req.body.unit && !req.body.landUnit) req.body.landUnit = req.body.unit;
  }
  next();
};

const createFarmValidation = [
  normalizeFarmData,
  body('farmName').notEmpty().withMessage('Farm name is required').trim(),
  body('state').notEmpty().withMessage('State is required').trim(),
  body('district').notEmpty().withMessage('District is required').trim(),
  body('landSize')
    .notEmpty()
    .withMessage('Land size is required')
    .isNumeric()
    .withMessage('Land size must be a number')
    .isFloat({ min: 0.01 })
    .withMessage('Land size must be greater than 0'),
  body('soilType')
    .notEmpty()
    .withMessage('Soil type is required')
    .isIn(SOIL_TYPES)
    .withMessage('Invalid soil type'),
  body('irrigationType')
    .notEmpty()
    .withMessage('Irrigation type is required')
    .isIn(IRRIGATION_TYPES)
    .withMessage('Invalid irrigation type'),
  body('waterAvailability')
    .optional()
    .isIn(['abundant', 'moderate', 'scarce'])
    .withMessage('Invalid water availability option'),
];

const updateFarmValidation = [
  normalizeUpdateFarmData,
  body('farmName').optional().notEmpty().withMessage('Farm name cannot be empty').trim(),
  body('state').optional().notEmpty().withMessage('State cannot be empty').trim(),
  body('district').optional().notEmpty().withMessage('District cannot be empty').trim(),
  body('landSize')
    .optional()
    .isNumeric()
    .withMessage('Land size must be a number')
    .isFloat({ min: 0.01 })
    .withMessage('Land size must be greater than 0'),
  body('soilType')
    .optional()
    .isIn(SOIL_TYPES)
    .withMessage('Invalid soil type'),
  body('irrigationType')
    .optional()
    .isIn(IRRIGATION_TYPES)
    .withMessage('Invalid irrigation type'),
  body('waterAvailability')
    .optional()
    .isIn(['abundant', 'moderate', 'scarce'])
    .withMessage('Invalid water availability option'),
];

module.exports = {
  createFarmValidation,
  updateFarmValidation,
};
