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
            this.setupPlantDoctor();
            await this.loadCrops();
            await this.loadData();
        },

        setupTabs() {
            const tabsContainer = document.getElementById('pest-tabs');
            const doctorContainer = document.getElementById('plant-doctor-container');
            const filtersSection = document.getElementById('pests-filters-section');
            const pestsContainer = document.getElementById('pests-container');
            const paginationEl = document.getElementById('pests-pagination');

            if (tabsContainer) {
                tabsContainer.addEventListener('click', (e) => {
                    const tabEl = e.target.closest('.tab-item');
                    if (tabEl && tabEl.dataset.tab) {
                        tabsContainer.querySelectorAll('.tab-item').forEach(t => t.classList.remove('active'));
                        tabEl.classList.add('active');
                        this.activeTab = tabEl.dataset.tab;

                        if (this.activeTab === 'plant-doctor') {
                            if (doctorContainer) doctorContainer.style.display = 'block';
                            if (filtersSection) filtersSection.style.display = 'none';
                            if (pestsContainer) pestsContainer.style.display = 'none';
                            if (paginationEl) paginationEl.style.display = 'none';
                        } else {
                            if (doctorContainer) doctorContainer.style.display = 'none';
                            if (filtersSection) filtersSection.style.display = '';
                            if (pestsContainer) pestsContainer.style.display = '';
                            if (paginationEl) paginationEl.style.display = '';
                            this.currentPage = 1;
                            this.loadData();
                        }
                    }
                });
            }
        },

        setupPlantDoctor() {
            const uploadZone = document.getElementById('doctor-upload-zone');
            const fileInput = document.getElementById('doctor-file-input');
            const previewContainer = document.getElementById('doctor-preview-container');
            const previewImg = document.getElementById('doctor-image-preview');
            const fileLabel = document.getElementById('doctor-file-label');
            const submitBtn = document.getElementById('doctor-submit-btn');
            const resultCard = document.getElementById('doctor-result-card');
            let selectedFile = null;

            if (uploadZone && fileInput) {
                uploadZone.addEventListener('click', (e) => {
                    if (e.target !== fileInput) fileInput.click();
                });

                fileInput.addEventListener('change', (e) => {
                    if (e.target.files && e.target.files[0]) {
                        selectedFile = e.target.files[0];
                        if (fileLabel) fileLabel.textContent = `📷 ${selectedFile.name} (${(selectedFile.size / 1024).toFixed(1)} KB)`;
                        if (previewImg && previewContainer) {
                            const reader = new FileReader();
                            reader.onload = (re) => {
                                previewImg.src = re.target.result;
                                previewContainer.style.display = 'block';
                            };
                            reader.readAsDataURL(selectedFile);
                        }
                    }
                });
            }

            if (submitBtn) {
                submitBtn.addEventListener('click', async () => {
                    if (!selectedFile) {
                        const lang = (window.I18n && window.I18n.getCurrentLanguage()) || 'en';
                        const cue = lang === 'mr' ? 'कृपया आधी पिकाच्या पानाचा फोटो निवडा किंवा काढा.' : (lang === 'hi' ? 'कृपया पहले फसल की पत्ती की तस्वीर चुनें या खींचें।' : 'Please choose or capture a plant photo first.');
                        if (window.Utils && window.Utils.showToast) {
                            window.Utils.showToast(cue, 'warning');
                        }
                        return;
                    }

                    const cropVal = document.getElementById('doctor-crop-select')?.value || '';
                    const symptomsVal = document.getElementById('doctor-symptoms-input')?.value.trim() || '';
                    const lang = (window.I18n && window.I18n.getCurrentLanguage()) || 'en';

                    const formData = new FormData();
                    formData.append('image', selectedFile);
                    if (cropVal) formData.append('crop', cropVal);
                    if (symptomsVal) formData.append('symptoms', symptomsVal);
                    formData.append('language', lang);

                    submitBtn.disabled = true;
                    submitBtn.innerHTML = `<span>⏳ ${lang === 'mr' ? 'रोग निदान सुरू आहे...' : (lang === 'hi' ? 'निदान हो रहा है...' : 'Diagnosing Plant Issue...')}</span>`;
                    if (resultCard) {
                        resultCard.style.display = 'block';
                        resultCard.innerHTML = `<div class="empty-state" style="padding:20px; text-align:center;"><p>🔬 ${lang === 'mr' ? 'कृत्रिम बुद्धिमत्ता (AI) पिकाच्या पानाचे विश्लेषण करत आहे...' : (lang === 'hi' ? 'AI फसल के नमूने का विश्लेषण कर रही है...' : 'AI Plant Doctor is analyzing leaf tissue...')}</p></div>`;
                    }

                    try {
                        const res = await (window.API.upload ? window.API.upload('/ai/analyze-crop', formData) : window.API.post('/ai/analyze-crop', formData));
                        const d = res.data?.data || res.data || res.analysis || {};
                        const isUnclear = Boolean(d.isUnclear || res.isUnclear);
                        const cropName = d.plantIdentified || cropVal || 'Crop Plant';
                        const problem = d.possibleProblem || res.diagnosis || 'Plant Condition';
                        const confidence = d.confidenceScore || 75;
                        const severity = d.severity || 'moderate';

                        const badgeColors = { low: '#10b981', moderate: '#f59e0b', high: '#ef4444', critical: '#b91c1c' };
                        const sevColor = badgeColors[severity] || '#f59e0b';

                        if (isUnclear) {
                            resultCard.innerHTML = `
                                <div style="background:#fffbeb; border:2px solid #fde68a; border-radius:10px; padding:18px;">
                                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                                        <h4 style="margin:0; color:#b45309; font-size:1.15rem;">⚠️ ${lang === 'mr' ? 'फोटो अस्पष्ट / अचूकता खात्री कमी' : (lang === 'hi' ? 'तस्वीर अस्पष्ट / आत्मविश्वास कम' : 'Image Unclear / Low Diagnosis Confidence')}</h4>
                                        <span class="badge" style="background:#fef3c7; color:#92400e; font-size:0.8rem; padding:4px 10px; border-radius:12px;">Confidence: ${confidence}%</span>
                                    </div>
                                    <p style="margin:0 0 10px 0; font-size:0.95rem; color:#78350f; font-weight:500;">${problem}</p>
                                    <div style="background:white; border-radius:8px; padding:12px; margin-bottom:14px; border:1px solid #fef3c7;">
                                        <strong style="color:#92400e;">${lang === 'mr' ? 'शेतकरी बंधूंसाठी सूचना:' : (lang === 'hi' ? 'किसान भाइयों के लिए सुझाव:' : 'Guidance for Accurate Diagnosis:')}</strong>
                                        <ul style="margin:6px 0 0 20px; padding:0; font-size:0.9rem; color:#451a03; line-height:1.6;">
                                          <li>${lang === 'mr' ? 'दिवसाच्या चांगल्या उजेडात पानाचा जवळून स्पष्ट फोटो काढा.' : (lang === 'hi' ? 'दिन के उजाले में पत्ती की पास से स्पष्ट तस्वीर लें।' : 'Capture a close-up photo in clear natural daylight.')}</li>
                                          <li>${lang === 'mr' ? 'बाधित झालेला भाग आणि जवळचा निरोगी भाग दोन्ही दिसावेत.' : (lang === 'hi' ? 'प्रभावित भाग और पास का स्वस्थ भाग दोनों दिखना चाहिए।' : 'Include both the affected lesion and adjacent healthy leaf area.')}</li>
                                          <li>${lang === 'mr' ? 'वरील यादीतून पिकाचे नाव निवडा आणि दिसणारी लक्षणे नोंदवा.' : (lang === 'hi' ? 'ऊपर से फसल का नाम चुनें और दिखने वाले लक्षण दर्ज करें।' : 'Select the crop name above and describe observed symptoms.')}</li>
                                        </ul>
                                    </div>
                                    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
                                        <span style="font-size:0.85rem; color:#92400e;">${lang === 'mr' ? 'शंका असल्यास कृषी तज्ज्ञांशी संपर्क साधा:' : (lang === 'hi' ? 'संदेह होने पर कृषि विशेषज्ञ से पूछें:' : 'Escalate to human specialist:')}</span>
                                        <a href="expert-dashboard.html" class="btn btn-outline-primary" style="text-decoration:none;">${lang === 'mr' ? 'कृषी तज्ज्ञांना विचारा 🎓' : (lang === 'hi' ? 'कृषि विशेषज्ञ से पूछें 🎓' : 'Ask Agricultural Expert 🎓')}</a>
                                    </div>
                                </div>
                            `;
                        } else {
                            const immediateHtml = Array.isArray(d.immediateActions) && d.immediateActions.length > 0
                                ? `<ol style="margin:6px 0 10px 20px; padding:0; font-size:0.92rem; color:#374151; line-height:1.6;">${d.immediateActions.map(a => `<li>${a}</li>`).join('')}</ol>`
                                : '';
                            const symptomsHtml = Array.isArray(d.symptomsDetected) && d.symptomsDetected.length > 0
                                ? `<p style="margin:0 0 10px 0; font-size:0.92rem; color:#4b5563;"><strong>🔍 ${lang === 'mr' ? 'दिसलेली लक्षणे:' : (lang === 'hi' ? 'दिखने वाले लक्षण:' : 'Symptoms Detected:')}</strong> ${d.symptomsDetected.join(', ')}</p>`
                                : '';
                            const prevHtml = Array.isArray(d.prevention) && d.prevention.length > 0
                                ? `<ul style="margin:4px 0 10px 20px; padding:0; font-size:0.9rem; color:#4b5563;">${d.prevention.map(p => `<li>${p}</li>`).join('')}</ul>`
                                : '';

                            resultCard.innerHTML = `
                                <div style="background:var(--surface, #ffffff); border:1px solid #10b981; border-radius:10px; padding:20px; box-shadow:0 4px 12px rgba(16,185,129,0.08);">
                                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; border-bottom:1px solid #f3f4f6; padding-bottom:10px;">
                                        <h4 style="margin:0; color:var(--primary-dark, #065f46); font-size:1.25rem;">🩺 ${lang === 'mr' ? 'पीक रोग निदान अहवाल' : (lang === 'hi' ? 'फसल रोग निदान रिपोर्ट' : 'AI Plant Doctor Diagnosis Report')}</h4>
                                        <span class="badge" style="background:${sevColor}; color:white; font-size:0.8rem; padding:4px 10px; border-radius:12px; text-transform:uppercase;">${severity} Severity</span>
                                    </div>

                                    <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:12px; margin-bottom:14px; background:#f9fafb; padding:12px; border-radius:8px;">
                                        <div><strong>🌱 ${lang === 'mr' ? 'पीक:' : (lang === 'hi' ? 'फसल:' : 'Crop Identified:')}</strong> ${cropName}</div>
                                        <div><strong>📊 ${lang === 'mr' ? 'खात्री टक्केवारी:' : (lang === 'hi' ? 'आत्मविश्वास:' : 'Confidence:')}</strong> ${confidence}%</div>
                                        <div><strong>🦠 ${lang === 'mr' ? 'प्रकार:' : (lang === 'hi' ? 'प्रकार:' : 'Type:')}</strong> ${d.problemType || 'Plant Disease'}</div>
                                    </div>

                                    <div style="background:#ecfdf5; border-left:4px solid #10b981; padding:10px 14px; border-radius:4px; margin-bottom:12px;">
                                        <strong style="color:#065f46; font-size:0.95rem;">⚠️ ${lang === 'mr' ? 'संभाव्य समस्या / रोग / कीड:' : (lang === 'hi' ? 'संभावित समस्या / रोग / कीट:' : 'Possible Problem Identified:')}</strong>
                                        <div style="font-size:1.15rem; font-weight:700; color:#047857; margin-top:2px;">${problem}</div>
                                        ${d.likelyCause ? `<div style="font-size:0.88rem; color:#065f46; margin-top:4px;"><em>${d.likelyCause}</em></div>` : ''}
                                    </div>

                                    ${symptomsHtml}
                                    ${immediateHtml ? `<div style="margin-bottom:12px;"><strong style="font-size:0.92rem; color:#1f2937;">⚡ ${lang === 'mr' ? 'शेतकऱ्याने तात्काळ काय करावे (What You Should Do Now):' : (lang === 'hi' ? 'तत्काल क्या करें (What You Should Do Now):' : 'What You Should Do Now:')}</strong>${immediateHtml}</div>` : ''}
                                    
                                    ${d.treatmentGuidance ? `
                                        <div style="background:#f0fdf4; border:1px solid #bbf7d0; padding:12px 14px; border-radius:8px; margin-bottom:12px; font-size:0.92rem; line-height:1.6; color:#166534;">
                                            <strong>🛡️ ${lang === 'mr' ? 'उपचार व नियंत्रण (Treatment Guidance):' : (lang === 'hi' ? 'उपचार एवं नियंत्रण (Treatment Guidance):' : 'Treatment & IPM Guidance:')}</strong>
                                            <div style="margin-top:4px;">${d.treatmentGuidance}</div>
                                        </div>
                                    ` : ''}

                                    ${d.plantCare ? `
                                        <div style="margin-bottom:12px; font-size:0.9rem; color:#374151; line-height:1.5;">
                                            <strong>🌿 ${lang === 'mr' ? 'पीक निगा व पाणी मार्गदर्शन:' : (lang === 'hi' ? 'पौधे की देखभाल व सिंचाई:' : 'Plant Care & Irrigation Guidance:')}</strong> ${d.plantCare} ${d.irrigationGuidance ? d.irrigationGuidance : ''}
                                        </div>
                                    ` : ''}

                                    ${prevHtml ? `
                                        <div style="margin-bottom:14px;">
                                            <strong style="font-size:0.9rem; color:#1f2937;">🛡️ ${lang === 'mr' ? 'भविष्यातील प्रतिबंधात्मक उपाय (Prevention):' : (lang === 'hi' ? 'रोकथाम के उपाय (Prevention):' : 'Preventive Measures:')}</strong>
                                            ${prevHtml}
                                        </div>
                                    ` : ''}

                                    <div style="border-top:1px solid #e5e7eb; padding-top:12px; margin-top:12px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
                                        <div style="font-size:0.8rem; color:#6b7280; max-width:65%;">
                                            ⚠️ ${lang === 'mr' ? 'रासायनिक फवारणी करण्यापूर्वी उत्पादनावरील लेबल वाचा. शंका असल्यास स्थानिक कृषी अधिकाऱ्यांशी चर्चा करा.' : (lang === 'hi' ? 'छिड़काव से पूर्व उत्पाद लेबल ध्यानपूर्वक पढ़ें। संदेह में स्थानीय कृषि अधिकारी से परामर्श लें।' : 'Always check pesticide label instructions and wear protective gear. Consult KVK agronomist.')}
                                        </div>
                                        <a href="expert-dashboard.html" class="btn btn-primary" style="text-decoration:none;">${lang === 'mr' ? 'कृषी तज्ज्ञांना विचारा 🎓' : (lang === 'hi' ? 'कृषि विशेषज्ञ से पूछें 🎓' : 'Ask Agricultural Expert 🎓')}</a>
                                    </div>
                                </div>
                            `;
                        }
                    } catch (err) {
                        const cleanErr = window.Utils && window.Utils.cleanErrorMessage ? window.Utils.cleanErrorMessage(err.message) : err.message;
                        resultCard.innerHTML = `<div class="empty-state" style="padding:20px; color:#ef4444;"><p>Diagnosis request failed: ${cleanErr}</p></div>`;
                    } finally {
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = `<span>Diagnose Plant Issue 🔍</span>`;
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
