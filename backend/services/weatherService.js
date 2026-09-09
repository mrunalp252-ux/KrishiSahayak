const axios = require('axios');
const WeatherCache = require('../models/WeatherCache');
const logger = require('../utils/logger');
const mongoose = require('mongoose');

class WeatherService {
  constructor() {
    this.defaultCoords = { lat: 18.5204, lon: 73.8567, name: 'Pune, Maharashtra' };
  }

  _getWeatherDescription(code) {
    const codes = {
      0: 'Clear Sky',
      1: 'Mainly Clear',
      2: 'Partly Cloudy',
      3: 'Overcast',
      45: 'Fog',
      48: 'Depositing Rime Fog',
      51: 'Light Drizzle',
      53: 'Moderate Drizzle',
      55: 'Dense Drizzle',
      56: 'Light Freezing Drizzle',
      57: 'Dense Freezing Drizzle',
      61: 'Slight Rain',
      63: 'Moderate Rain',
      65: 'Heavy Rain',
      71: 'Slight Snow',
      73: 'Moderate Snow',
      75: 'Heavy Snow',
      80: 'Slight Rain Showers',
      81: 'Moderate Rain Showers',
      82: 'Violent Rain Showers',
      95: 'Thunderstorm',
      96: 'Thunderstorm with Hail',
      99: 'Heavy Thunderstorm with Hail'
    };
    return codes[code] || 'Partly Cloudy';
  }

  _getWeatherIcon(code) {
    if (code === 0) return '01d';
    if (code === 1 || code === 2) return '02d';
    if (code === 3) return '04d';
    if (code === 45 || code === 48) return '50d';
    if (code >= 51 && code <= 67) return '10d';
    if (code >= 71 && code <= 77) return '13d';
    if (code >= 80 && code <= 82) return '09d';
    if (code >= 95) return '11d';
    return '02d';
  }

