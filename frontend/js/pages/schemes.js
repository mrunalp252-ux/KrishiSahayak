// js/pages/schemes.js - Government Agricultural Schemes Page Controller
// Fully multilingual: English, Marathi, and Hindi for cards, filters, and detail lists

(function() {
    'use strict';

    const CATEGORY_NAMES = {
        financial_support: { en: '💰 Direct Financial Support', mr: '💰 थेट आर्थिक साहाय्य', hi: '💰 प्रत्यक्ष वित्तीय सहायता' },
        crop_insurance: { en: '🛡️ Crop Insurance', mr: '🛡️ पीक विमा संरक्षण', hi: '🛡️ फसल बीमा सुरक्षा' },
        credit: { en: '💳 Kisan Credit & Loans', mr: '💳 किसान क्रेडिट व पीक कर्ज', hi: '💳 किसान क्रेडिट व फसली ऋण' },
        irrigation: { en: '💧 Micro Irrigation', mr: '💧 सूक्ष्म सिंचन व तुषार/ठिबक', hi: '💧 सूक्ष्म सिंचाई (ड्रिप/स्प्रिंकलर)' },
        soil_health: { en: '🧪 Soil Health', mr: '🧪 मृदा आरोग्य व चाचणी', hi: '🧪 मृदा स्वास्थ्य एवं परीक्षण' },
        subsidy: { en: '🚜 Farm Machinery & Subsidy', mr: '🚜 कृषी औजारे व यंत्र अनुदान', hi: '🚜 कृषि यंत्र व सब्सिडी' },
        general: { en: '🌾 Agriculture', mr: '🌾 शेती व कृषी कल्याण', hi: '🌾 कृषि एवं किसान कल्याण' }
    };

    const SchemesModule = {
        schemes: [],

        async init() {
            this.setupEventListeners();
            await this.loadSchemes();
        },

        getLang() {
            return (window.I18n && window.I18n.getCurrentLanguage()) || localStorage.getItem('language') || localStorage.getItem('krishi_language') || 'en';
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
            const lang = this.getLang();
            const loadingMsg = lang === 'mr' ? 'शासकीय योजना लोड होत आहेत...' : (lang === 'hi' ? 'सरकारी योजनाएं लोड हो रही हैं...' : 'Loading government schemes...');

            if (container) {
                container.innerHTML = `<div class="empty-state" style="text-align:center; padding:40px;"><p>${loadingMsg}</p></div>`;
            }

            const category = document.getElementById('scheme-category-filter')?.value || '';
            const level = document.getElementById('scheme-level-filter')?.value || '';
            const search = document.getElementById('scheme-search-input')?.value || '';

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
                    const failMsg = lang === 'mr' ? 'योजना लोड करण्यात त्रुटी आली:' : (lang === 'hi' ? 'योजनाएं लोड करने में विफल:' : 'Failed to load schemes:');
                    container.innerHTML = `<div class="empty-state" style="color:#ef4444; text-align:center; padding:40px;"><p>${failMsg} ${err.message}</p></div>`;
                }
            }
        },

        renderSchemes(schemes, lang) {
            const container = document.getElementById('schemes-container');
            if (!container) return;

            if (!schemes || schemes.length === 0) {
                const emptyTitle = lang === 'mr' ? '🏛️ कोणतीही शासकीय योजना सापडली नाही' : (lang === 'hi' ? '🏛️ कोई सरकारी योजना नहीं मिली' : '🏛️ No schemes found');
                const emptySub = lang === 'mr' ? 'कृपया वेगळा वर्ग निवडा किंवा शोध संज्ञा बदला.' : (lang === 'hi' ? 'कृपया अलग श्रेणी चुनें या खोज शब्द बदलें।' : 'Try adjusting your filters or search keywords.');
                container.innerHTML = `
                    <div class="card" style="text-align:center; padding:48px; color:#6b7280;">
                        <p style="font-size:1.2rem; margin-bottom:8px;">${emptyTitle}</p>
                        <p style="font-size:0.95rem;">${emptySub}</p>
                    </div>
                `;
                return;
            }

            const benefitLabel = lang === 'mr' ? '🎁 मुख्य लाभ:' : (lang === 'hi' ? '🎁 मुख्य लाभ:' : '🎁 Key Benefit:');
            const eligibilityLabel = lang === 'mr' ? '👥 पात्रता निकष:' : (lang === 'hi' ? '👥 पात्रता शर्तें:' : '👥 Eligibility Criteria:');
            const documentsLabel = lang === 'mr' ? '📑 आवश्यक कागदपत्रे:' : (lang === 'hi' ? '📑 आवश्यक दस्तावेज:' : '📑 Required Documents:');
            const portalBtnLabel = lang === 'mr' ? 'अधिकृत पोर्टल ↗' : (lang === 'hi' ? 'आधिकारिक पोर्टल ↗' : 'Official Portal ↗');
            const helplineLabel = lang === 'mr' ? '📞 हेल्पलाइन:' : (lang === 'hi' ? '📞 हेल्पलाइन:' : '📞 Helpline:');
            const verifyNotice = lang === 'mr' ? 'ℹ️ अधिकृत पोर्टलवर नवीनतम माहिती व मार्गदर्शक तत्त्वे तपासा.' : (lang === 'hi' ? 'ℹ️ आधिकारिक पोर्टल पर नवीनतम जानकारी और दिशानिर्देश सत्यापित करें।' : 'ℹ️ Verify latest updates and guidelines on the official portal.');

            let html = '<div class="grid-2" style="gap: 20px;">';
            schemes.forEach(s => {
                const title = s.displayTitle || ((lang === 'mr' && s.titleMr) ? s.titleMr : ((lang === 'hi' && s.titleHi) ? s.titleHi : s.title));
                const desc = s.displayDescription || ((lang === 'mr' && s.descriptionMr) ? s.descriptionMr : ((lang === 'hi' && s.descriptionHi) ? s.descriptionHi : s.description));
                const benefits = s.displayBenefits || ((lang === 'mr' && s.benefitsMr) ? s.benefitsMr : ((lang === 'hi' && s.benefitsHi) ? s.benefitsHi : s.benefits));

                const levelBadge = s.level === 'central'
                    ? (lang === 'mr' ? '<span class="badge" style="background:#e0e7ff; color:#3730a3;">🇮🇳 केंद्र शासन</span>' : (lang === 'hi' ? '<span class="badge" style="background:#e0e7ff; color:#3730a3;">🇮🇳 केंद्र सरकार</span>' : '<span class="badge" style="background:#e0e7ff; color:#3730a3;">🇮🇳 Central Govt</span>'))
                    : (lang === 'mr' ? `<span class="badge" style="background:#fef3c7; color:#92400e;">📍 राज्य शासन (${s.state || 'महाराष्ट्र'})</span>` : (lang === 'hi' ? `<span class="badge" style="background:#fef3c7; color:#92400e;">📍 राज्य सरकार (${s.state || 'महाराष्ट्र'})</span>` : `<span class="badge" style="background:#fef3c7; color:#92400e;">📍 State (${s.state || 'State'})</span>`));

                const catObj = CATEGORY_NAMES[s.category] || CATEGORY_NAMES.general;
                const categoryLabel = catObj[lang] || catObj.en;

                const rawElig = s.displayEligibility || (lang === 'mr' ? s.eligibilityMr : (lang === 'hi' ? s.eligibilityHi : s.eligibility)) || s.eligibility || [];
                const rawDocs = s.displayDocuments || (lang === 'mr' ? s.documentsMr : (lang === 'hi' ? s.documentsHi : s.documents)) || s.documents || [];

                const eligibilityList = rawElig.map(e => `<li>${e}</li>`).join('');
                const documentsList = rawDocs.map(d => `<span class="badge" style="background:#f3f4f6; color:#374151; margin:2px;">📄 ${d}</span>`).join('');

                html += `
                    <div class="card" style="display:flex; flex-direction:column; justify-content:space-between; border-top: 4px solid #10b981; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
                        <div>
                            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px; gap:8px;">
                                <div>
                                    <h3 style="margin:0 0 6px 0; font-size:1.18rem; color:var(--text-color, #1f2937); line-height:1.35;">${title}</h3>
                                    <div style="display:flex; gap:6px; flex-wrap:wrap; font-size:0.8rem;">
                                        ${levelBadge}
                                        <span class="badge" style="background:#ecfdf5; color:#065f46;">${categoryLabel}</span>
                                    </div>
                                </div>
                                ${s.shortCode ? `<span style="font-weight:700; color:#059669; font-size:0.82rem; background:#d1fae5; padding:3px 8px; border-radius:4px; white-space:nowrap;">${s.shortCode}</span>` : ''}
                            </div>

                            <!-- Benefits Highlight -->
                            <div style="background:#f0fdf4; border-left:3px solid #10b981; padding:8px 12px; border-radius:4px; margin-bottom:12px;">
                                <strong style="color:#065f46; font-size:0.85rem;">${benefitLabel}</strong>
                                <p style="margin:2px 0 0 0; font-size:0.9rem; color:#166534; font-weight:500; line-height:1.45;">${benefits}</p>
                            </div>

                            <!-- Description -->
                            <p style="font-size:0.9rem; color:#4b5563; line-height:1.5; margin-bottom:12px;">${desc}</p>

                            <!-- Eligibility -->
                            ${eligibilityList ? `
                                <div style="margin-bottom:12px;">
                                    <strong style="font-size:0.84rem; color:#374151; display:block; margin-bottom:4px;">${eligibilityLabel}</strong>
                                    <ul style="margin:0; padding-left:20px; font-size:0.84rem; color:#4b5563; line-height:1.45;">${eligibilityList}</ul>
                                </div>
                            ` : ''}

                            <!-- Documents -->
                            ${documentsList ? `
                                <div style="margin-bottom:14px;">
                                    <strong style="font-size:0.84rem; color:#374151; display:block; margin-bottom:4px;">${documentsLabel}</strong>
                                    <div style="display:flex; flex-wrap:wrap; gap:4px;">${documentsList}</div>
                                </div>
                            ` : ''}

                            <div style="font-size:0.78rem; color:#9ca3af; margin-top:6px; font-style:italic;">
                                ${verifyNotice}
                            </div>
                        </div>

                        <!-- Card Footer -->
                        <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid #f3f4f6; margin-top:14px; padding-top:12px; flex-wrap:wrap; gap:8px;">
                            <div>
                                ${s.helpline ? `
                                    <a href="tel:${s.helpline.split('/')[0].trim()}" style="font-size:0.82rem; color:#2563eb; text-decoration:none; font-weight:500;">
                                        ${helplineLabel} ${s.helpline}
                                    </a>
                                ` : ''}
                            </div>
                            <div>
                                ${s.applicationUrl ? `
                                    <a href="${s.applicationUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-primary" style="text-decoration:none;">
                                        ${portalBtnLabel}
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
