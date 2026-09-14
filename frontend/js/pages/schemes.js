// js/pages/schemes.js - Government Agricultural Schemes Page Controller

(function() {
    'use strict';

    const SchemesModule = {
        schemes: [],

        async init() {
            this.setupEventListeners();
            await this.loadSchemes();
        },

        setupEventListeners() {
            const filterBtn = document.getElementById('scheme-filter-btn');
            const catFilter = document.getElementById('scheme-category-filter');
            const levelFilter = document.getElementById('scheme-level-filter');
            const searchInput = document.getElementById('scheme-search-input');

            const applyFilter = () => this.loadSchemes();

            if (filterBtn) filterBtn.addEventListener('click', applyFilter);
            if (catFilter) catFilter.addEventListener('change', applyFilter);
            if (levelFilter) levelFilter.addEventListener('change', applyFilter);
            if (searchInput) {
                searchInput.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') applyFilter();
                });
            }

            // Re-render when language changes
            window.addEventListener('languageChanged', () => {
                this.loadSchemes();
            });
        },

        async loadSchemes() {
            const container = document.getElementById('schemes-container');
            if (container) {
                container.innerHTML = '<div class="empty-state" style="text-align:center; padding:40px;"><p>Loading schemes...</p></div>';
            }

            const category = document.getElementById('scheme-category-filter')?.value || '';
            const level = document.getElementById('scheme-level-filter')?.value || '';
            const search = document.getElementById('scheme-search-input')?.value || '';
            const lang = (window.i18n && window.i18n.currentLocale) || localStorage.getItem('krishi_language') || 'en';

            try {
                let url = `/schemes?lang=${encodeURIComponent(lang)}`;
                if (category) url += `&category=${encodeURIComponent(category)}`;
                if (level) url += `&level=${encodeURIComponent(level)}`;
                if (search) url += `&search=${encodeURIComponent(search)}`;

                const res = await window.API.get(url);
                this.schemes = res.schemes || res.data || [];
                this.renderSchemes(this.schemes, lang);
            } catch (err) {
                console.error('Error loading schemes:', err);
                if (container) {
                    container.innerHTML = `<div class="empty-state" style="color:#ef4444; text-align:center; padding:40px;"><p>Failed to load schemes: ${err.message}</p></div>`;
                }
            }
        },

        renderSchemes(schemes, lang) {
            const container = document.getElementById('schemes-container');
            if (!container) return;

            if (!schemes || schemes.length === 0) {
                container.innerHTML = `
                    <div class="card" style="text-align:center; padding:48px; color:#6b7280;">
                        <p style="font-size:1.2rem; margin-bottom:8px;">🏛️ No schemes found</p>
                        <p style="font-size:0.95rem;">Try adjusting your filters or search keywords.</p>
                    </div>
                `;
                return;
            }

            let html = '<div class="grid-2" style="gap: 20px;">';
            schemes.forEach(s => {
                const title = (lang === 'mr' && s.titleMr) ? s.titleMr : ((lang === 'hi' && s.titleHi) ? s.titleHi : s.title);
                const desc = (lang === 'mr' && s.descriptionMr) ? s.descriptionMr : ((lang === 'hi' && s.descriptionHi) ? s.descriptionHi : s.description);
                const benefits = (lang === 'mr' && s.benefitsMr) ? s.benefitsMr : ((lang === 'hi' && s.benefitsHi) ? s.benefitsHi : s.benefits);
                const levelBadge = s.level === 'central'
                    ? '<span class="badge" style="background:#e0e7ff; color:#3730a3;">🇮🇳 Central Govt</span>'
                    : `<span class="badge" style="background:#fef3c7; color:#92400e;">📍 State (${s.state || 'State'})</span>`;

                const categoryMap = {
                    financial_support: '💰 Direct Financial Support',
                    crop_insurance: '🛡️ Crop Insurance',
                    credit: '💳 Kisan Credit',
                    irrigation: '💧 Micro Irrigation',
                    soil_health: '🧪 Soil Health',
                    subsidy: '🚜 Farm Machinery & Subsidy',
                    general: '🌾 Agriculture'
                };
                const categoryLabel = categoryMap[s.category] || '🌾 Agriculture';

                const eligibilityList = (s.eligibility || []).map(e => `<li>${e}</li>`).join('');
                const documentsList = (s.documents || []).map(d => `<span class="badge" style="background:#f3f4f6; color:#374151; margin:2px;">📄 ${d}</span>`).join('');

                html += `
                    <div class="card" style="display:flex; flex-direction:column; justify-content:space-between; border-top: 4px solid #10b981;">
                        <div>
                            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px; gap:8px;">
                                <div>
                                    <h3 style="margin:0 0 4px 0; font-size:1.15rem; color:var(--text-color, #1f2937);">${title}</h3>
                                    <div style="display:flex; gap:6px; flex-wrap:wrap; font-size:0.8rem;">
                                        ${levelBadge}
                                        <span class="badge" style="background:#ecfdf5; color:#065f46;">${categoryLabel}</span>
                                    </div>
                                </div>
                                ${s.shortCode ? `<span style="font-weight:700; color:#059669; font-size:0.85rem; background:#d1fae5; padding:3px 8px; border-radius:4px;">${s.shortCode}</span>` : ''}
                            </div>

                            <!-- Benefits Highlight -->
                            <div style="background:#f0fdf4; border-left:3px solid #10b981; padding:8px 12px; border-radius:4px; margin-bottom:12px;">
                                <strong style="color:#065f46; font-size:0.85rem;">🎁 Key Benefit:</strong>
                                <p style="margin:2px 0 0 0; font-size:0.9rem; color:#166534; font-weight:500;">${benefits}</p>
                            </div>

                            <!-- Description -->
                            <p style="font-size:0.9rem; color:#4b5563; line-height:1.45; margin-bottom:12px;">${desc}</p>

                            <!-- Eligibility -->
                            ${eligibilityList ? `
                                <div style="margin-bottom:12px;">
                                    <strong style="font-size:0.82rem; color:#374151; display:block; margin-bottom:4px;">👥 Eligibility:</strong>
                                    <ul style="margin:0; padding-left:20px; font-size:0.82rem; color:#4b5563; line-height:1.4;">${eligibilityList}</ul>
                                </div>
                            ` : ''}

                            <!-- Documents -->
                            ${documentsList ? `
                                <div style="margin-bottom:14px;">
                                    <strong style="font-size:0.82rem; color:#374151; display:block; margin-bottom:4px;">📑 Required Documents:</strong>
                                    <div style="display:flex; flex-wrap:wrap; gap:4px;">${documentsList}</div>
                                </div>
                            ` : ''}
                        </div>

                        <!-- Card Footer -->
                        <div style="display:flex; justify-content:space-between; align-items:center; pt-3; border-top:1px solid #f3f4f6; margin-top:12px; padding-top:10px; flex-wrap:wrap; gap:8px;">
                            <div>
                                ${s.helpline ? `
                                    <a href="tel:${s.helpline.split('/')[0].trim()}" style="font-size:0.82rem; color:#2563eb; text-decoration:none; font-weight:500;">
                                        📞 Helpline: ${s.helpline}
                                    </a>
                                ` : ''}
                            </div>
                            <div>
                                ${s.applicationUrl ? `
                                    <a href="${s.applicationUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-primary" style="text-decoration:none;">
                                        Official Portal ↗
                                    </a>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                `;
            });
            html += '</div>';
            container.innerHTML = html;
        }
    };

    window.PageModules = window.PageModules || {};
    window.PageModules.schemes = SchemesModule;

    document.addEventListener('DOMContentLoaded', () => {
        if (window.location.pathname.includes('schemes')) {
            SchemesModule.init();
        }
    });
})();
