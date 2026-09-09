const mongoose = require('mongoose');

const weatherCacheSchema = new mongoose.Schema(
  {
    locationKey: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    lat: {
      type: Number,
      required: true,
    },
    lon: {
      type: Number,
      required: true,
    },
    data: {
      type: Object,
      required: true,
    },
    forecast: Object,
    provider: {
      type: String,
      default: 'openweathermap',
    },
    fetchedAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: '0s' }, // TTL index to auto-delete document when expired
    },
  },
  {
    timestamps: true,
  }
);

const WeatherCache = mongoose.model('WeatherCache', weatherCacheSchema);
module.exports = WeatherCache;
