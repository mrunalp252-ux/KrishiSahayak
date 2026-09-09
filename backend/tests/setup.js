const mongoose = require('mongoose');

// Set test environment
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret';

const app = require('../server');

beforeAll(async () => {
  const mongoUri = process.env.TEST_MONGODB_URI || 'mongodb://127.0.0.1:27017/krishi-sahayak-test';
  if (mongoose.connection.readyState !== 1) {
    if (mongoose.connection.readyState !== 0) {
      try { await mongoose.disconnect(); } catch (e) {}
    }
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
  }
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    try {
      await mongoose.connection.db.dropDatabase();
    } catch (err) {
      // Ignore if can't drop
    }
    await mongoose.connection.close();
  }
});

module.exports = app;
