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
            this.loadUpcomingReminders(),
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
        const user = window.Auth ? window.Auth.getUser() : null;
        let primaryLocation = (user && (user.district || user.state)) ? [user.village, user.district, user.state].filter(Boolean).join(', ') : null;
        let primaryCoords = null;

        // 1. Farms & Active Crops
        try {
            const result = await window.API.get('/farms');
            const farms = result.farms || result.data || [];
            const farmCount = Array.isArray(farms) ? farms.length : 0;
            
            const el = document.getElementById('stat-farms');
            if (el) el.textContent = farmCount;
            
            let activeCrops = 0;
            if (Array.isArray(farms) && farms.length > 0) {
                activeCrops = farms.filter(f => f.currentCrop).length;
                const f = farms[0];
                if (f.location && f.location.lat && f.location.lon) {
                    primaryCoords = { lat: f.location.lat, lon: f.location.lon };
                }
                if (f.district || f.village || f.state) {
                    primaryLocation = [f.village, f.district, f.state].filter(Boolean).join(', ');
                }
            }
            const cropEl = document.getElementById('stat-crops');
            if (cropEl) cropEl.textContent = activeCrops;
        } catch (e) {
            console.warn('Farms stat error:', e);
            const el = document.getElementById('stat-farms');
            if (el) el.textContent = '0';
            const cropEl = document.getElementById('stat-crops');
            if (cropEl) cropEl.textContent = '0';
        }

        // 2. Weather UI updater
        const updateWeatherUI = (raw) => {
            const tempEl = document.getElementById('stat-weather');
            const descEl = document.getElementById('stat-weather-desc');
            const wd = (raw && raw.data && typeof raw.data === 'object' && !Array.isArray(raw.data)) ? raw.data : (raw || {});
            const temp = Math.round(wd.temperature != null ? wd.temperature : (wd.temp != null ? wd.temp : 28));
            const desc = wd.description || wd.condition || 'Clear Sky';
            if (tempEl) tempEl.textContent = `${temp}°C`;
            if (descEl) descEl.textContent = desc.charAt(0).toUpperCase() + desc.slice(1);

            // Render weather alert banner if any active alerts exist
            const alertContainer = document.getElementById('dashboard-weather-alert');
            if (alertContainer) {
                const alerts = wd.alerts || (raw && raw.alerts) || [];
                if (Array.isArray(alerts) && alerts.length > 0) {
                    const topAlert = alerts[0];
                    alertContainer.style.display = 'block';
                    alertContainer.innerHTML = `
                        <div style="background: linear-gradient(135deg, #fff7ed, #ffedd5); border: 1px solid #fdba74; border-left: 5px solid #f97316; border-radius: 8px; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; gap: 12px;">
                            <div>
                                <strong style="color: #c2410c; font-size: 0.95rem; display: block; margin-bottom: 2px;">⚠️ ${window.Utils.sanitizeHtml(topAlert.title || 'Agromet Weather Alert')}</strong>
                                <p style="margin: 0; font-size: 0.85rem; color: #9a3412;">${window.Utils.sanitizeHtml(topAlert.description || '')}</p>
                            </div>
                            <a href="weather.html" class="btn btn-sm btn-primary" style="white-space: nowrap; text-decoration: none;">View Advice ↗</a>
                        </div>
                    `;
                } else {
                    alertContainer.style.display = 'none';
                }
            }
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

        // Dispatch initial weather query immediately without waiting for GPS prompt
        const initLat = (primaryCoords && primaryCoords.lat) || 18.5204;
        const initLon = (primaryCoords && primaryCoords.lon) || 73.8567;
        fetchWeather(initLat, initLon, primaryLocation);

        // Optionally refine with browser geolocation if granted
        if (navigator.geolocation && !primaryCoords) {
            try {
                navigator.geolocation.getCurrentPosition(
                    pos => fetchWeather(pos.coords.latitude, pos.coords.longitude, primaryLocation),
                    () => {},
                    { timeout: 3000, maximumAge: 600000 }
                );
            } catch (geoErr) {}
        }

        // 3. Advisories count
        try {
            const advResult = await window.API.get('/advisories?limit=1');
            const total = (advResult.pagination && advResult.pagination.total != null) 
                ? advResult.pagination.total 
                : (Array.isArray(advResult.advisories) ? advResult.advisories.length : (Array.isArray(advResult.data) ? advResult.data.length : 0));
            const el = document.getElementById('stat-advisories');
            if (el) el.textContent = total;
        } catch (e) {
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
    },

    async loadUpcomingReminders() {
        const container = document.getElementById('dashboard-reminders');
        if (!container) return;

        try {
            const res = await window.API.get('/planner/upcoming?days=14');
            const reminders = (res && Array.isArray(res.reminders)) ? res.reminders : ((res && Array.isArray(res.data)) ? res.data : []);

            if (!reminders || reminders.length === 0) {
                container.innerHTML = `
                    <div class="empty-state" style="padding: 20px 10px; text-align: center;">
                        <p style="font-size: 0.9rem; color: #10b981; font-weight: 500; margin-bottom: 4px;">✓ All Caught Up!</p>
                        <p style="font-size: 0.8rem; color: #6b7280; margin: 0;">No tasks scheduled for the next 14 days. Use Farm Planner to schedule tasks.</p>
                    </div>
                `;
                return;
            }

            let html = '<div style="display: flex; flex-direction: column; gap: 10px;">';
            reminders.slice(0, 4).forEach(item => {
                const title = item.title || 'Farm Task';
                const crop = item.crop ? `(${item.crop})` : '';
                const dateStr = item.scheduledDate ? (window.Utils ? window.Utils.formatDate(item.scheduledDate) : new Date(item.scheduledDate).toLocaleDateString()) : '';
                
                let badge = '<span class="badge badge-info" style="font-size:0.75rem;">Upcoming</span>';
                if (item.urgency === 'overdue') {
                    badge = '<span class="badge" style="background:#fee2e2; color:#991b1b; font-size:0.75rem;">⚠️ Due / Overdue</span>';
                } else if (item.urgency === 'urgent') {
                    badge = '<span class="badge" style="background:#fef3c7; color:#92400e; font-size:0.75rem;">⏱️ Next 48h</span>';
                }

                html += `
                    <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-left: 4px solid ${item.urgency === 'overdue' ? '#ef4444' : (item.urgency === 'urgent' ? '#f59e0b' : '#3b82f6')}; border-radius: 6px; padding: 10px 12px; display: flex; justify-content: space-between; align-items: center; gap: 8px;">
                        <div>
                            <div style="font-weight: 600; font-size: 0.9rem; color: #1f2937;">${window.Utils.sanitizeHtml(title)} <span style="font-weight:400; font-size:0.8rem; color:#6b7280;">${window.Utils.sanitizeHtml(crop)}</span></div>
                            <div style="font-size: 0.8rem; color: #4b5563;">📅 ${dateStr} &bull; 🌾 ${window.Utils.sanitizeHtml(item.farmName || 'My Farm')}</div>
                        </div>
                        <div style="display:flex; flex-direction:column; align-items:flex-end; gap:4px;">
                            ${badge}
                            <button class="btn btn-sm btn-outline-success" style="padding: 2px 8px; font-size: 0.75rem;" onclick="window.PageModules.dashboard.markTaskDone('${item._id}')">✓ Done</button>
                        </div>
                    </div>
                `;
            });
            html += '</div>';
            container.innerHTML = html;
        } catch (err) {
            container.innerHTML = '<div class="empty-state"><p>No upcoming reminders found.</p></div>';
        }
    },

    async markTaskDone(id) {
        try {
            await window.API.put(`/planner/${id}/complete`, {});
            if (window.Utils && window.Utils.showToast) {
                window.Utils.showToast('Activity marked as completed!', 'success');
            }
            this.loadUpcomingReminders();
            this.loadRecentActivities();
        } catch (err) {
            console.error('Error marking activity complete:', err);
        }
    }
};
