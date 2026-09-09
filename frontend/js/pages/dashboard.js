// js/pages/dashboard.js

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
        try {
            const result = await window.API.get('/farms');
            const farms = result.farms || result.data || [];
            const farmCount = Array.isArray(farms) ? farms.length : 0;
            
            const el = document.getElementById('stat-farms');
            if (el) el.textContent = farmCount;
            
            // Count active crops
            let activeCrops = 0;
            if (Array.isArray(farms)) {
                activeCrops = farms.filter(f => f.currentCrop).length;
            }
            const cropEl = document.getElementById('stat-crops');
            if (cropEl) cropEl.textContent = activeCrops;
        } catch(e) {
            console.error('Stats error:', e);
        }

        // Try weather (with graceful fallback to central agromet zone)
        const updateWeatherUI = (wd) => {
            const tempEl = document.getElementById('stat-weather');
            const descEl = document.getElementById('stat-weather-desc');
            const temp = Math.round(wd.temperature || wd.temp || 28);
            const desc = wd.description || wd.condition || 'Clear Sky';
            if (tempEl) tempEl.textContent = `${temp}°C`;
            if (descEl) descEl.textContent = desc.charAt(0).toUpperCase() + desc.slice(1);
        };

        const fetchWeatherWithCoords = async (lat, lon) => {
            try {
                const weather = await window.API.get(`/weather/current?lat=${lat}&lon=${lon}`);
                const wd = weather.data || weather.weather || weather;
                updateWeatherUI(wd);
            } catch (err) {
                updateWeatherUI({ temp: 28, description: 'Favorable Farming Conditions' });
            }
        };

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                pos => fetchWeatherWithCoords(pos.coords.latitude, pos.coords.longitude),
                () => fetchWeatherWithCoords(18.5204, 73.8567),
                { timeout: 3000 }
            );
        } else {
            fetchWeatherWithCoords(18.5204, 73.8567);
        }

        // Try advisories count
        try {
            const advResult = await window.API.get('/advisories?limit=1');
            const total = (advResult.pagination && advResult.pagination.total) || (advResult.advisories && advResult.advisories.length) || 0;
            const el = document.getElementById('stat-advisories');
            if (el) el.textContent = total;
        } catch(e) {}
    },

    async loadRecentActivities() {
        const container = document.getElementById('dashboard-activities');
        if (!container) return;
        
        try {
            const result = await window.API.get('/farm-activities', { limit: 5, sort: '-scheduledDate' });
            const activities = result.data || result || [];
            
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
            container.innerHTML = '<div class="empty-state"><p>Could not load activities.</p></div>';
        }
    },

    async loadRecentAdvisories() {
        const container = document.getElementById('dashboard-advisories');
        if (!container) return;
        
        try {
            const result = await window.API.get('/advisories?limit=3');
            const advisories = result.advisories || result.data || (Array.isArray(result) ? result : []);
            
            if (!Array.isArray(advisories) || advisories.length === 0) {
                container.innerHTML = '<div class="empty-state"><p>No active advisories.</p></div>';
                return;
            }
            
            const severityColors = { high: 'var(--error)', medium: 'var(--warning)', low: 'var(--info)' };
            container.innerHTML = advisories.map(adv => `
                <div style="border-left: 4px solid ${severityColors[adv.severity] || 'var(--info)'}; padding-left: 1rem; margin-bottom: 1rem;">
                    <h4 style="margin-bottom: 0.25rem;">${window.Utils.sanitizeHtml(adv.title)}</h4>
                    <p class="text-secondary mb-1">${window.Utils.truncate(adv.message || '', 100)}</p>
                    <span class="badge badge-${adv.severity === 'high' ? 'error' : adv.severity === 'medium' ? 'warning' : 'primary'}">${window.Utils.formatLabel ? window.Utils.formatLabel(adv.severity || 'info') : 'Info'} Priority</span>
                </div>
            `).join('');
        } catch(e) {
            container.innerHTML = '<div class="empty-state"><p>Could not load advisories.</p></div>';
        }
    }
};
