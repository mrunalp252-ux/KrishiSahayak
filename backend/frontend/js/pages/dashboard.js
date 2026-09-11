// js/pages/dashboard.js

window.PageModules = window.PageModules || {};

window.PageModules.dashboard = {
    async init() {
        this.setDate();
        this.setWelcome();
        
        // Load all data in parallel, catch each independently
        await Promise.allSettled([
            this.loadStats(),
            this.loadRecentActivities(),
            this.loadRecentAdvisories(),
        ]);
    },

    setDate() {
        const el = document.getElementById('dashboard-date');
        if (el) {
            const now = new Date();
            const options = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' };
            el.textContent = window.I18n ? window.I18n.formatDate(now, options) : now.toLocaleDateString('en-IN', options);
        }
    },

    setWelcome() {
        const el = document.getElementById('welcome-text');
        const user = window.Auth ? window.Auth.getUser() : null;
        if (el && user) {
            const greeting = window.I18n ? window.I18n.translate('welcome_back') : 'Welcome back';
            el.textContent = `${greeting}, ${user.name || 'Farmer'}!`;
        }
    },

    async loadStats() {
        let primaryLocation = null;
        let primaryCoords = null;

        try {
            const result = await window.API.get('/farms');
            const farms = result.farms || result.data || [];
            const farmCount = Array.isArray(farms) ? farms.length : 0;
            
            const el = document.getElementById('stat-farms');
            if (el) el.textContent = farmCount;
            
            // Count active crops
            let activeCrops = 0;
            if (Array.isArray(farms) && farms.length > 0) {
                activeCrops = farms.filter(f => f.currentCrop).length;
                const f = farms[0];
                if (f.location && f.location.lat && f.location.lon) {
                    primaryCoords = { lat: f.location.lat, lon: f.location.lon };
                } else if (f.district || f.village || f.state) {
                    primaryLocation = [f.village, f.district, f.state].filter(Boolean).join(', ');
                }
            }
            const cropEl = document.getElementById('stat-crops');
            if (cropEl) cropEl.textContent = activeCrops;
        } catch(e) {
            console.warn('Stats error:', e);
            const el = document.getElementById('stat-farms');
            if (el) el.textContent = '0';
            const cropEl = document.getElementById('stat-crops');
            if (cropEl) cropEl.textContent = '0';
        }

        // Weather UI updater
        const updateWeatherUI = (raw) => {
            const tempEl = document.getElementById('stat-weather');
            const descEl = document.getElementById('stat-weather-desc');
            const wd = (raw && raw.data && typeof raw.data === 'object' && !Array.isArray(raw.data)) ? raw.data : (raw || {});
            const temp = Math.round(wd.temperature != null ? wd.temperature : (wd.temp != null ? wd.temp : 28));
            const desc = wd.description || wd.condition || 'Clear Sky';
            if (tempEl) tempEl.textContent = `${temp}°C`;
            if (descEl) descEl.textContent = desc.charAt(0).toUpperCase() + desc.slice(1);
        };

        const fetchWeather = async (lat, lon, loc) => {
            try {
                let url = `/weather/current?lat=${lat}&lon=${lon}`;
                if (loc) url += `&location=${encodeURIComponent(loc)}`;
                const weather = await window.API.get(url);
                const wd = weather.data || weather.weather || weather;
                updateWeatherUI(wd);
            } catch (err) {
                updateWeatherUI({ temp: 28, description: 'Favorable Agromet Conditions' });
            }
        };

        // If user has a farm with known location, use it immediately
        if (primaryCoords) {
            fetchWeather(primaryCoords.lat, primaryCoords.lon, primaryLocation);
        } else if (primaryLocation) {
            fetchWeather(18.5204, 73.8567, primaryLocation);
        } else if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                pos => fetchWeather(pos.coords.latitude, pos.coords.longitude),
                () => fetchWeather(18.5204, 73.8567),
                { timeout: 2500 }
            );
        } else {
            fetchWeather(18.5204, 73.8567);
        }

        // Try advisories count
        try {
            const advResult = await window.API.get('/advisories?limit=1');
            const total = (advResult.pagination && advResult.pagination.total != null) 
                ? advResult.pagination.total 
                : (Array.isArray(advResult.advisories) ? advResult.advisories.length : (Array.isArray(advResult.data) ? advResult.data.length : 0));
            const el = document.getElementById('stat-advisories');
            if (el) el.textContent = total;
        } catch(e) {
            const el = document.getElementById('stat-advisories');
            if (el) el.textContent = '0';
        }
    },

    async loadRecentActivities() {
        const container = document.getElementById('dashboard-activities');
        if (!container) return;
        
        try {
            const result = await window.API.get('/farm-activities', { limit: 5, sort: '-scheduledDate' });
            const activities = (result && Array.isArray(result.data)) 
                ? result.data 
                : ((result && Array.isArray(result.activities)) ? result.activities : (Array.isArray(result) ? result : []));
            
            if (!Array.isArray(activities) || activities.length === 0) {
                container.innerHTML = '<div class="empty-state"><p>No recent activities. Plan your farm activities using the Farm Planner.</p></div>';
                return;
            }
            
            container.innerHTML = activities.map(act => `
                <div class="timeline-item">
                    <h4>${window.Utils.sanitizeHtml(act.title || (window.Utils.formatLabel ? window.Utils.formatLabel(act.activityType) : act.activityType) || 'Activity')}</h4>
                    <p class="text-secondary">${window.Utils.formatDate(act.scheduledDate || act.createdAt)}</p>
                </div>
            `).join('');
        } catch(e) {
            container.innerHTML = '<div class="empty-state"><p>No recent activities found. Use Farm Planner to schedule tasks.</p></div>';
        }
    },

    async loadRecentAdvisories() {
        const container = document.getElementById('dashboard-advisories');
        if (!container) return;
        
        try {
            const result = await window.API.get('/advisories?limit=3');
            const advisories = (result && Array.isArray(result.advisories)) 
                ? result.advisories 
                : ((result && Array.isArray(result.data)) ? result.data : (Array.isArray(result) ? result : []));
            
            if (!Array.isArray(advisories) || advisories.length === 0) {
                container.innerHTML = '<div class="empty-state"><p>No active advisories for your region currently.</p></div>';
                return;
            }
            
            const severityColors = { high: 'var(--error)', critical: 'var(--error)', warning: 'var(--warning)', medium: 'var(--warning)', low: 'var(--info)', info: 'var(--info)' };
            container.innerHTML = advisories.map(adv => `
                <div style="border-left: 4px solid ${severityColors[adv.severity] || 'var(--info)'}; padding-left: 1rem; margin-bottom: 1rem;">
                    <h4 style="margin-bottom: 0.25rem;">${window.Utils.sanitizeHtml(adv.title)}</h4>
                    <p class="text-secondary mb-1">${window.Utils.truncate(adv.message || '', 100)}</p>
                    <span class="badge badge-${(adv.severity === 'high' || adv.severity === 'critical') ? 'error' : (adv.severity === 'warning' || adv.severity === 'medium') ? 'warning' : 'primary'}">${window.Utils.formatLabel ? window.Utils.formatLabel(adv.severity || 'info') : 'Info'} Priority</span>
                </div>
            `).join('');
        } catch(e) {
            container.innerHTML = '<div class="empty-state"><p>No active advisories currently.</p></div>';
        }
    }
};
