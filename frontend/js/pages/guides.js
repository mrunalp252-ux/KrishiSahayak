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
                const lang = (window.I18n && window.I18n.getCurrentLanguage()) || 'en';

                const cropName = guide.cropName || (guide.crop && guide.crop.cropName) || guide.crop || 'Cultivation';

                const sectionTitleTranslations = {
                    'Land Preparation': { mr: 'जमिनीची तयारी', hi: 'खेत / भूमि की तैयारी' },
                    'Seed Selection': { mr: 'बियाणे निवड आणि बीजप्रक्रिया', hi: 'बीज चयन और उपचार' },
                    'Seed Selection & Treatment': { mr: 'बियाणे निवड आणि प्रक्रिया', hi: 'बीज चयन एवं उपचार' },
                    'Sowing': { mr: 'पेरणीची पद्धत', hi: 'बुआई की विधि' },
                    'Sowing / Planting Technique': { mr: 'पेरणी व लागवड तंत्रज्ञान', hi: 'बुआई एवं रोपाई तकनीक' },
                    'Irrigation': { mr: 'पाणी व्यवस्थापन (सिंचन)', hi: 'सिंचाई एवं जल प्रबंधन' },
                    'Irrigation & Water Management': { mr: 'पाणी व सिंचन व्यवस्थापन', hi: 'सिंचाई और जल प्रबंधन' },
                    'Nutrient Management': { mr: 'खत व पोषण व्यवस्थापन', hi: 'पोषक तत्व व उर्वरक प्रबंधन' },
                    'Nutrient & Fertilizer Management': { mr: 'खत आणि पोषण व्यवस्थापन', hi: 'उर्वरक एवं पोषण प्रबंधन' },
                    'Pest Management': { mr: 'कीड नियंत्रण व व्यवस्थापन', hi: 'कीट नियंत्रण एवं प्रबंधन' },
                    'Pest & Weed Management': { mr: 'कीड व तण व्यवस्थापन', hi: 'कीट एवं खरपतवार प्रबंधन' },
                    'Disease Management': { mr: 'रोग नियंत्रण व व्यवस्थापन', hi: 'रोग नियंत्रण एवं प्रबंधन' },
                    'Harvesting': { mr: 'कापणी व काढणी तंत्र', hi: 'कटाई एवं मड़ाई' },
                    'Harvesting & Post-Harvest Storage': { mr: 'कापणी व साठवणूक', hi: 'कटाई एवं सुरक्षित भंडारण' },
                    'Post-Harvest': { mr: 'काढणीपश्चात व्यवस्थापन व साठवणूक', hi: 'कटाई उपरांत प्रबंधन एवं भंडारण' },
                    'Climate & Weather Requirements': { mr: 'हवामान व अनुकूल परिस्थिती', hi: 'जलवायु एवं मौसम की आवश्यकताएं' },
                    'Soil Preparation & Requirements': { mr: 'जमीन व मशागत आवश्यकता', hi: 'मृदा आवश्यकता एवं खेत की तैयारी' }
                };

                const getStepPrefix = (stepNum, l) => {
                    if (l === 'mr') {
                        const digits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
                        const numStr = String(stepNum).split('').map(d => digits[parseInt(d, 10)] || d).join('');
                        return `पायरी ${numStr}`;
                    }
                    if (l === 'hi') {
                        const digits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
                        const numStr = String(stepNum).split('').map(d => digits[parseInt(d, 10)] || d).join('');
                        return `चरण ${numStr}`;
                    }
                    return `Step ${stepNum}`;
                };

                // Assemble sections ensuring Step 1 starts at index 0
                let normalizedSections = [];
                if (Array.isArray(guide.sections) && guide.sections.length > 0) {
                    const sorted = [...guide.sections].sort((a, b) => (a.order || 0) - (b.order || 0));
                    normalizedSections = sorted
                        .filter(s => s && s.content && String(s.content).trim())
                        .map(s => ({
                            title: String(s.title || '').replace(/^\d+[\.\s\-:]+/, '').trim(),
                            content: String(s.content).trim()
                        }));
                }

                if (normalizedSections.length === 0) {
                    const fallbackCandidates = [
                        { rawTitle: 'Climate & Weather Requirements', content: guide.climateRequirements || guide.climate },
                        { rawTitle: 'Land Preparation', content: guide.soilRequirements || guide.soil || guide.landPreparation },
                        { rawTitle: 'Seed Selection & Treatment', content: guide.seedSelection || guide.seedTreatment },
                        { rawTitle: 'Sowing / Planting Technique', content: guide.sowing || guide.plantingMethod },
                        { rawTitle: 'Irrigation & Water Management', content: guide.waterManagement || guide.irrigation },
                        { rawTitle: 'Nutrient & Fertilizer Management', content: guide.nutrientManagement || guide.fertilizers },
                        { rawTitle: 'Pest & Weed Management', content: guide.pestManagement || guide.weedControl },
                        { rawTitle: 'Disease Management', content: guide.diseaseManagement },
                        { rawTitle: 'Harvesting & Post-Harvest Storage', content: guide.harvesting || guide.postHarvest }
                    ];

                    normalizedSections = fallbackCandidates
                        .filter(c => c.content && String(c.content).trim())
                        .map(c => ({
                            title: c.rawTitle,
                            content: String(c.content).trim()
                        }));
                }

                let sectionsHtml = '';
                normalizedSections.forEach((sec, idx) => {
                    const stepNumber = idx + 1;
                    const stepPrefix = getStepPrefix(stepNumber, lang);
                    const cleanTitle = sec.title || `Stage ${stepNumber}`;
                    const localizedTitle = (sectionTitleTranslations[cleanTitle] && sectionTitleTranslations[cleanTitle][lang]) || cleanTitle;
                    const displayHeading = `${stepPrefix}: ${localizedTitle}`;

                    sectionsHtml += `
                        <div class="guide-step-card" style="margin-bottom:14px; background:var(--bg-secondary, #f9fafb); border-radius:8px; border:1px solid rgba(0,0,0,0.06); padding:14px;">
                            <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">
                                <span class="badge badge-success" style="font-weight:600; font-size:0.8rem; padding:3px 8px;">${stepPrefix}</span>
                                <h4 style="margin:0; color:var(--primary-color, #059669); font-size:0.98rem;">${localizedTitle}</h4>
                            </div>
                            <p style="margin:0; font-size:0.92rem; line-height:1.6; color:var(--text-color, #374151);">${sec.content}</p>
                        </div>
                    `;
                });

                const guideTitleLabel = lang === 'mr' ? 'पीक लागवड मार्गदर्शक' : (lang === 'hi' ? 'फसल खेती मार्गदर्शिका' : 'Cultivation Guide');
                const closeBtnLabel = lang === 'mr' ? 'बंद करा' : (lang === 'hi' ? 'बंद करें' : 'Close');
                const emptyNotice = lang === 'mr' ? 'या पिकासाठी सविस्तर पायऱ्या तयार केल्या जात आहेत.' : (lang === 'hi' ? 'इस फसल के लिए विस्तृत चरण तैयार किए जा रहे हैं।' : 'Detailed steps are being compiled for this crop.');

                const modalHtml = `
                    <div style="min-width:320px; max-width:680px; width:100%; max-height:85vh; overflow-y:auto; padding:4px;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; position:sticky; top:0; background:var(--bg-color, white); padding:10px 0; border-bottom:1px solid #e5e7eb; z-index:2;">
                            <h3 style="margin:0; font-size:1.3rem; color:var(--primary-dark, #065f46);">🌾 ${cropName} — ${guideTitleLabel}</h3>
                            <button class="close-modal" aria-label="Close" style="background:none; border:none; font-size:1.6rem; cursor:pointer; color:#6b7280;">&times;</button>
                        </div>
                        <div>
                            ${sectionsHtml || `<p style="text-align:center; padding:20px; color:#6b7280;">${emptyNotice}</p>`}
                        </div>
                        <div style="text-align:right; margin-top:16px; position:sticky; bottom:0; background:var(--bg-color, white); padding:10px 0; border-top:1px solid #e5e7eb;">
                            <button class="btn btn-primary close-modal">${closeBtnLabel}</button>
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
