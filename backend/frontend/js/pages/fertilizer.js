// js/pages/fertilizer.js - Fertilizer Recommendations & Guidance Controller

(function() {
    'use strict';

    const FertilizerModule = {
        currentPage: 1,
        limit: 9,
        totalPages: 1,

        async init() {
            this.setupListeners();
            await this.loadCrops();
            await this.loadGuides();
        },

        setupListeners() {
            const searchInput = document.getElementById('fertilizer-search');
            const cropFilter = document.getElementById('fertilizer-crop-filter');

            if (searchInput) {
                searchInput.addEventListener('input', window.Utils ? window.Utils.debounce(() => {
                    this.currentPage = 1;
                    this.loadGuides();
                }, 350) : () => {
                    this.currentPage = 1;
                    this.loadGuides();
                });
            }

            if (cropFilter) {
                cropFilter.addEventListener('change', () => {
                    this.currentPage = 1;
                    this.loadGuides();
                });
            }
        },

        async loadCrops() {
            try {
                const res = await window.API.get('/crops?limit=50');
                const crops = res.crops || res.data || [];
                const select = document.getElementById('fertilizer-crop-filter');
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
            } catch(e) {}
        },

        async loadGuides() {
            const search = document.getElementById('fertilizer-search')?.value.trim() || '';
            const crop = document.getElementById('fertilizer-crop-filter')?.value || '';
            const container = document.getElementById('fertilizer-container');
            
            if (container) {
                container.innerHTML = '<div class="empty-state" style="grid-column:1/-1; text-align:center; padding:40px;"><p>Loading fertilizer guides...</p></div>';
            }

            try {
                let url = `/fertilizers?page=${this.currentPage}&limit=${this.limit}`;
                if (search) url += `&search=${encodeURIComponent(search)}`;
                if (crop) url += `&crop=${encodeURIComponent(crop)}`;

                const res = await window.API.get(url);
                const guides = res.guides || res.items || res.data || [];
                const pagination = res.pagination || {
                    page: this.currentPage,
                    limit: this.limit,
                    total: guides.length,
                    totalPages: Math.ceil(guides.length / this.limit) || 1
                };

                this.totalPages = pagination.totalPages || 1;
                this.renderGuides(guides);
                this.renderPagination(pagination);
            } catch (err) {
                console.error('Error loading fertilizer guides:', err);
                if (container) {
                    container.innerHTML = `<div class="empty-state" style="grid-column:1/-1; text-align:center; color:#ef4444; padding:40px;"><p>Failed to load fertilizer guides: ${err.message}</p></div>`;
                }
            }
        },

        renderGuides(guides) {
            const container = document.getElementById('fertilizer-container');
            if (!container) return;

            if (!guides || guides.length === 0) {
                container.innerHTML = `
                    <div class="empty-state" style="grid-column:1/-1; text-align:center; padding:48px; color:#6b7280;">
                        <p style="font-size:1.1rem; margin-bottom:8px;">No fertilizer guides found.</p>
                        <small>Try selecting a different crop or clearing the search query.</small>
                    </div>
                `;
                return;
            }

            container.innerHTML = guides.map(g => {
                const cropName = g.cropName || (g.crop && g.crop.cropName) || 'General Field';
                const stage = g.applicationStage || 'General';
                const soil = g.soilType ? `Soil: ${g.soilType}` : '';
                const type = g.fertilizerType || 'NPK';
                const organic = g.organicOptions || g.organic || '';
                const chemical = g.chemicalOptions || g.chemical || g.guidance || '';
                const method = g.applicationMethod || '';

                return `
                    <div class="card" style="display:flex; flex-direction:column; justify-content:space-between;">
                        <div>
                            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px;">
                                <div>
                                    <h3 style="margin:0; font-size:1.2rem; color:var(--text-color, #1f2937);">${cropName}</h3>
                                    <span style="font-size:0.8rem; color:#6b7280;">Stage: <strong>${window.Utils.formatLabel(stage)}</strong></span>
                                </div>
                                <span class="badge badge-info">${window.Utils.formatLabel(type)}</span>
                            </div>

                            ${soil ? `<div style="font-size:0.85rem; color:#4b5563; margin-bottom:10px;">🏷️ ${window.Utils.formatLabel(soil)}</div>` : ''}

                            ${organic ? `
                                <div style="background: rgba(16, 185, 129, 0.08); padding:10px; border-radius:6px; margin-bottom:8px; font-size:0.88rem;">
                                    <strong style="color:#059669;">🌿 Organic / Bio:</strong>
                                    <p style="margin:4px 0 0 0; line-height:1.4;">${organic}</p>
                                </div>
                            ` : ''}

                            ${chemical ? `
                                <div style="background: rgba(59, 130, 246, 0.08); padding:10px; border-radius:6px; margin-bottom:8px; font-size:0.88rem;">
                                    <strong style="color:#2563eb;">🧪 Chemical (NPK):</strong>
                                    <p style="margin:4px 0 0 0; line-height:1.4;">${chemical}</p>
                                </div>
                            ` : ''}

                            ${method ? `
                                <div style="font-size:0.85rem; color:#6b7280; margin-top:8px;">
                                    <strong>Method:</strong> ${method}
                                </div>
                            ` : ''}
                        </div>

                        ${g.safetyNotes ? `
                            <div style="margin-top:12px; font-size:0.8rem; color:#d97706; background:#fffbeb; padding:6px 10px; border-radius:4px;">
                                ⚠️ ${g.safetyNotes}
                            </div>
                        ` : ''}
                    </div>
                `;
            }).join('');
        },

        renderPagination(pagination) {
            const container = document.getElementById('fertilizer-pagination');
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
                        <button class="btn btn-sm ${current === 1 ? 'btn-disabled' : 'btn-outline-primary'}" id="fert-prev" ${current === 1 ? 'disabled' : ''}>◀ Prev</button>
                        <button class="btn btn-sm ${current === totalPages ? 'btn-disabled' : 'btn-outline-primary'}" id="fert-next" ${current === totalPages ? 'disabled' : ''}>Next ▶</button>
                    </div>
                </div>
            `;

            const prev = document.getElementById('fert-prev');
            const next = document.getElementById('fert-next');
            if (prev) {
                prev.onclick = () => {
                    if (this.currentPage > 1) {
                        this.currentPage--;
                        this.loadGuides();
                    }
                };
            }
            if (next) {
                next.onclick = () => {
                    if (this.currentPage < totalPages) {
                        this.currentPage++;
                        this.loadGuides();
                    }
                };
            }
        }
    };

    window.PageModules = window.PageModules || {};
    window.PageModules.fertilizer = FertilizerModule;
    window.PageModules['fertilizer-guide'] = FertilizerModule;

})();
