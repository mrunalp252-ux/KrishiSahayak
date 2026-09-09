const rateLimit = require('express-rate-limit');

const isTest = process.env.NODE_ENV === 'test';
const isProduction = process.env.NODE_ENV === 'production';
const passThrough = (req, res, next) => next();

const generalLimiter = isTest ? passThrough : rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isProduction ? 100 : 5000, // Limit each IP per 15 minutes
  message: { success: false, message: 'Too many requests from this IP, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = isTest ? passThrough : rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isProduction ? 10 : 1000, // Limit each IP to login/register attempts
  message: { success: false, message: 'Too many login attempts from this IP, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = isTest ? passThrough : rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: isProduction ? 60 : 2000, // Limit each IP per minute
  message: { success: false, message: 'Too many requests from this IP, please try again after 1 minute' },
  standardHeaders: true,
  legacyHeaders: false,
});

const aiLimiter = isTest ? passThrough : rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: isProduction ? 30 : 200, // Limit AI requests to prevent API quota drain
  message: { success: false, message: 'Too many AI requests. Please slow down and try again after a minute.' },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  generalLimiter,
  authLimiter,
  apiLimiter,
  aiLimiter,
};

