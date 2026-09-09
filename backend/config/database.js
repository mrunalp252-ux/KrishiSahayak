const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
  try {
    if (mongoose.connection.readyState !== 0) {
      return;
    }

    const mongoURI = process.env.NODE_ENV === 'test'
      ? (process.env.TEST_MONGODB_URI || 'mongodb://127.0.0.1:27017/krishi-sahayak-test')
      : (process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/krishi-sahayak');

    mongoose.connection.on('connected', () => {
      logger.info('MongoDB connected successfully');
    });

    mongoose.connection.on('error', (err) => {
      logger.error(`MongoDB connection error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

  } catch (error) {
    logger.error(`Error connecting to MongoDB: ${error.message}`);
    logger.error('Server will continue running but database operations will fail.');
    logger.error('Please ensure MongoDB is running and MONGODB_URI is correct in .env');
  }
};

module.exports = connectDB;
