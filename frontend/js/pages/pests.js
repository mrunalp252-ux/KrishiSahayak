// js/pages/pests.js - Pests & Diseases Directory Controller

(function() {
    'use strict';

    const PestsModule = {
        currentPage: 1,
        activeTab: 'pests', // 'pests' or 'diseases'
        totalPages: 1,
        limit: 9,
        allCrops: new Set(),

        async init() {
            this.setupTabs();
            this.setupSearchAndFilter();
            await this.loadCrops();
            await this.loadData();
        },

        setupTabs() {
            const tabsContainer = document.getElementById('pest-tabs');
            if (tabsContainer) {
                tabsContainer.addEventListener('click', (e) => {
                    const tabEl = e.target.closest('.tab-item');
                    if (tabEl && tabEl.dataset.tab) {
                        tabsContainer.querySelectorAll('.tab-item').forEach(t => t.classList.remove('active'));
                        tabEl.classList.add('active');
                        this.activeTab = tabEl.dataset.tab;
                        this.currentPage = 1;
                        this.loadData();
                    }
                });
            }
        },

        setupSearchAndFilter() {
            const searchInput = document.getElementById('pest-search');
            if (searchInput) {
                searchInput.addEventListener('input', window.Utils ? window.Utils.debounce(() => {
                    this.currentPage = 1;
                    this.loadData();
                }, 350) : () => {
                    this.currentPage = 1;
                    this.loadData();
                });
            }

            const cropFilter = document.getElementById('pest-crop-filter');
            if (cropFilter) {
                cropFilter.addEventListener('change', () => {
                    this.currentPage = 1;
                    this.loadData();
                });
            }
        },

        async loadCrops() {
            try {
                const res = await window.API.get('/crops?limit=50');
                const crops = res.crops || res.data || [];
                const select = document.getElementById('pest-crop-filter');
                if (select && crops.length > 0) {
                    crops.forEach(c => {
                        const name = c.cropName || c.name;
                        if (name) {
                            const opt = document.createElement('option');
                            opt.value = name;
                            opt.textContent = `Crop: ${name}`;
                            select.appendChild(opt);
                        }
                    });
                }
            } catch(e) {
                // optional enhancement, ignore error
            }
        },

        async loadData() {
            const search = document.getElementById('pest-search')?.value.trim() || '';
            const crop = document.getElementById('pest-crop-filter')?.value || '';
            const container = document.getElementById('pests-container');
            
            if (container) {
                container.innerHTML = '<div class="empty-state" style="grid-column: 1/-1; text-align: center; padding: 40px;"><p>Loading...</p></div>';
            }

            try {
                const endpoint = this.activeTab === 'pests' ? '/pests' : '/diseases';
                let url = `${endpoint}?page=${this.currentPage}&limit=${this.limit}`;
                if (search) url += `&search=${encodeURIComponent(search)}`;
                if (crop) url += `&crop=${encodeURIComponent(crop)}`;

                const res = await window.API.get(url);
                
                let items = [];
                if (this.activeTab === 'pests') {
                    items = res.pests || res.items || res.data || [];
                } else {
                    items = res.diseases || res.items || res.data || [];
                }

                const pagination = res.pagination || {
                    page: this.currentPage,
                    limit: this.limit,
                    total: items.length,
                    totalPages: Math.ceil(items.length / this.limit) || 1
                };

                this.totalPages = pagination.totalPages || 1;
                this.renderCards(items);
                this.renderPagination(pagination);
            } catch (err) {
                console.error('Error loading pests/diseases:', err);
                if (container) {
                    container.innerHTML = `<div class="empty-state" style="grid-column: 1/-1; color: #ef4444; text-align: center; padding: 40px;"><p>Failed to load data: ${err.message}</p></div>`;
                }
            }
        },

        renderCards(items) {
            const container = document.getElementById('pests-container');
            if (!container) return;

            if (!items || items.length === 0) {
                container.innerHTML = `
                    <div class="empty-state" style="grid-column: 1/-1; text-align:center; padding: 48px; color: #6b7280;">
                        <p style="font-size: 1.1rem; margin-bottom: 8px;">No ${this.activeTab} found matching criteria.</p>
                        <small>Try clearing the search query or selecting a different crop.</small>
                    </div>
                `;
                return;
            }

            container.innerHTML = items.map(item => {
                const name = item.name || item.pestName || item.diseaseName || 'Unknown';
                const scientificName = item.scientificName ? `<em>${item.scientificName}</em>` : '';
                const severity = item.severity || 'medium';
                const crops = item.cropsAffected || item.affectedCrops || [];
                const cropsList = Array.isArray(crops) ? crops : (typeof crops === 'string' ? crops.split(',') : []);
                const symptoms = item.symptoms || item.description || 'No symptom details available.';
                const shortSymptoms = symptoms.length > 120 ? symptoms.slice(0, 120) + '...' : symptoms;

                const severityBadge = severity === 'high'
                    ? '<span class="badge badge-danger">High Risk</span>'
                    : (severity === 'medium' ? '<span class="badge badge-warning">Moderate</span>' : '<span class="badge badge-success">Low</span>');

                return `
                    <div class="card pest-card" style="cursor: pointer; display: flex; flex-direction: column; justify-content: space-between;" onclick="window.PageModules.pests.showDetails('${item._id || item.id}')">
                        <div>
                            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                                <h3 style="margin: 0; font-size: 1.15rem; color: var(--text-color, #1f2937);">${name}</h3>
                                ${severityBadge}
                            </div>
                            <div style="font-size: 0.85rem; color: #6b7280; margin-bottom: 10px;">${scientificName}</div>
                            <p style="font-size: 0.9rem; line-height: 1.4; color: var(--text-muted, #4b5563); margin-bottom: 12px;">
                                ${shortSymptoms}
                            </p>
                        </div>
                        <div>
                            <div style="display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 12px;">
                                ${cropsList.slice(0, 4).map(c => `<span style="background: rgba(16, 185, 129, 0.12); color: #059669; font-size: 0.75rem; padding: 2px 8px; border-radius: 9999px;">${c.trim()}</span>`).join('')}
                                ${cropsList.length > 4 ? `<span style="font-size:0.75rem; color:#6b7280;">+${cropsList.length - 4} more</span>` : ''}
                            </div>
                            <button class="btn btn-sm btn-outline-primary w-full" style="pointer-events: none;">View Management Guide ➔</button>
                        </div>
                    </div>
                `;
            }).join('');
        },

        renderPagination(pagination) {
            const container = document.getElementById('pests-pagination');
            if (!container) return;

            const totalPages = pagination.totalPages || 1;
            const current = pagination.page || this.currentPage;

            if (totalPages <= 1) {
                container.innerHTML = '';
                return;
            }

            container.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 20px 8px; font-size: 0.85rem;">
                    <div style="color: #6b7280;">Page ${current} of ${totalPages}</div>
                    <div style="display: flex; gap: 8px;">
                        <button class="btn btn-sm ${current === 1 ? 'btn-disabled' : 'btn-outline-primary'}" id="pests-prev" ${current === 1 ? 'disabled' : ''}>◀ Prev</button>
                        <button class="btn btn-sm ${current === totalPages ? 'btn-disabled' : 'btn-outline-primary'}" id="pests-next" ${current === totalPages ? 'disabled' : ''}>Next ▶</button>
                    </div>
                </div>
            `;

            const prev = document.getElementById('pests-prev');
            const next = document.getElementById('pests-next');
            if (prev) {
                prev.onclick = () => {
                    if (this.currentPage > 1) {
                        this.currentPage--;
                        this.loadData();
                    }
                };
            }
            if (next) {
                next.onclick = () => {
                    if (this.currentPage < totalPages) {
                        this.currentPage++;
                        this.loadData();
                    }
                };
            }
        },

        async showDetails(id) {
            try {
                const endpoint = this.activeTab === 'pests' ? '/pests' : '/diseases';
                const res = await window.API.get(`${endpoint}/${id}`);
                const item = res.data || res.pest || res.disease || res;

                const name = item.name || item.pestName || item.diseaseName || 'Details';
                const scientificName = item.scientificName ? `<em>(${item.scientificName})</em>` : '';
                const symptoms = item.symptoms || 'None recorded.';
                const organic = item.organicControl || item.prevention || 'Maintain good crop sanitation and crop rotation.';
                const chemical = item.chemicalControl || item.treatment || 'Consult a certified agronomist for targeted chemical intervention.';
                const preventive = item.preventiveMeasures || item.prevention || 'Use certified seeds and optimal spacing.';

                const html = `
                    <div style="min-width: 320px; max-width: 600px; width: 100%;">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px;">
                            <div>
                                <h3 style="margin: 0; font-size: 1.3rem;">${name}</h3>
                                <div style="color: #6b7280; font-size: 0.9rem;">${scientificName}</div>
                            </div>
                            <button class="close-modal" style="background:none; border:none; font-size:1.5rem; cursor:pointer;">&times;</button>
                        </div>
                        
                        <div style="margin-bottom: 16px;">
                            <h4 style="margin: 0 0 6px 0; color: #b91c1c; font-size: 0.95rem;">🚨 Identification & Symptoms</h4>
                            <p style="margin: 0; font-size: 0.9rem; line-height: 1.5;">${symptoms}</p>
                        </div>

                        <div style="margin-bottom: 16px; background: rgba(16, 185, 129, 0.08); padding: 12px; border-radius: 6px; border-left: 3px solid #10b981;">
                            <h4 style="margin: 0 0 6px 0; color: #065f46; font-size: 0.95rem;">🌿 Organic & Natural Control</h4>
                            <p style="margin: 0; font-size: 0.9rem; line-height: 1.5;">${organic}</p>
                        </div>

                        <div style="margin-bottom: 16px; background: rgba(59, 130, 246, 0.08); padding: 12px; border-radius: 6px; border-left: 3px solid #3b82f6;">
                            <h4 style="margin: 0 0 6px 0; color: #1e40af; font-size: 0.95rem;">🧪 Chemical Treatment</h4>
                            <p style="margin: 0; font-size: 0.9rem; line-height: 1.5;">${chemical}</p>
                        </div>

                        <div style="margin-bottom: 20px;">
                            <h4 style="margin: 0 0 6px 0; color: #4b5563; font-size: 0.95rem;">🛡️ Prevention</h4>
                            <p style="margin: 0; font-size: 0.9rem; line-height: 1.5;">${preventive}</p>
                        </div>

                        <div style="text-align: right;">
                            <button class="btn btn-primary close-modal">Close Guide</button>
                        </div>
                    </div>
                `;

                window.Utils.showModal(html);
            } catch (err) {
                window.Utils.showToast(err.message, 'error');
            }
        }
    };

    window.PageModules = window.PageModules || {};
    window.PageModules.pests = PestsModule;
    window.PageModules['pests-diseases'] = PestsModule;

})();
