// js/pages/admin.js - Administrator Dashboard Overview Controller

(function() {
    'use strict';

    const AdminDashboardModule = {
        async init() {
            const user = window.Auth ? window.Auth.getUser() : null;
            if (!user || user.role !== 'admin') {
                window.location.href = 'dashboard.html';
                return;
            }

            await this.loadStats();
        },

        async loadStats() {
            try {
                const res = await window.API.get('/admin/dashboard');
                const data = res.data || res.stats || res;

                const farmersEl = document.getElementById('admin-stat-farmers');
                const expertsEl = document.getElementById('admin-stat-experts');
                const farmsEl = document.getElementById('admin-stat-farms');
                const cropsEl = document.getElementById('admin-stat-crops');
                const marketEl = document.getElementById('admin-stat-market');
                const advisoriesEl = document.getElementById('admin-stat-advisories');
                const activeEl = document.getElementById('admin-stat-active');
                const dbEl = document.getElementById('admin-stat-db');

                const fmt = (num) => window.Utils ? window.Utils.formatNumber(num || 0) : String(num || 0);

                if (farmersEl) farmersEl.textContent = fmt(data.totalFarmers);
                if (expertsEl) expertsEl.textContent = fmt(data.totalExperts);
                if (farmsEl) farmsEl.textContent = fmt(data.totalFarms);
                if (cropsEl) cropsEl.textContent = fmt(data.totalCrops);
                if (marketEl) marketEl.textContent = fmt(data.totalMarketRecords);
                if (advisoriesEl) advisoriesEl.textContent = fmt(data.totalAdvisories);
                if (activeEl) activeEl.textContent = fmt(data.activeUsers);
                if (dbEl) {
                    const isConnected = data.systemStatus?.database === 'connected' || (data.systemStatus && data.systemStatus.database === 'connected');
                    dbEl.innerHTML = isConnected 
                        ? '<span style="color:#10b981; font-size:1.4rem;">Connected</span>' 
                        : '<span style="color:#ef4444; font-size:1.4rem;">Error</span>';
                }
            } catch (err) {
                console.error('Error loading admin stats:', err);
            }
        }
    };

    window.PageModules = window.PageModules || {};
    window.PageModules.admin = AdminDashboardModule;
    window.PageModules['admin-dashboard'] = AdminDashboardModule;

})();
