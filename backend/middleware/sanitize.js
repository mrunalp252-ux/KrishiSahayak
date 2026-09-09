const xssFilters = require('xss-filters');

const sanitizeObject = (obj) => {
  if (obj === null || obj === undefined || typeof obj !== 'object') {
    if (typeof obj === 'string') {
      return xssFilters.inHTMLData(obj);
    }
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }

  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    // Remove keys that start with $ or contain . (NoSQL injection prevention)
    if (key.startsWith('$') || key.includes('.')) {
      continue;
    }
    sanitized[key] = sanitizeObject(value);
  }
  return sanitized;
};

const sanitize = (req, res, next) => {
  if (req.body) req.body = sanitizeObject(req.body);
  if (req.query) req.query = sanitizeObject(req.query);
  if (req.params) req.params = sanitizeObject(req.params);
  next();
};

module.exports = sanitize;