  async _resolveCoordinates(lat, lon, locationName) {
    const parsedLat = parseFloat(lat);
    const parsedLon = parseFloat(lon);

    if (!isNaN(parsedLat) && !isNaN(parsedLon) && parsedLat >= -90 && parsedLat <= 90 && parsedLon >= -180 && parsedLon <= 180) {
      return {
        lat: parsedLat,
        lon: parsedLon,
        name: locationName || 'Farm Location'
      };
    }

    if (locationName && typeof locationName === 'string' && locationName.trim()) {
      const cleanName = locationName.split(',')[0].trim();
      try {
        const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cleanName)}&count=1&language=en&format=json`;
        const res = await axios.get(geoUrl, { timeout: 5000 });
        if (res.data?.results?.[0]) {
          const r = res.data.results[0];
          return {
            lat: r.latitude,
            lon: r.longitude,
            name: `${r.name}, ${r.admin1 || r.country || ''}`.trim().replace(/,\s*$/, '')
          };
        }
      } catch (err) {
        logger.warn(`Geocoding lookup failed for '${cleanName}', falling back to default region`);
      }
    }

    return this.defaultCoords;
  }

  async getCurrentWeather(lat, lon, locationName) {
    const coords = await this._resolveCoordinates(lat, lon, locationName);
    const cacheKey = `weather_${coords.lat.toFixed(2)}_${coords.lon.toFixed(2)}_current`;

    // Attempt cache check if DB connected
    if (mongoose.connection.readyState === 1) {
      try {
        const cached = await WeatherCache.findOne({ locationKey: cacheKey, expiresAt: { $gt: new Date() } });
        if (cached && cached.data) return cached.data;
      } catch (e) {}
    }

    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,cloud_cover,surface_pressure,wind_speed_10m,wind_direction_10m&timezone=auto`;
      const res = await axios.get(url, { timeout: 7000 });
      const current = res.data?.current;

      if (!current) throw new Error('Invalid weather data structure from Open-Meteo');

      const temp = Math.round(current.temperature_2m);
      const conditionDesc = this._getWeatherDescription(current.weather_code);

      const formatted = {
        temperature: temp,
        temp: temp,
        feelsLike: Math.round(current.apparent_temperature),
        humidity: Math.round(current.relative_humidity_2m),
        windSpeed: Math.round(current.wind_speed_10m),
        windDirection: Math.round(current.wind_direction_10m || 0),
        pressure: Math.round(current.surface_pressure || 1013),
        description: conditionDesc,
        condition: conditionDesc,
        icon: this._getWeatherIcon(current.weather_code),
        clouds: Math.round(current.cloud_cover || 0),
        rain: current.precipitation || 0,
        location: coords.name,
        country: 'IN',
        fetchedAt: new Date(),
        source: 'Open-Meteo (Live Global Meteorological Data - Keyless)',
        isLive: true,
        isConfigured: true
      };

      // Save to cache if DB connected
      if (mongoose.connection.readyState === 1) {
        try {
          await WeatherCache.findOneAndUpdate(
            { locationKey: cacheKey },
            {
              locationKey: cacheKey,
              lat: coords.lat,
              lon: coords.lon,
              data: formatted,
              provider: 'open-meteo',
              fetchedAt: new Date(),
              expiresAt: new Date(Date.now() + 30 * 60 * 1000)
            },
            { upsert: true, new: true }
          );
        } catch (e) {}
      }

      return formatted;
    } catch (err) {
      logger.warn('Live weather fetch from Open-Meteo failed, returning baseline:', err.message);
      return this._getOfflineCurrentWeather(coords.name);
    }
  }

  async getForecast(lat, lon, locationName) {
    const coords = await this._resolveCoordinates(lat, lon, locationName);
    const cacheKey = `weather_${coords.lat.toFixed(2)}_${coords.lon.toFixed(2)}_forecast`;

    // Attempt cache check if DB connected
    if (mongoose.connection.readyState === 1) {
      try {
        const cached = await WeatherCache.findOne({ locationKey: cacheKey, expiresAt: { $gt: new Date() } });
        if (cached && cached.data) return cached.data;
      } catch (e) {}
    }

    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&daily=weather_code,temperature_2m_max,temperature_2m_min,relative_humidity_2m_mean,precipitation_sum,wind_speed_10m_max&timezone=auto`;
      const res = await axios.get(url, { timeout: 7000 });
      const daily = res.data?.daily;

      if (!daily || !Array.isArray(daily.time)) {
        throw new Error('Invalid forecast structure from Open-Meteo');
      }

      const days = daily.time.slice(0, 5).map((dateStr, i) => {
        const tMax = Math.round(daily.temperature_2m_max[i]);
        const tMin = Math.round(daily.temperature_2m_min[i]);
        const avgTemp = Math.round((tMax + tMin) / 2);
        const conditionDesc = this._getWeatherDescription(daily.weather_code[i]);

        return {
          date: dateStr,
          temp: avgTemp,
          temperature: avgTemp,
          tempMax: tMax,
          tempMin: tMin,
          condition: conditionDesc,
          description: conditionDesc,
          icon: this._getWeatherIcon(daily.weather_code[i]),
          humidity: daily.relative_humidity_2m_mean ? Math.round(daily.relative_humidity_2m_mean[i]) : 65,
          windSpeed: Math.round(daily.wind_speed_10m_max[i] || 10),
          precipitation: daily.precipitation_sum[i] || 0,
          source: 'Open-Meteo (Live Global Meteorological Data - Keyless)',
          isLive: true,
          isConfigured: true,
          fetchedAt: new Date()
        };
      });

      if (mongoose.connection.readyState === 1) {
        try {
          await WeatherCache.findOneAndUpdate(
            { locationKey: cacheKey },
            {
              locationKey: cacheKey,
              lat: coords.lat,
              lon: coords.lon,
              data: days,
              provider: 'open-meteo',
              fetchedAt: new Date(),
              expiresAt: new Date(Date.now() + 60 * 60 * 1000)
            },
            { upsert: true, new: true }
          );
        } catch (e) {}
      }

      return days;
    } catch (err) {
      logger.warn('Live forecast fetch from Open-Meteo failed, returning baseline:', err.message);
      return this._getOfflineForecast(coords.name);
    }
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
      icon: '02d',
      clouds: 35,
      rain: 0,
      location: typeof location === 'string' && !location.includes('_') ? location : 'Pune, Maharashtra',
      country: 'IN',
      fetchedAt: new Date(),
      source: 'Regional Agromet Advisory (Offline Baseline)',
      isLive: false,
      isConfigured: false,
      note: 'Displaying regional agro-meteorological advisory baseline.'
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
        icon: '02d',
        humidity: 60 + i * 2,
        windSpeed: 10 + i,
        source: 'Regional Agromet Advisory (Offline Baseline)',
        isLive: false,
        isConfigured: false,
        fetchedAt: new Date()
      });
    }
    return days;
  }
}

module.exports = new WeatherService();
