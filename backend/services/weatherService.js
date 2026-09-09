const axios = require('axios');
const WeatherCache = require('../models/WeatherCache');
const logger = require('../utils/logger');

class WeatherService {
  async getCurrentWeather(lat, lon, locationName) {
    const loc = locationName || (lat && lon ? `${lat}_${lon}` : 'Pune, Maharashtra');
    const cacheKey = `${loc}_current`;
    try {
      const cached = await WeatherCache.findOne({ key: cacheKey, expiresAt: { $gt: new Date() } });
      if (cached) return cached.data;
    } catch (e) {}

    if (!process.env.WEATHER_API_KEY) {
      return this._getOfflineCurrentWeather(loc);
    }

    try {
      const params = lat && lon ? { lat, lon } : { q: loc };
      const data = await this._callApi('/weather', params);
      const formatted = this._formatCurrentWeather(data);
      try {
        await WeatherCache.create({
          key: cacheKey,
          data: formatted,
          expiresAt: new Date(Date.now() + 30 * 60 * 1000)
        });
      } catch (e) {}
      return formatted;
    } catch (err) {
      logger.warn('Live weather fetch failed, falling back to regional agromet advisory baseline:', err.message);
      return this._getOfflineCurrentWeather(loc);
    }
  }

  async getForecast(lat, lon, locationName) {
    const loc = locationName || (lat && lon ? `${lat}_${lon}` : 'Pune, Maharashtra');
    const cacheKey = `${loc}_forecast`;
    try {
      const cached = await WeatherCache.findOne({ key: cacheKey, expiresAt: { $gt: new Date() } });
      if (cached) return cached.data;
    } catch (e) {}

    if (!process.env.WEATHER_API_KEY) {
      return this._getOfflineForecast(loc);
    }

    try {
      const params = lat && lon ? { lat, lon } : { q: loc };
      const data = await this._callApi('/forecast', params);
      const formatted = this._formatForecast(data);
      try {
        await WeatherCache.create({
          key: cacheKey,
          data: formatted,
          expiresAt: new Date(Date.now() + 60 * 60 * 1000)
        });
      } catch (e) {}
      return formatted;
    } catch (err) {
      logger.warn('Live forecast fetch failed, falling back to regional agromet baseline:', err.message);
      return this._getOfflineForecast(loc);
    }
  }

  async _callApi(endpoint, params) {
    const apiKey = (process.env.WEATHER_API_KEY || process.env.OPENWEATHER_API_KEY || '').trim();
    if (!apiKey) throw new Error('Weather API key not configured');

    const baseUrl = (process.env.WEATHER_API_URL || 'https://api.openweathermap.org/data/2.5').replace(/\/+$/, '');

    let lastError;
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const res = await axios.get(`${baseUrl}${endpoint}`, {
          params: { ...params, appid: apiKey, units: 'metric' },
          timeout: 6000
        });
        return res.data;
      } catch (err) {
        lastError = err;
        const isTransient = err.code === 'ECONNRESET' || err.code === 'ETIMEDOUT' || err.code === 'ENOTFOUND';
        if (isTransient && attempt < 2) {
          logger.warn(`Weather API transient error (${err.message}), retrying attempt 2...`);
          await new Promise(r => setTimeout(r, 1000));
          continue;
        }
        break;
      }
    }
    throw lastError;
  }

  _formatCurrentWeather(data) {
    const temp = Math.round(data.main.temp);
    const desc = data.weather[0].description;
    return {
      temperature: temp,
      temp: temp,
      feelsLike: Math.round(data.main.feels_like),
      humidity: data.main.humidity,
      windSpeed: Math.round(data.wind.speed * 3.6), // convert m/s to km/h
      windDirection: data.wind.deg,
      pressure: data.main.pressure,
      visibility: data.visibility,
      description: desc,
      condition: desc,
      icon: data.weather[0].icon,
      clouds: data.clouds.all,
      rain: data.rain ? data.rain['1h'] : 0,
      location: data.name,
      country: data.sys.country,
      sunrise: data.sys.sunrise,
      sunset: data.sys.sunset,
      fetchedAt: new Date(),
      source: 'OpenWeatherMap (Live)',
      isLive: true,
      isConfigured: true
    };
  }

  _formatForecast(data) {
    const dailyMap = new Map();
    data.list.forEach(item => {
      const date = item.dt_txt.split(' ')[0];
      if (!dailyMap.has(date) && dailyMap.size < 5) {
        const temp = Math.round(item.main.temp);
        const desc = item.weather[0].description;
        dailyMap.set(date, {
          date,
          temp,
          temperature: temp,
          condition: desc,
          description: desc,
          humidity: item.main.humidity,
          windSpeed: Math.round(item.wind.speed * 3.6),
          isLive: true
        });
      }
    });
    return Array.from(dailyMap.values());
  }

  _getOfflineCurrentWeather(location) {
    return {
      temperature: 28,
      temp: 28,
      feelsLike: 29,
      humidity: 65,
      windSpeed: 12,
      windDirection: 210,
      pressure: 1012,
      visibility: 8000,
      description: 'Partly Cloudy',
      condition: 'Partly Cloudy',
      clouds: 35,
      rain: 0,
      location: typeof location === 'string' && !location.includes('_') ? location : 'Pune, Maharashtra',
      country: 'IN',
      fetchedAt: new Date(),
      source: 'Regional Agromet Advisory (Offline - Set WEATHER_API_KEY in .env for Live Weather)',
      isLive: false,
      isConfigured: false,
      note: 'Notice: Live weather service is not configured. Displaying regional agro-meteorological advisory baseline.'
    };
  }

  _getOfflineForecast(location) {
    const days = [];
    const conditions = ['Partly Cloudy', 'Sunny', 'Scattered Clouds', 'Light Rain', 'Clear Sky'];
    const temps = [28, 30, 29, 27, 29];
    for (let i = 1; i <= 5; i++) {
      const d = new Date(Date.now() + i * 24 * 60 * 60 * 1000);
      const dateStr = d.toISOString().split('T')[0];
      days.push({
        date: dateStr,
        temp: temps[i - 1],
        temperature: temps[i - 1],
        condition: conditions[i - 1],
        description: conditions[i - 1],
        humidity: 60 + i * 2,
        windSpeed: 10 + i,
        source: 'Regional Agromet Advisory (Offline)',
        isLive: false,
        isConfigured: false,
        fetchedAt: new Date()
      });
    }
    return days;
  }
}

module.exports = new WeatherService();
