const axios = require('axios');
const WeatherCache = require('../models/WeatherCache');
const logger = require('../utils/logger');
const mongoose = require('mongoose');

class WeatherService {
  constructor() {
    this.defaultCoords = { lat: 18.5204, lon: 73.8567, name: 'Pune, Maharashtra' };
  }

  getGoogleApiKey() {
    return (process.env.GOOGLE_WEATHER_API_KEY || process.env.WEATHER_API_KEY || '').trim();
  }

  isGoogleWeatherConfigured() {
    return Boolean(this.getGoogleApiKey());
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

  // --- Google Maps Platform Weather API fetchers ---
  async _fetchGoogleCurrentWeather(coords) {
    const apiKey = this.getGoogleApiKey();
    const url = `https://weather.googleapis.com/v1/currentConditions:lookup?key=${apiKey}&location.latitude=${coords.lat}&location.longitude=${coords.lon}&unitsSystem=METRIC`;
    const res = await axios.get(url, { timeout: 8000 });
    const data = res.data;

    if (!data || !data.temperature) {
      throw new Error('Invalid response structure from Google Weather API');
    }

    const temp = Math.round(data.temperature.degrees);
    const feelsLike = Math.round(data.feelsLikeTemperature ? data.feelsLikeTemperature.degrees : temp);
    const condition = data.weatherCondition?.description?.text || 'Clear';
    const humidity = Math.round(data.relativeHumidity != null ? data.relativeHumidity : 65);
    const windSpeed = Math.round(data.wind?.speed?.value || 0);
    const windDir = Math.round(data.wind?.direction?.degrees || 0);
    const pressure = Math.round(data.airPressure?.meanSeaLevelMillibars || 1013);
    const rain = data.precipitation?.qpf?.quantity || 0;
    const icon = data.weatherCondition?.iconBaseUri || 'https://maps.gstatic.com/weather/v1/cloudy';

    return {
      temperature: temp,
      temp: temp,
      feelsLike,
      humidity,
      windSpeed,
      windDirection: windDir,
      pressure,
      description: condition,
      condition,
      icon,
      clouds: Math.round(data.cloudCover || 0),
      rain,
      uvIndex: data.uvIndex || 0,
      dewPoint: data.dewPoint ? Math.round(data.dewPoint.degrees) : 20,
      location: coords.name,
      country: 'IN',
      fetchedAt: new Date(),
      source: 'Google Maps Platform Weather API (Live)',
      isLive: true,
      isConfigured: true,
      provider: 'google-weather-api'
    };
  }

  async _fetchGoogleForecast(coords) {
    const apiKey = this.getGoogleApiKey();
    const url = `https://weather.googleapis.com/v1/forecast/days:lookup?key=${apiKey}&location.latitude=${coords.lat}&location.longitude=${coords.lon}&days=5&unitsSystem=METRIC`;
    const res = await axios.get(url, { timeout: 8000 });
    const forecastDays = res.data?.forecastDays;

    if (!forecastDays || !Array.isArray(forecastDays) || forecastDays.length === 0) {
      throw new Error('Invalid daily forecast structure from Google Weather API');
    }

    return forecastDays.slice(0, 5).map((day, idx) => {
      const d = day.displayDate || {};
      const dateStr = (d.year && d.month && d.day)
        ? `${d.year}-${String(d.month).padStart(2, '0')}-${String(d.day).padStart(2, '0')}`
        : new Date(Date.now() + idx * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const daytime = day.daytimeForecast || {};
      const nighttime = day.nighttimeForecast || {};

      const tMax = Math.round(day.maxTemperature?.degrees || daytime.temperature?.degrees || 30);
      const tMin = Math.round(day.minTemperature?.degrees || nighttime.temperature?.degrees || 20);
      const avgTemp = Math.round((tMax + tMin) / 2);
      const cond = daytime.weatherCondition?.description?.text || day.weatherCondition?.description?.text || 'Partly Cloudy';
      const icon = daytime.weatherCondition?.iconBaseUri || 'https://maps.gstatic.com/weather/v1/cloudy';

      return {
        date: dateStr,
        temp: avgTemp,
        temperature: avgTemp,
        tempMax: tMax,
        tempMin: tMin,
        condition: cond,
        description: cond,
        icon,
        humidity: Math.round(daytime.relativeHumidity || 65),
        windSpeed: Math.round(daytime.wind?.speed?.value || 10),
        precipitation: daytime.precipitation?.probability?.percent || 0,
        source: 'Google Maps Platform Weather API (Live)',
        isLive: true,
        isConfigured: true,
        provider: 'google-weather-api',
        fetchedAt: new Date()
      };
    });
  }

  async _fetchGoogleHourlyForecast(coords) {
    const apiKey = this.getGoogleApiKey();
    const url = `https://weather.googleapis.com/v1/forecast/hours:lookup?key=${apiKey}&location.latitude=${coords.lat}&location.longitude=${coords.lon}&hours=24&unitsSystem=METRIC`;
    const res = await axios.get(url, { timeout: 8000 });
    const hours = res.data?.forecastHours;

    if (!hours || !Array.isArray(hours)) {
      throw new Error('Invalid hourly forecast structure from Google Weather API');
    }

    return hours.slice(0, 24).map((h, i) => {
      const t = Math.round(h.temperature?.degrees || 25);
      const cond = h.weatherCondition?.description?.text || 'Clear';
      const icon = h.weatherCondition?.iconBaseUri || 'https://maps.gstatic.com/weather/v1/cloudy';
      return {
        time: h.interval?.startTime || new Date(Date.now() + i * 3600000).toISOString(),
        temp: t,
        temperature: t,
        feelsLike: Math.round(h.feelsLikeTemperature?.degrees || t),
        condition: cond,
        description: cond,
        icon,
        humidity: Math.round(h.relativeHumidity || 65),
        windSpeed: Math.round(h.wind?.speed?.value || 10),
        precipitation: h.precipitation?.probability?.percent || 0,
        source: 'Google Maps Platform Weather API (Live)',
        isLive: true,
        isConfigured: true,
        provider: 'google-weather-api'
      };
    });
  }

  // --- Open-Meteo Fallback Fetchers ---
  async _fetchOpenMeteoCurrentWeather(coords) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,cloud_cover,surface_pressure,wind_speed_10m,wind_direction_10m&timezone=auto`;
    const res = await axios.get(url, { timeout: 7000 });
    const current = res.data?.current;

    if (!current) throw new Error('Invalid weather data structure from Open-Meteo');

    const temp = Math.round(current.temperature_2m);
    const conditionDesc = this._getWeatherDescription(current.weather_code);

    return {
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
      source: 'Open-Meteo (Live Global Meteorological Data - Keyless Fallback)',
      isLive: true,
      isConfigured: true,
      provider: 'open-meteo'
    };
  }

  async _fetchOpenMeteoForecast(coords) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&daily=weather_code,temperature_2m_max,temperature_2m_min,relative_humidity_2m_mean,precipitation_sum,wind_speed_10m_max&timezone=auto`;
    const res = await axios.get(url, { timeout: 7000 });
    const daily = res.data?.daily;

    if (!daily || !Array.isArray(daily.time)) {
      throw new Error('Invalid forecast structure from Open-Meteo');
    }

    return daily.time.slice(0, 5).map((dateStr, i) => {
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
        source: 'Open-Meteo (Live Global Meteorological Data - Keyless Fallback)',
        isLive: true,
        isConfigured: true,
        provider: 'open-meteo',
        fetchedAt: new Date()
      };
    });
  }

