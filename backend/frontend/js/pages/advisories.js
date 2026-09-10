// js/pages/advisories.js - Agricultural & Weather Advisories Controller

(function() {
    'use strict';

    const AdvisoriesModule = {
        currentPage: 1,
        limit: 9,
        totalPages: 1,

        async init() {
            this.setupSearch();
            await this.loadAdvisories();
        },

        setupSearch() {
            const searchInput = document.getElementById('advisory-search');
            if (searchInput) {
                searchInput.addEventListener('input', window.Utils ? window.Utils.debounce(() => {
                    this.currentPage = 1;
                    this.loadAdvisories();
                }, 350) : () => {
                    this.currentPage = 1;
                    this.loadAdvisories();
                });
            }
        },

        async loadAdvisories() {
            const search = document.getElementById('advisory-search')?.value.trim() || '';
            const container = document.getElementById('advisories-container');
            if (container) {
                container.innerHTML = '<div class="empty-state" style="text-align:center; padding:40px;"><p>Loading advisories...</p></div>';
            }

            try {
                let url = `/advisories?page=${this.currentPage}&limit=${this.limit}`;
                if (search) url += `&search=${encodeURIComponent(search)}`;

                const res = await window.API.get(url);
                const advisories = res.advisories || res.items || res.data || [];
                const pagination = res.pagination || {
                    page: this.currentPage,
                    limit: this.limit,
                    total: advisories.length,
                    totalPages: Math.ceil(advisories.length / this.limit) || 1
                };

                this.totalPages = pagination.totalPages || 1;
                this.renderAdvisories(advisories);
                this.renderPagination(pagination);
            } catch (err) {
                console.error('Error loading advisories:', err);
                if (container) {
                    container.innerHTML = `<div class="empty-state" style="color:#ef4444; text-align:center; padding:40px;"><p>Failed to load advisories: ${err.message}</p></div>`;
                }
            }
        },

        renderAdvisories(advisories) {
            const container = document.getElementById('advisories-container');
            if (!container) return;

            if (!advisories || advisories.length === 0) {
                container.innerHTML = `
                    <div class="card text-center" style="padding:48px; color:#6b7280;">
                        <p style="font-size:1.15rem; margin-bottom:8px;">📢 No advisories issued at this time.</p>
                        <small>Active warnings, monsoon advisories, and pest alerts will be posted here.</small>
                    </div>
                `;
                return;
            }

            let html = '<div class="grid-3" style="gap:16px;">';
            advisories.forEach(adv => {
                const title = adv.title || 'Advisory Alert';
                const message = adv.message || adv.description || '';
                const severity = adv.severity || 'info';
                const targetState = adv.targetState || adv.region || 'All Regions';
                const date = adv.createdAt ? (window.Utils ? window.Utils.formatDate(adv.createdAt) : new Date(adv.createdAt).toLocaleDateString()) : 'Recent';
                const id = adv._id || adv.id;

                const borderCol = severity === 'critical' ? '#ef4444' : (severity === 'warning' ? '#f59e0b' : '#3b82f6');
                const badgeClass = severity === 'critical' ? 'badge-danger' : (severity === 'warning' ? 'badge-warning' : 'badge-info');

                html += `
                    <div class="card" style="border-left:4px solid ${borderCol}; display:flex; flex-direction:column; justify-content:space-between; cursor:pointer;" onclick="window.PageModules.advisories.showDetails('${id}')">
                        <div>
                            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px;">
                                <span class="badge ${badgeClass}">${window.Utils.formatLabel(severity)}</span>
                                <span style="font-size:0.8rem; color:#6b7280;">🕒 ${date}</span>
                            </div>
                            <h3 style="margin:0 0 8px 0; font-size:1.15rem; color:var(--text-color, #1f2937);">${title}</h3>
                            <p style="font-size:0.9rem; line-height:1.45; color:var(--text-muted, #4b5563); margin-bottom:12px;">
                                ${message.length > 140 ? message.slice(0, 140) + '...' : message}
                            </p>
                        </div>
                        <div style="display:flex; justify-content:space-between; align-items:center; pt-2; border-top:1px solid #f3f4f6; font-size:0.82rem; color:#6b7280;">
                            <span>📍 ${targetState}</span>
                            <span style="color:var(--primary-color, #10b981); font-weight:600;">Read Full Alert ➔</span>
                        </div>
                    </div>
                `;
            });
            html += '</div>';
            container.innerHTML = html;
        },

        renderPagination(pagination) {
            const container = document.getElementById('advisories-pagination');
            if (!container) return;

            const totalPages = pagination.totalPages || 1;
            const current = pagination.page || this.currentPage;

            if (totalPages <= 1) {
                container.innerHTML = '';
                return;
            }

            container.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center; padding:16px 8px; font-size:0.85rem;">
                    <div style="color:#6b7280;">Page ${current} of ${totalPages}</div>
                    <div style="display:flex; gap:8px;">
                        <button class="btn btn-sm ${current === 1 ? 'btn-disabled' : 'btn-outline-primary'}" id="adv-prev" ${current === 1 ? 'disabled' : ''}>◀ Prev</button>
                        <button class="btn btn-sm ${current === totalPages ? 'btn-disabled' : 'btn-outline-primary'}" id="adv-next" ${current === totalPages ? 'disabled' : ''}>Next ▶</button>
                    </div>
                </div>
            `;

            const prev = document.getElementById('adv-prev');
            const next = document.getElementById('adv-next');
            if (prev) {
                prev.onclick = () => {
                    if (this.currentPage > 1) {
                        this.currentPage--;
                        this.loadAdvisories();
                    }
                };
            }
            if (next) {
                next.onclick = () => {
                    if (this.currentPage < totalPages) {
                        this.currentPage++;
                        this.loadAdvisories();
                    }
                };
            }
        },

        async showDetails(id) {
            try {
                const res = await window.API.get(`/advisories/${id}`);
                const adv = res.advisory || res.data || res;

                const title = adv.title || 'Advisory Alert';
                const message = adv.message || adv.description || '';
                const severity = adv.severity || 'info';
                const targetState = adv.targetState || adv.region || 'All Regions';
                const date = adv.createdAt ? (window.Utils ? window.Utils.formatDate(adv.createdAt) : new Date(adv.createdAt).toLocaleDateString()) : 'Recent';

                const modalHtml = `
                    <div style="min-width:320px; max-width:550px; width:100%;">
                        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:16px; border-bottom:1px solid #e5e7eb; padding-bottom:10px;">
                            <div>
                                <span class="badge badge-${severity === 'critical' ? 'danger' : (severity === 'warning' ? 'warning' : 'info')}">${window.Utils.formatLabel(severity)}</span>
                                <h3 style="margin:8px 0 4px 0;">${title}</h3>
                                <div style="font-size:0.85rem; color:#6b7280;">📍 Target: ${targetState} &bull; 🕒 ${date}</div>
                            </div>
                            <button class="close-modal" style="background:none; border:none; font-size:1.5rem; cursor:pointer;">&times;</button>
                        </div>
                        <div style="font-size:0.95rem; line-height:1.6; color:#374151; white-space:pre-wrap; margin-bottom:20px;">${message}</div>
                        <div style="text-align:right;">
                            <button class="btn btn-primary close-modal">Dismiss</button>
                        </div>
                    </div>
                `;

                window.Utils.showModal(modalHtml);
            } catch (err) {
                window.Utils.showToast(err.message, 'error');
            }
        }
    };

    window.PageModules = window.PageModules || {};
    window.PageModules.advisories = AdvisoriesModule;

})();
