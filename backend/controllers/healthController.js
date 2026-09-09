const { success, error, paginated } = require('../utils/apiResponse');
const logger = require('../utils/logger');
const mongoose = require('mongoose');
const appConfig = require('../config/app');
exports.check = async (req, res) => { return res.json({ status: 'ok', database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected', version: appConfig ? appConfig.appVersion : '1.0.0', timestamp: new Date(), uptime: process.uptime() }); };