  async _fetchOpenMeteoHourlyForecast(coords) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability,weather_code,wind_speed_10m&forecast_days=2&timezone=auto`;
    const res = await axios.get(url, { timeout: 7000 });
    const hourly = res.data?.hourly;

    if (!hourly || !Array.isArray(hourly.time)) {
      throw new Error('Invalid hourly forecast structure from Open-Meteo');
    }

    return hourly.time.slice(0, 24).map((timeStr, i) => {
      const temp = Math.round(hourly.temperature_2m[i]);
      const conditionDesc = this._getWeatherDescription(hourly.weather_code[i]);

      return {
        time: timeStr,
        temp,
        temperature: temp,
        feelsLike: Math.round(hourly.apparent_temperature[i]),
        condition: conditionDesc,
        description: conditionDesc,
        icon: this._getWeatherIcon(hourly.weather_code[i]),
        humidity: Math.round(hourly.relative_humidity_2m[i]),
        windSpeed: Math.round(hourly.wind_speed_10m[i]),
        precipitation: hourly.precipitation_probability ? hourly.precipitation_probability[i] : 0,
        source: 'Open-Meteo (Live Global Meteorological Data - Keyless Fallback)',
        isLive: true,
        isConfigured: true,
        provider: 'open-meteo'
      };
    });
  }

  // --- Public API methods with Cache & Multi-Tier Fallback ---
  async getCurrentWeather(lat, lon, locationName) {
    const coords = await this._resolveCoordinates(lat, lon, locationName);
    const cacheKey = `weather_${coords.lat.toFixed(2)}_${coords.lon.toFixed(2)}_current`;

    // 1. Check cache
    if (mongoose.connection.readyState === 1) {
      try {
        const cached = await WeatherCache.findOne({ locationKey: cacheKey, expiresAt: { $gt: new Date() } });
        if (cached && cached.data) return cached.data;
      } catch (e) {}
    }

    let result = null;

    // 2. Try Google Maps Platform Weather API if configured
    if (this.isGoogleWeatherConfigured()) {
      try {
        result = await this._fetchGoogleCurrentWeather(coords);
      } catch (googleErr) {
        logger.warn(`Google Weather API lookup failed (${googleErr.message}). Falling back to Open-Meteo.`);
      }
    }

    // 3. Fallback to Open-Meteo
    if (!result) {
      try {
        result = await this._fetchOpenMeteoCurrentWeather(coords);
      } catch (omErr) {
        logger.warn(`Open-Meteo weather lookup failed (${omErr.message}). Falling back to offline Agromet baseline.`);
      }
    }

    // 4. Fallback to baseline
    if (!result) {
      result = this._getOfflineCurrentWeather(coords.name);
    }

    // Save to cache
    if (mongoose.connection.readyState === 1 && result) {
      try {
        await WeatherCache.findOneAndUpdate(
          { locationKey: cacheKey },
          {
            locationKey: cacheKey,
            lat: coords.lat,
            lon: coords.lon,
            data: result,
            provider: result.provider || 'weather-service',
            fetchedAt: new Date(),
            expiresAt: new Date(Date.now() + 30 * 60 * 1000)
          },
          { upsert: true, new: true }
        );
      } catch (e) {}
    }

    return result;
  }

  async getForecast(lat, lon, locationName) {
    const coords = await this._resolveCoordinates(lat, lon, locationName);
    const cacheKey = `weather_${coords.lat.toFixed(2)}_${coords.lon.toFixed(2)}_forecast`;

    // 1. Check cache
    if (mongoose.connection.readyState === 1) {
      try {
        const cached = await WeatherCache.findOne({ locationKey: cacheKey, expiresAt: { $gt: new Date() } });
        if (cached && cached.data) return cached.data;
      } catch (e) {}
    }

    let result = null;

    // 2. Try Google Maps Platform Weather API if configured
    if (this.isGoogleWeatherConfigured()) {
      try {
        result = await this._fetchGoogleForecast(coords);
      } catch (googleErr) {
        logger.warn(`Google Weather daily forecast failed (${googleErr.message}). Falling back to Open-Meteo.`);
      }
    }

    // 3. Fallback to Open-Meteo
    if (!result) {
      try {
        result = await this._fetchOpenMeteoForecast(coords);
      } catch (omErr) {
        logger.warn(`Open-Meteo forecast failed (${omErr.message}). Falling back to offline Agromet baseline.`);
      }
    }

    // 4. Fallback to baseline
    if (!result) {
      result = this._getOfflineForecast(coords.name);
    }

    // Save to cache
    if (mongoose.connection.readyState === 1 && result) {
      try {
        await WeatherCache.findOneAndUpdate(
          { locationKey: cacheKey },
          {
            locationKey: cacheKey,
            lat: coords.lat,
            lon: coords.lon,
            data: result,
            provider: this.isGoogleWeatherConfigured() ? 'google-weather-api' : 'open-meteo',
            fetchedAt: new Date(),
            expiresAt: new Date(Date.now() + 60 * 60 * 1000)
          },
          { upsert: true, new: true }
        );
      } catch (e) {}
    }

    return result;
  }

  async getHourlyForecast(lat, lon, locationName) {
    const coords = await this._resolveCoordinates(lat, lon, locationName);
    const cacheKey = `weather_${coords.lat.toFixed(2)}_${coords.lon.toFixed(2)}_hourly`;

    if (mongoose.connection.readyState === 1) {
      try {
        const cached = await WeatherCache.findOne({ locationKey: cacheKey, expiresAt: { $gt: new Date() } });
        if (cached && cached.data) return cached.data;
      } catch (e) {}
    }

    let result = null;

    if (this.isGoogleWeatherConfigured()) {
      try {
        result = await this._fetchGoogleHourlyForecast(coords);
      } catch (googleErr) {
        logger.warn(`Google Weather hourly forecast failed (${googleErr.message}). Falling back to Open-Meteo.`);
      }
    }

    if (!result) {
      try {
        result = await this._fetchOpenMeteoHourlyForecast(coords);
      } catch (omErr) {
        logger.warn(`Open-Meteo hourly forecast failed (${omErr.message}).`);
      }
    }

    if (!result) {
      // Offline fallback: 24 hourly steps from current baseline
      result = [];
      for (let i = 0; i < 24; i++) {
        result.push({
          time: new Date(Date.now() + i * 3600000).toISOString(),
          temp: 26 + (i % 6),
          temperature: 26 + (i % 6),
          condition: 'Partly Cloudy',
          description: 'Partly Cloudy',
          humidity: 65,
          windSpeed: 10,
          source: 'Regional Agromet Advisory (Offline Baseline)',
          isLive: false,
          isConfigured: false
        });
      }
    }

    if (mongoose.connection.readyState === 1 && result) {
      try {
        await WeatherCache.findOneAndUpdate(
          { locationKey: cacheKey },
          {
            locationKey: cacheKey,
            lat: coords.lat,
            lon: coords.lon,
            data: result,
            provider: this.isGoogleWeatherConfigured() ? 'google-weather-api' : 'open-meteo',
            fetchedAt: new Date(),
            expiresAt: new Date(Date.now() + 30 * 60 * 1000)
          },
          { upsert: true, new: true }
        );
      } catch (e) {}
    }

    return result;
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
