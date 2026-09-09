// js/pages/guides.js - Cultivation Guides Controller

(function() {
    'use strict';

    const GuidesModule = {
        currentPage: 1,
        limit: 9,
        totalPages: 1,

        async init() {
            this.setupListeners();
            await this.loadCrops();
            await this.loadGuides();
        },

        setupListeners() {
            const searchInput = document.getElementById('guide-search');
            const cropFilter = document.getElementById('guide-crop-filter');

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
                const select = document.getElementById('guide-crop-filter');
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
            const search = document.getElementById('guide-search')?.value.trim() || '';
            const crop = document.getElementById('guide-crop-filter')?.value || '';
            const container = document.getElementById('guides-container');
            
            if (container) {
                container.innerHTML = '<div class="empty-state" style="grid-column:1/-1; text-align:center; padding:40px;"><p>Loading cultivation guides...</p></div>';
            }

            try {
                let url = `/guides?page=${this.currentPage}&limit=${this.limit}`;
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
                this.renderCards(guides);
                this.renderPagination(pagination);
            } catch (err) {
                console.error('Error loading guides:', err);
                if (container) {
                    container.innerHTML = `<div class="empty-state" style="grid-column:1/-1; text-align:center; color:#ef4444; padding:40px;"><p>Failed to load guides: ${err.message}</p></div>`;
                }
            }
        },

        renderCards(guides) {
            const container = document.getElementById('guides-container');
            if (!container) return;

            if (!guides || guides.length === 0) {
                container.innerHTML = `
                    <div class="empty-state" style="grid-column:1/-1; text-align:center; padding:48px; color:#6b7280;">
                        <p style="font-size:1.1rem; margin-bottom:8px;">No cultivation guides found.</p>
                        <small>Try selecting a different crop or clearing the search query.</small>
                    </div>
                `;
                return;
            }

            container.innerHTML = guides.map(g => {
                const cropName = g.cropName || (g.crop && g.crop.cropName) || 'Cultivation Guide';
                const climate = g.climateRequirements || g.climate || '';
                const soil = g.soilRequirements || g.soil || '';
                const id = g._id || g.id || cropName;

                return `
                    <div class="card" style="cursor:pointer; display:flex; flex-direction:column; justify-content:space-between;" onclick="window.PageModules.guides.showDetails('${id}')">
                        <div>
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                                <h3 style="margin:0; font-size:1.25rem; color:var(--text-color, #1f2937);">🌾 ${cropName}</h3>
                                <span class="badge badge-success">Full Guide</span>
                            </div>

                            ${climate ? `
                                <div style="margin-bottom:8px; font-size:0.88rem; color:#4b5563;">
                                    <strong>🌤️ Climate:</strong> ${climate.slice(0, 90)}${climate.length > 90 ? '...' : ''}
                                </div>
                            ` : ''}

                            ${soil ? `
                                <div style="margin-bottom:12px; font-size:0.88rem; color:#4b5563;">
                                    <strong>🌱 Soil:</strong> ${soil.slice(0, 90)}${soil.length > 90 ? '...' : ''}
                                </div>
                            ` : ''}
                        </div>

                        <div>
                            <button class="btn btn-sm btn-outline-primary w-full" style="pointer-events:none;">Read Step-by-Step Guide 📖</button>
                        </div>
                    </div>
                `;
            }).join('');
        },

        renderPagination(pagination) {
            const container = document.getElementById('guides-pagination');
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
                        <button class="btn btn-sm ${current === 1 ? 'btn-disabled' : 'btn-outline-primary'}" id="guides-prev" ${current === 1 ? 'disabled' : ''}>◀ Prev</button>
                        <button class="btn btn-sm ${current === totalPages ? 'btn-disabled' : 'btn-outline-primary'}" id="guides-next" ${current === totalPages ? 'disabled' : ''}>Next ▶</button>
                    </div>
                </div>
            `;

            const prev = document.getElementById('guides-prev');
            const next = document.getElementById('guides-next');
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
        },

        async showDetails(idOrCrop) {
            try {
                const res = await window.API.get(`/guides/${idOrCrop}`);
                const guide = res.guide || res.data || res;

                const cropName = guide.cropName || (guide.crop && guide.crop.cropName) || guide.crop || 'Cultivation';

                const sections = [
                    { title: '1. Climate & Weather Requirements', content: guide.climateRequirements || guide.climate },
                    { title: '2. Soil Preparation & Requirements', content: guide.soilRequirements || guide.soil || guide.landPreparation },
                    { title: '3. Seed Selection & Treatment', content: guide.seedSelection || guide.seedTreatment },
                    { title: '4. Sowing / Planting Technique', content: guide.sowing || guide.plantingMethod },
                    { title: '5. Irrigation & Water Management', content: guide.waterManagement || guide.irrigation },
                    { title: '6. Nutrient & Fertilizer Management', content: guide.nutrientManagement || guide.fertilizers },
                    { title: '7. Pest & Weed Management', content: guide.pestManagement || guide.weedControl },
                    { title: '8. Harvesting & Post-Harvest Storage', content: guide.harvesting || guide.postHarvest }
                ].filter(s => !!s.content);

                let sectionsHtml = '';
                sections.forEach((sec, idx) => {
                    sectionsHtml += `
                        <div style="margin-bottom:14px; background:var(--bg-secondary, #f9fafb); border-radius:8px; border:1px solid rgba(0,0,0,0.06); padding:14px;">
                            <h4 style="margin:0 0 6px 0; color:var(--primary-color, #059669); font-size:0.95rem;">${sec.title}</h4>
                            <p style="margin:0; font-size:0.9rem; line-height:1.5; color:var(--text-color, #374151);">${sec.content}</p>
                        </div>
                    `;
                });

                const modalHtml = `
                    <div style="min-width:320px; max-width:650px; width:100%; max-height:80vh; overflow-y:auto;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; position:sticky; top:0; background:var(--bg-color, white); padding-bottom:8px; border-bottom:1px solid #e5e7eb;">
                            <h3 style="margin:0; font-size:1.3rem;">📖 ${cropName} Cultivation Guide</h3>
                            <button class="close-modal" style="background:none; border:none; font-size:1.5rem; cursor:pointer;">&times;</button>
                        </div>
                        <div>
                            ${sectionsHtml || '<p>Detailed steps are being compiled for this crop.</p>'}
                        </div>
                        <div style="text-align:right; margin-top:16px;">
                            <button class="btn btn-primary close-modal">Close</button>
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
    window.PageModules.guides = GuidesModule;
    window.PageModules['cultivation-guides'] = GuidesModule;

})();
