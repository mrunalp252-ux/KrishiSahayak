// js/pages/guides.js - Cultivation Guides Controller
// Fully multilingual: English, Marathi, and Hindi with strict Step 1 sequential numbering

(function() {
    'use strict';

    const CROP_LOCAL_NAMES = {
        'Rice': { mr: 'भात (Rice)', hi: 'चावल/धान (Rice)' },
        'Wheat': { mr: 'गहू (Wheat)', hi: 'गेहूं (Wheat)' },
        'Maize': { mr: 'मका (Maize)', hi: 'मक्का (Maize)' },
        'Jowar': { mr: 'ज्वारी (Jowar)', hi: 'ज्वार (Jowar)' },
        'Bajra': { mr: 'बाजरी (Bajra)', hi: 'बाजरा (Bajra)' },
        'Chickpea': { mr: 'हरभरा / चना (Chickpea)', hi: 'चना (Chickpea)' },
        'Tur': { mr: 'तूर / अरहर (Tur)', hi: 'अरहर / तूर (Pigeon Pea)' },
        'Moong': { mr: 'मूग (Green Gram)', hi: 'मूंग (Moong)' },
        'Urad': { mr: 'उडीद (Black Gram)', hi: 'उड़द (Urad)' },
        'Soybean': { mr: 'सोयाबीन (Soybean)', hi: 'सोयाबीन (Soybean)' },
        'Groundnut': { mr: 'भुईमूग (Groundnut)', hi: 'मूंगफली (Groundnut)' },
        'Mustard': { mr: 'मोहरी (Mustard)', hi: 'सरसों (Mustard)' },
        'Sunflower': { mr: 'सूर्यफूल (Sunflower)', hi: 'सूरजमुखी (Sunflower)' },
        'Sesame': { mr: 'तीळ (Sesame)', hi: 'तिल (Sesame)' },
        'Safflower': { mr: 'करडई (Safflower)', hi: 'कुसुम (Safflower)' },
        'Cotton': { mr: 'कापूस (Cotton)', hi: 'कपास (Cotton)' },
        'Sugarcane': { mr: 'ऊस (Sugarcane)', hi: 'गन्ना (Sugarcane)' },
        'Tomato': { mr: 'टोमॅटो (Tomato)', hi: 'टमाटर (Tomato)' },
        'Onion': { mr: 'कांदा (Onion)', hi: 'प्याज (Onion)' },
        'Potato': { mr: 'बटाटा (Potato)', hi: 'आलू (Potato)' },
        'Brinjal': { mr: 'वांगी (Brinjal)', hi: 'बैंगन (Brinjal)' },
        'Okra': { mr: 'भेंडी (Okra/Bhindi)', hi: 'भिंडी (Okra)' },
        'Cabbage': { mr: 'कोबी (Cabbage)', hi: 'पत्तागोभी (Cabbage)' },
        'Cauliflower': { mr: 'फ्लॉवर (Cauliflower)', hi: 'फूलगोभी (Cauliflower)' },
        'Chilli': { mr: 'मिरची (Chilli)', hi: 'मिर्च (Chilli)' },
        'Garlic': { mr: 'लसूण (Garlic)', hi: 'लहसुन (Garlic)' },
        'Ginger': { mr: 'आले (Ginger)', hi: 'अदरक (Ginger)' },
        'Turmeric': { mr: 'हळद (Turmeric)', hi: 'हल्दी (Turmeric)' },
        'Coriander': { mr: 'कोथिंबीर (Coriander)', hi: 'धनिया (Coriander)' },
        'Carrot': { mr: 'गाजर (Carrot)', hi: 'गाजर (Carrot)' },
        'Cucumber': { mr: 'काकडी (Cucumber)', hi: 'खीरा (Cucumber)' },
        'Bottle Gourd': { mr: 'दुधी भोपळा (Bottle Gourd)', hi: 'लौकी (Bottle Gourd)' },
        'Mango': { mr: 'आंबा (Mango)', hi: 'आम (Mango)' },
        'Grapes': { mr: 'द्राक्ष (Grapes)', hi: 'अंगूर (Grapes)' },
        'Pomegranate': { mr: 'डाळिंब (Pomegranate)', hi: 'अनार (Pomegranate)' },
        'Banana': { mr: 'केळी (Banana)', hi: 'केला (Banana)' },
        'Guava': { mr: 'पेरू (Guava)', hi: 'अमरूद (Guava)' }
    };

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

            window.addEventListener('languageChanged', () => {
                this.loadCrops();
                this.loadGuides();
            });
        },

        getLang() {
            return (window.I18n && window.I18n.getCurrentLanguage()) || localStorage.getItem('language') || localStorage.getItem('krishi_language') || 'en';
        },

        async loadCrops() {
            try {
                const res = await window.API.get('/crops?limit=50');
                const crops = res.crops || res.data || [];
                const select = document.getElementById('guide-crop-filter');
                const lang = this.getLang();

                if (select) {
                    const currentVal = select.value;
                    select.innerHTML = `<option value="">${lang === 'mr' ? 'सर्व पिके' : (lang === 'hi' ? 'सभी फसलें' : 'All Crops')}</option>`;
                    crops.forEach(c => {
                        const baseName = c.name || c.cropName;
                        if (baseName) {
                            const localizedName = (CROP_LOCAL_NAMES[baseName] && CROP_LOCAL_NAMES[baseName][lang]) || baseName;
                            const opt = document.createElement('option');
                            opt.value = baseName;
                            opt.textContent = localizedName;
                            select.appendChild(opt);
                        }
                    });
                    if (currentVal) select.value = currentVal;
                }
            } catch(e) {}
        },

        async loadGuides() {
            const search = document.getElementById('guide-search')?.value.trim() || '';
            const crop = document.getElementById('guide-crop-filter')?.value || '';
            const container = document.getElementById('guides-container');
            const lang = this.getLang();

            const loadingMsg = lang === 'mr' ? 'लागवड मार्गदर्शक लोड होत आहेत...' : (lang === 'hi' ? 'खेती मार्गदर्शिका लोड हो रही है...' : 'Loading cultivation guides...');
            if (container) {
                container.innerHTML = `<div class="empty-state" style="grid-column:1/-1; text-align:center; padding:40px;"><p>${loadingMsg}</p></div>`;
            }

            try {
                let url = `/guides?page=${this.currentPage}&limit=${this.limit}&lang=${encodeURIComponent(lang)}`;
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
                this.renderCards(guides, lang);
                this.renderPagination(pagination, lang);
            } catch (err) {
                console.error('Error loading guides:', err);
                if (container) {
                    container.innerHTML = `<div class="empty-state" style="grid-column:1/-1; text-align:center; color:#ef4444; padding:40px;"><p>Failed to load guides: ${err.message}</p></div>`;
                }
            }
        },

        renderCards(guides, lang) {
            const container = document.getElementById('guides-container');
            if (!container) return;

            if (!guides || guides.length === 0) {
                const emptyTitle = lang === 'mr' ? 'कोणताही मार्गदर्शक सापडला नाही' : (lang === 'hi' ? 'कोई मार्गदर्शिका नहीं मिली' : 'No cultivation guides found.');
                const emptySubtitle = lang === 'mr' ? 'कृपया वेगळे पीक निवडा किंवा शोध संज्ञा बदला.' : (lang === 'hi' ? 'कृपया दूसरी फसल चुनें या खोज शब्द बदलें।' : 'Try selecting a different crop or clearing the search query.');
                container.innerHTML = `
                    <div class="empty-state" style="grid-column:1/-1; text-align:center; padding:48px; color:#6b7280;">
                        <p style="font-size:1.1rem; margin-bottom:8px;">${emptyTitle}</p>
                        <small>${emptySubtitle}</small>
                    </div>
                `;
                return;
            }

            const readGuideLabel = lang === 'mr' ? 'सविस्तर मार्गदर्शक वाचा 📖' : (lang === 'hi' ? 'विस्तृत मार्गदर्शिका पढ़ें 📖' : 'Read Step-by-Step Guide 📖');
            const badgeLabel = lang === 'mr' ? 'संपूर्ण मार्गदर्शक' : (lang === 'hi' ? 'सम्पूर्ण मार्गदर्शिका' : 'Full Guide');

            container.innerHTML = guides.map(g => {
                const rawCropName = g.cropName || (g.crop && g.crop.name) || 'Cultivation';
                const displayName = (CROP_LOCAL_NAMES[rawCropName] && CROP_LOCAL_NAMES[rawCropName][lang]) || rawCropName;
                const id = g._id || g.id || rawCropName;

                // Find Climate & Soil from sections if present
                let climateSnippet = '';
                let soilSnippet = '';
                if (Array.isArray(g.sections)) {
                    const cSec = g.sections.find(s => s.order === 1 || (s.title && s.title.includes('Climate')));
                    if (cSec && cSec.content) climateSnippet = cSec.content.slice(0, 95) + '...';
                    const sSec = g.sections.find(s => s.order === 2 || (s.title && s.title.includes('Soil')));
                    if (sSec && sSec.content) soilSnippet = sSec.content.slice(0, 95) + '...';
                }

                const climateLabel = lang === 'mr' ? 'हवामान' : (lang === 'hi' ? 'जलवायु' : 'Climate');
                const soilLabel = lang === 'mr' ? 'जमीन' : (lang === 'hi' ? 'मृदा' : 'Soil');

                return `
                    <div class="card" style="cursor:pointer; display:flex; flex-direction:column; justify-content:space-between; transition: transform 0.2s ease, box-shadow 0.2s ease;" onclick="window.PageModules.guides.showDetails('${id}')" onmouseover="this.style.transform='translateY(-3px)'" onmouseout="this.style.transform='translateY(0)'">
                        <div>
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                                <h3 style="margin:0; font-size:1.2rem; color:var(--text-color, #1f2937);">🌾 ${displayName}</h3>
                                <span class="badge badge-success">${badgeLabel}</span>
                            </div>

                            ${climateSnippet ? `
                                <div style="margin-bottom:8px; font-size:0.88rem; color:#4b5563;">
                                    <strong>🌤️ ${climateLabel}:</strong> ${climateSnippet}
                                </div>
                            ` : ''}

                            ${soilSnippet ? `
                                <div style="margin-bottom:12px; font-size:0.88rem; color:#4b5563;">
                                    <strong>🌱 ${soilLabel}:</strong> ${soilSnippet}
                                </div>
                            ` : ''}
                        </div>

                        <div style="margin-top:12px;">
                            <button class="btn btn-sm btn-outline-primary w-full" style="pointer-events:none;">${readGuideLabel}</button>
                        </div>
                    </div>
                `;
            }).join('');
        },

        renderPagination(pagination, lang) {
            const container = document.getElementById('guides-pagination');
            if (!container) return;

            const totalPages = pagination.totalPages || 1;
            const current = pagination.page || this.currentPage;

            if (totalPages <= 1) {
                container.innerHTML = '';
                return;
            }

            const pageLabel = lang === 'mr' ? `पृष्ठ ${current} पैकी ${totalPages}` : (lang === 'hi' ? `पृष्ठ ${current} का ${totalPages}` : `Page ${current} of ${totalPages}`);
            const prevLabel = lang === 'mr' ? '◀ मागील' : (lang === 'hi' ? '◀ पिछला' : '◀ Prev');
            const nextLabel = lang === 'mr' ? 'पुढील ▶' : (lang === 'hi' ? 'अगला ▶' : 'Next ▶');

            container.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center; padding:16px 8px; font-size:0.85rem;">
                    <div style="color:#6b7280;">${pageLabel}</div>
                    <div style="display:flex; gap:8px;">
                        <button class="btn btn-sm ${current === 1 ? 'btn-disabled' : 'btn-outline-primary'}" id="guides-prev" ${current === 1 ? 'disabled' : ''}>${prevLabel}</button>
                        <button class="btn btn-sm ${current === totalPages ? 'btn-disabled' : 'btn-outline-primary'}" id="guides-next" ${current === totalPages ? 'disabled' : ''}>${nextLabel}</button>
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
                const lang = this.getLang();
                const res = await window.API.get(`/guides/${idOrCrop}?lang=${encodeURIComponent(lang)}`);
                const guide = res.guide || res.data || res;

                const rawCropName = guide.cropName || (guide.crop && guide.crop.name) || guide.crop || 'Cultivation';
                const displayCropName = (CROP_LOCAL_NAMES[rawCropName] && CROP_LOCAL_NAMES[rawCropName][lang]) || rawCropName;

                const sectionTitleTranslations = {
                    'Climate & Weather Requirements': { mr: 'हवामान व अनुकूल परिस्थिती', hi: 'जलवायु एवं मौसम की आवश्यकताएं' },
                    'Soil Requirements & Land Preparation': { mr: 'जमीन व पूर्वमशागत', hi: 'मृदा आवश्यकता एवं खेत की तैयारी' },
                    'Land Preparation': { mr: 'जमिनीची तयारी व मशागत', hi: 'खेत / भूमि की तैयारी' },
                    'Seed Selection': { mr: 'बियाणे निवड आणि बीजप्रक्रिया', hi: 'बीज चयन और उपचार' },
                    'Seed Selection & Treatment': { mr: 'वाण निवड आणि बीजप्रक्रिया', hi: 'उन्नत बीज चयन एवं उपचार' },
                    'Sowing': { mr: 'पेरणीची पद्धत व अंतर', hi: 'बुआई की विधि व दूरी' },
                    'Sowing & Spacing Techniques': { mr: 'पेरणी व लागवड तंत्रज्ञान', hi: 'बुआई एवं रोपाई की तकनीक' },
                    'Sowing / Planting Technique': { mr: 'पेरणी व लागवड तंत्रज्ञान', hi: 'बुआई एवं रोपाई तकनीक' },
                    'Irrigation': { mr: 'पाणी व्यवस्थापन (सिंचन)', hi: 'सिंचाई एवं जल प्रबंधन' },
                    'Irrigation & Water Management': { mr: 'पाणी व सिंचन व्यवस्थापन', hi: 'सिंचाई और जल प्रबंधन' },
                    'Fertilizer & Nutrient Management': { mr: 'खत व पोषण व्यवस्थापन', hi: 'खाद एवं उर्वरक प्रबंधन' },
                    'Nutrient Management': { mr: 'खत व पोषण व्यवस्थापन', hi: 'पोषक तत्व व उर्वरक प्रबंधन' },
                    'Nutrient & Fertilizer Management': { mr: 'खत आणि पोषण व्यवस्थापन', hi: 'उर्वरक एवं पोषण प्रबंधन' },
                    'Pest Management': { mr: 'कीड नियंत्रण व व्यवस्थापन', hi: 'कीट नियंत्रण एवं प्रबंधन' },
                    'Pest Management & IPM Practices': { mr: 'कीड नियंत्रण व एकात्मिक व्यवस्थापन (IPM)', hi: 'कीट नियंत्रण एवं एकीकृत कीट प्रबंधन (IPM)' },
                    'Pest & Weed Management': { mr: 'कीड व तण व्यवस्थापन', hi: 'कीट एवं खरपतवार प्रबंधन' },
                    'Disease Management': { mr: 'रोग नियंत्रण व व्यवस्थापन', hi: 'रोग नियंत्रण एवं प्रबंधन' },
                    'Disease Management & Plant Health': { mr: 'रोग नियंत्रण व उपाययोजना', hi: 'रोग नियंत्रण एवं फसल सुरक्षा' },
                    'Harvesting': { mr: 'कापणी व काढणी तंत्र', hi: 'कटाई एवं मड़ाई' },
                    'Harvesting Technique & Timing': { mr: 'काढणी व कापणी तंत्र', hi: 'फसल कटाई एवं मड़ाई की तकनीक' },
                    'Harvesting & Post-Harvest Storage': { mr: 'कापणी व साठवणूक', hi: 'कटाई एवं सुरक्षित भंडारण' },
                    'Post-Harvest': { mr: 'काढणीपश्चात व्यवस्थापन व साठवणूक', hi: 'कटाई उपरांत प्रबंधन एवं भंडारण' },
                    'Post-Harvest Storage & Farmer Tips': { mr: 'काढणीपश्चात व्यवस्थापन, साठवणूक व सल्ला', hi: 'सुरक्षित भंडारण एवं किसान उपयोगी सुझाव' }
                };

                const getStepPrefix = (stepNum, l) => {
                    const devanagariDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
                    const toDev = (num) => String(num).split('').map(d => devanagariDigits[parseInt(d, 10)] || d).join('');

                    if (l === 'mr') return `पायरी ${toDev(stepNum)}`;
                    if (l === 'hi') return `चरण ${toDev(stepNum)}`;
                    return `Step ${stepNum}`;
                };

                // Assemble sections ensuring Step 1 starts at index 0 (strict sequential numbering 1, 2, 3...)
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
                        { rawTitle: 'Soil Requirements & Land Preparation', content: guide.soilRequirements || guide.soil || guide.landPreparation },
                        { rawTitle: 'Seed Selection & Treatment', content: guide.seedSelection || guide.seedTreatment },
                        { rawTitle: 'Sowing & Spacing Techniques', content: guide.sowing || guide.plantingMethod },
                        { rawTitle: 'Irrigation & Water Management', content: guide.waterManagement || guide.irrigation },
                        { rawTitle: 'Fertilizer & Nutrient Management', content: guide.nutrientManagement || guide.fertilizers },
                        { rawTitle: 'Pest Management & IPM Practices', content: guide.pestManagement || guide.weedControl },
                        { rawTitle: 'Disease Management & Plant Health', content: guide.diseaseManagement },
                        { rawTitle: 'Harvesting Technique & Timing', content: guide.harvesting },
                        { rawTitle: 'Post-Harvest Storage & Farmer Tips', content: guide.postHarvest || guide.storage }
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
                    const stepNumber = idx + 1; // Guaranteed 1 to N without missing numbers
                    const stepPrefix = getStepPrefix(stepNumber, lang);
                    const cleanTitle = sec.title || `Stage ${stepNumber}`;
                    const localizedTitle = (sectionTitleTranslations[cleanTitle] && sectionTitleTranslations[cleanTitle][lang]) || cleanTitle;

                    sectionsHtml += `
                        <div class="guide-step-card" style="margin-bottom:14px; background:var(--bg-secondary, #f9fafb); border-radius:8px; border:1px solid rgba(0,0,0,0.06); padding:14px;">
                            <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">
                                <span class="badge badge-success" style="font-weight:600; font-size:0.82rem; padding:3px 8px;">${stepPrefix}</span>
                                <h4 style="margin:0; color:var(--primary-color, #059669); font-size:1rem;">${localizedTitle}</h4>
                            </div>
                            <p style="margin:0; font-size:0.92rem; line-height:1.65; color:var(--text-color, #374151);">${sec.content}</p>
                        </div>
                    `;
                });

                const guideTitleLabel = lang === 'mr' ? 'पीक लागवड संपूर्ण मार्गदर्शक' : (lang === 'hi' ? 'फसल खेती विस्तृत मार्गदर्शिका' : 'Cultivation Guide');
                const closeBtnLabel = lang === 'mr' ? 'बंद करा' : (lang === 'hi' ? 'बंद करें' : 'Close');
                const emptyNotice = lang === 'mr' ? 'या पिकासाठी सविस्तर पायऱ्या तयार केल्या जात आहेत.' : (lang === 'hi' ? 'इस फसल के लिए विस्तृत चरण तैयार किए जा रहे हैं।' : 'Detailed steps are being compiled for this crop.');

                const modalHtml = `
                    <div style="min-width:320px; max-width:720px; width:100%; max-height:85vh; overflow-y:auto; padding:4px;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; position:sticky; top:0; background:var(--bg-color, white); padding:10px 0; border-bottom:1px solid #e5e7eb; z-index:2;">
                            <h3 style="margin:0; font-size:1.3rem; color:var(--primary-dark, #065f46);">🌾 ${displayCropName} — ${guideTitleLabel}</h3>
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

    document.addEventListener('DOMContentLoaded', () => {
        if (window.location.pathname.includes('cultivation-guides')) {
            GuidesModule.init();
        }
    });
})();
