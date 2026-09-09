const ROLES = {
  FARMER: 'farmer',
  ADMIN: 'admin',
  EXPERT: 'expert',
};

const SOIL_TYPES = [
  'alluvial', 'black', 'red', 'laterite', 'desert', 
  'mountain', 'clay', 'sandy', 'loamy', 'silt'
];

const IRRIGATION_TYPES = [
  'rainfed', 'canal', 'borewell', 'well', 
  'drip', 'sprinkler', 'flood', 'other'
];

const SEASONS = ['kharif', 'rabi', 'zaid'];

const CROP_CATEGORIES = [
  'cereal', 'pulse', 'oilseed', 'cash_crop', 
  'vegetable', 'fruit', 'spice', 'fiber', 'other'
];

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
];

const ACTIVITY_TYPES = [
  'land_preparation', 'seed_selection', 'sowing', 'irrigation', 
  'fertilizing', 'pest_monitoring', 'disease_monitoring', 
  'weeding', 'pruning', 'harvesting', 'post_harvest', 'other'
];

const NOTIFICATION_TYPES = [
  'weather', 'activity', 'crop', 'market', 
  'advisory', 'system', 'expert'
];

const ADVISORY_CATEGORIES = [
  'weather', 'pest', 'disease', 'market', 
  'general', 'government', 'scheme'
];

const SEVERITY_LEVELS = ['info', 'warning', 'critical', 'urgent'];

module.exports = {
  ROLES,
  SOIL_TYPES,
  IRRIGATION_TYPES,
  SEASONS,
  CROP_CATEGORIES,
  INDIAN_STATES,
  ACTIVITY_TYPES,
  NOTIFICATION_TYPES,
  ADVISORY_CATEGORIES,
  SEVERITY_LEVELS,
};
