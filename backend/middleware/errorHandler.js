const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  let statusCode = err.statusCode || 500;

  logger.error(`${err.name || 'Error'}: ${err.message}`, { stack: err.stack, path: req.path, method: req.method });

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    error.message = 'Resource not found';
    statusCode = 404;
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    error.message = 'A record with this information already exists';
    statusCode = 409;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errorList = Object.values(err.errors || {}).map(val => val.message);
    error.message = errorList.length > 0 ? errorList.join(', ') : 'Validation failed. Please check your input.';
    statusCode = 400;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error.message = 'Your session is invalid. Please log in again.';
    statusCode = 401;
  }

  if (err.name === 'TokenExpiredError') {
    error.message = 'Your session has expired. Please log in again.';
    statusCode = 401;
  }

  // Multer errors
  if (err.name === 'MulterError') {
    error.message = `File upload error: ${err.message}`;
    statusCode = 400;
  }

  // Sanitize internal server errors
  if (statusCode === 500 && (error.message.includes('Mongo') || error.message.includes('ECONNREFUSED') || error.message.includes('Cannot read property'))) {
    error.message = 'A server error occurred. Please try again later.';
  }

  res.status(statusCode).json({
    success: false,
    message: error.message || 'An unexpected error occurred. Please try again later.'
  });
};

module.exports = errorHandler;
