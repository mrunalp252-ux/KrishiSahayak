const { success, error } = require('../utils/apiResponse');
const logger = require('../utils/logger');
const mongoose = require('mongoose');
const appConfig = require('../config/app');
const database = require('../config/database');
const aiService = require('../services/aiService');

exports.check = async (req, res) => {
  const dbStatus = database.getSafeDbStatus ? database.getSafeDbStatus() : { state: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' };

  return res.json({
    status: 'ok',
    database: dbStatus.state,
    dbDetails: dbStatus,
    services: {
      ai: {
        configured: aiService.isConfigured(),
        provider: aiService.getProvider(),
        model: aiService.getModel()
      },
      weather: {
        provider: 'open-meteo',
        keyless: true,
        configured: true
      }
    },
    version: appConfig ? appConfig.appVersion : '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
};
