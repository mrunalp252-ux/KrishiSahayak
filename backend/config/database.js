const mongoose = require('mongoose');
const logger = require('../utils/logger');

// Disable buffering so queries fail-fast immediately instead of hanging for 10 seconds
mongoose.set('bufferCommands', false);

let reconnectInterval = null;

const getSafeDbStatus = () => {
  const stateNames = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  const readyState = mongoose.connection.readyState;
  const state = stateNames[readyState] || 'unknown';
  
  const rawUri = process.env.MONGODB_URI || '';
  let sanitizedHost = 'unconfigured';
  let isAtlas = false;
  let isLocal = false;

  if (rawUri) {
    try {
      // Extract hostname without credentials
      const atIndex = rawUri.indexOf('@');
      if (atIndex !== -1) {
        const afterAt = rawUri.substring(atIndex + 1).split('/')[0].split('?')[0];
        sanitizedHost = afterAt;
        isAtlas = afterAt.includes('mongodb.net');
      } else {
        const withoutProto = rawUri.replace(/^mongodb(\+srv)?:\/\//, '');
        sanitizedHost = withoutProto.split('/')[0].split('?')[0];
      }
      isLocal = sanitizedHost.includes('127.0.0.1') || sanitizedHost.includes('localhost');
    } catch (e) {
      sanitizedHost = 'configured';
    }
  }

  return {
    state,
    connected: readyState === 1,
    configured: Boolean(rawUri),
    host: sanitizedHost,
    isAtlas,
    isLocal
  };
};

const connectDB = async () => {
  try {
    if (mongoose.connection.readyState === 1 || mongoose.connection.readyState === 2) {
      return;
    }

    const isProd = process.env.NODE_ENV === 'production';
    const rawURI = process.env.NODE_ENV === 'test'
      ? (process.env.TEST_MONGODB_URI || 'mongodb://127.0.0.1:27017/krishi-sahayak-test')
      : process.env.MONGODB_URI;

    if (isProd && (!rawURI || rawURI.includes('127.0.0.1') || rawURI.includes('localhost'))) {
      logger.warn('[DATABASE CONFIG] Running in production but MONGODB_URI is not pointing to a remote cluster (Atlas). Please set MONGODB_URI in Render environment settings.');
    }

    const mongoURI = rawURI || 'mongodb://127.0.0.1:27017/krishi-sahayak';

    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      family: 4
    });

    if (reconnectInterval) {
      clearInterval(reconnectInterval);
      reconnectInterval = null;
    }
  } catch (error) {
    logger.error(`MongoDB connection error: ${error.message}`);
    logger.warn('Server running without active database connection. Retrying in background...');
    
    // Auto retry every 15s if not already scheduling
    if (!reconnectInterval && process.env.NODE_ENV !== 'test') {
      reconnectInterval = setInterval(async () => {
        if (mongoose.connection.readyState === 0) {
          try {
            logger.info('Attempting background MongoDB reconnection...');
            await connectDB();
          } catch (e) {}
        }
      }, 15000);
    }
  }
};

mongoose.connection.on('connected', () => {
  logger.info('MongoDB connected successfully');
  if (reconnectInterval) {
    clearInterval(reconnectInterval);
    reconnectInterval = null;
  }
});

mongoose.connection.on('error', (err) => {
  logger.error(`MongoDB runtime connection error: ${err.message}`);
});

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected');
});

connectDB.getSafeDbStatus = getSafeDbStatus;

module.exports = connectDB;
