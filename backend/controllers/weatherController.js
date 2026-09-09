const { success, error, paginated } = require('../utils/apiResponse');
const logger = require('../utils/logger');
const weatherService = require('../services/weatherService');
exports.getCurrentWeather = async (req, res) => { try { const weather = await weatherService.getCurrentWeather(req.query.lat, req.query.lon, req.query.location || req.query.city); return res.json(success('Current weather', { data: weather })); } catch (err) { return res.status(500).json(error(err.message)); } };
exports.getForecast = async (req, res) => { try { const forecast = await weatherService.getForecast(req.query.lat, req.query.lon, req.query.location || req.query.city); return res.json(success('Weather forecast', { data: forecast })); } catch (err) { return res.status(500).json(error(err.message)); } };
