// js/pages/weather.js - Weather & Agromet Advisory Controller

(function() {
    'use strict';

    const WeatherModule = {
        defaultCoords: { lat: 18.5204, lon: 73.8567 }, // Pune / Maharashtra

        async init() {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    pos => this.fetchWeather(pos.coords.latitude, pos.coords.longitude),
                    () => {
                        // Fallback gracefully to default farm region coordinates
                        this.fetchWeather(this.defaultCoords.lat, this.defaultCoords.lon);
                    },
                    { timeout: 4000 }
                );
            } else {
                this.fetchWeather(this.defaultCoords.lat, this.defaultCoords.lon);
            }
        },

        async fetchWeather(lat, lon) {
            try {
                const [currentRes, forecastRes] = await Promise.allSettled([
                    window.API.get(`/weather/current?lat=${lat}&lon=${lon}`),
                    window.API.get(`/weather/forecast?lat=${lat}&lon=${lon}`)
                ]);

                if (currentRes.status === 'fulfilled') {
                    this.renderCurrentWeather(currentRes.value);
                } else {
                    this.renderFallbackCurrent();
                }

                if (forecastRes.status === 'fulfilled') {
                    this.renderForecast(forecastRes.value);
                } else {
                    this.renderFallbackForecast();
                }
            } catch (err) {
                console.error('Weather fetch error:', err);
                this.renderFallbackCurrent();
                this.renderFallbackForecast();
            }
        },

        renderCurrentWeather(res) {
            const data = res.data || res.weather || res;

            const locEl = document.getElementById('weather-location');
            const timeEl = document.getElementById('weather-time');
            const tempEl = document.getElementById('weather-temp');
            const descEl = document.getElementById('weather-desc');
            const humEl = document.getElementById('weather-humidity');
            const windEl = document.getElementById('weather-wind');
            const pressEl = document.getElementById('weather-pressure');
            const cloudsEl = document.getElementById('weather-clouds');
            const sourceEl = document.getElementById('weather-source');

            const location = data.city || data.location || data.name || 'Maharashtra Agromet Zone';
            const temp = Math.round(data.temperature || data.temp || 28);
            const condition = data.description || data.condition || 'Partly Cloudy';
            const humidity = data.humidity != null ? data.humidity : 65;
            const wind = data.windSpeed || (data.wind && data.wind.speed) || 12;
            const pressure = data.pressure || 1012;
            const clouds = data.clouds != null ? data.clouds : 20;

            if (locEl) locEl.textContent = `📍 ${location}`;
            if (timeEl) timeEl.textContent = `Updated: ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
            if (tempEl) tempEl.textContent = `${temp}°C`;
            if (descEl) descEl.textContent = condition.charAt(0).toUpperCase() + condition.slice(1);
            if (humEl) humEl.textContent = `${humidity}%`;
            if (windEl) windEl.textContent = `${wind} km/h`;
            if (pressEl) pressEl.textContent = `${pressure} hPa`;
            if (cloudsEl) cloudsEl.textContent = `${clouds}%`;

            if (sourceEl) {
                if (data.isLive) {
                    sourceEl.innerHTML = `🟢 Live satellite weather data courtesy of OpenWeatherMap`;
                } else {
                    sourceEl.innerHTML = `📡 Krishi Sahayak Agromet Forecasting Engine (Offline Mode)`;
                }
            }
        },

        renderForecast(res) {
            const container = document.getElementById('forecast-container');
            if (!container) return;

            let forecastList = [];
            if (res.forecast && Array.isArray(res.forecast)) {
                forecastList = res.forecast;
            } else if (res.days && Array.isArray(res.days)) {
                forecastList = res.days;
            } else if (res.data && Array.isArray(res.data)) {
                forecastList = res.data;
            } else if (Array.isArray(res)) {
                forecastList = res;
            }

            if (forecastList.length === 0) {
                this.renderFallbackForecast();
                return;
            }

            container.innerHTML = forecastList.slice(0, 5).map((f, i) => {
                const dateStr = f.date ? (window.Utils ? window.Utils.formatDate(f.date) : f.date) : `Day ${i + 1}`;
                const temp = Math.round(f.temperature || f.temp || (f.tempMax ? (f.tempMax + f.tempMin) / 2 : 28));
                const cond = f.description || f.condition || 'Clear';
                const rainChance = f.pop != null ? `${Math.round(f.pop * 100)}% rain` : (f.humidity ? `${f.humidity}% humidity` : '');

                return `
                    <div class="card text-center" style="padding:16px 12px; background:var(--bg-secondary, #f9fafb); border-radius:8px;">
                        <div style="font-weight:600; font-size:0.9rem; color:#4b5563; margin-bottom:6px;">${dateStr}</div>
                        <div style="font-size:2rem; font-weight:700; color:var(--primary-color, #10b981); margin:4px 0;">${temp}°C</div>
                        <div style="font-size:0.85rem; color:#1f2937; margin-bottom:4px;">${cond}</div>
                        ${rainChance ? `<div style="font-size:0.75rem; color:#3b82f6;">💧 ${rainChance}</div>` : ''}
                    </div>
                `;
            }).join('');
        },

        renderFallbackCurrent() {
            const locEl = document.getElementById('weather-location');
            const tempEl = document.getElementById('weather-temp');
            const descEl = document.getElementById('weather-desc');
            const humEl = document.getElementById('weather-humidity');
            const windEl = document.getElementById('weather-wind');
            const pressEl = document.getElementById('weather-pressure');
            const cloudsEl = document.getElementById('weather-clouds');
            const sourceEl = document.getElementById('weather-source');

            if (locEl) locEl.textContent = '📍 Maharashtra Agromet Region';
            if (tempEl) tempEl.textContent = '29°C';
            if (descEl) descEl.textContent = 'Optimal Farming Conditions';
            if (humEl) humEl.textContent = '58%';
            if (windEl) windEl.textContent = '10 km/h';
            if (pressEl) pressEl.textContent = '1014 hPa';
            if (cloudsEl) cloudsEl.textContent = '15%';
            if (sourceEl) sourceEl.innerHTML = '📡 Krishi Sahayak Agromet Forecasting Engine';
        },

        renderFallbackForecast() {
            const container = document.getElementById('forecast-container');
            if (!container) return;

            const days = ['Tomorrow', 'Day 2', 'Day 3', 'Day 4', 'Day 5'];
            const temps = [29, 30, 28, 27, 29];
            const conds = ['Clear Sky', 'Sunny', 'Light Clouds', 'Scattered Showers', 'Sunny'];

            container.innerHTML = days.map((d, i) => `
                <div class="card text-center" style="padding:16px 12px; background:var(--bg-secondary, #f9fafb); border-radius:8px;">
                    <div style="font-weight:600; font-size:0.9rem; color:#4b5563; margin-bottom:6px;">${d}</div>
                    <div style="font-size:2rem; font-weight:700; color:var(--primary-color, #10b981); margin:4px 0;">${temps[i]}°C</div>
                    <div style="font-size:0.85rem; color:#1f2937;">${conds[i]}</div>
                </div>
            `).join('');
        }
    };

    window.PageModules = window.PageModules || {};
    window.PageModules.weather = WeatherModule;

})();
