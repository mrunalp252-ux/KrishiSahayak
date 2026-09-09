// js/pages/crops.js - AI Crop Recommendation Page Controller

(function() {
    'use strict';

    const CropsModule = {
        init() {
            this.setupForm();
        },

        setupForm() {
            const form = document.getElementById('recommendation-form');
            if (form) {
                form.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const formData = new FormData(form);
                    const data = Object.fromEntries(formData.entries());

                    if (data.temperature) {
                        data.temperature = Number(data.temperature);
                    }

                    const submitBtn = form.querySelector('button[type="submit"]');
                    const container = document.getElementById('recommendations-container');

                    try {
                        if (submitBtn) {
                            submitBtn.disabled = true;
                            submitBtn.textContent = 'Analyzing Soil & Weather...';
                        }
                        if (container) {
                            container.innerHTML = '<div class="empty-state text-center" style="padding:40px;"><p>🤖 AI Agronomy Engine is matching best crops for your field...</p></div>';
                        }

                        const result = await window.API.post('/recommendations', data);
                        const recs = result.recommendations || (result.data && result.data.recommendations) || result.data || [];
                        this.renderRecommendations(recs);
                    } catch (err) {
                        console.error('Recommendation error:', err);
                        if (container) {
                            container.innerHTML = `<div class="empty-state text-center" style="color:#ef4444; padding:40px;"><p>Failed to generate recommendations: ${err.message}</p></div>`;
                        }
                    } finally {
                        if (submitBtn) {
                            submitBtn.disabled = false;
                            submitBtn.textContent = 'Get Recommendations';
                        }
                    }
                });
            }
        },

        renderRecommendations(recs) {
            const container = document.getElementById('recommendations-container');
            if (!container) return;

            if (!recs || recs.length === 0) {
                container.innerHTML = `
                    <div class="empty-state text-center" style="padding:48px; color:#6b7280;">
                        <p style="font-size:1.1rem; margin-bottom:8px;">No suitable crops matched your specific parameters.</p>
                        <small>Try selecting a different soil type or season.</small>
                    </div>
                `;
                return;
            }

            let html = '<div style="display:flex; flex-direction:column; gap:16px;">';
            recs.forEach((rec, idx) => {
                const name = rec.cropName || rec.name || (rec.crop && rec.crop.cropName) || `Crop #${idx + 1}`;
                const score = Math.round(rec.score || 0);
                const duration = rec.expectedDuration || (rec.duration ? `${rec.duration} days` : '100-120 days');
                const water = rec.waterRequirement || 'Medium';
                const reasons = rec.reasons || [];
                const considerations = rec.considerations || [];

                const scoreColor = score >= 80 ? '#10b981' : (score >= 60 ? '#3b82f6' : '#f59e0b');

                html += `
                    <div class="card" style="border-left: 4px solid ${scoreColor}; padding:18px;">
                        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px;">
                            <div>
                                <h3 style="margin:0; font-size:1.3rem; color:var(--text-color, #1f2937);">🌾 ${name}</h3>
                                <span style="font-size:0.85rem; color:#6b7280;">Water: <strong>${window.Utils.formatLabel(water)}</strong> &bull; Cycle: <strong>${duration}</strong></span>
                            </div>
                            <div style="text-align:right;">
                                <div style="font-size:1.5rem; font-weight:800; color:${scoreColor};">${score}%</div>
                                <span style="font-size:0.75rem; color:#6b7280;">Match Score</span>
                            </div>
                        </div>

                        <!-- Progress Bar -->
                        <div style="background:#e5e7eb; height:8px; border-radius:4px; overflow:hidden; margin-bottom:14px;">
                            <div style="background:${scoreColor}; width:${score}%; height:100%; border-radius:4px;"></div>
                        </div>

                        ${reasons.length ? `
                            <div style="margin-bottom:10px;">
                                <strong style="font-size:0.85rem; color:#059669;">✅ Why this crop fits:</strong>
                                <ul style="margin:4px 0 0 16px; padding:0; font-size:0.88rem; color:#374151; line-height:1.4;">
                                    ${reasons.map(r => `<li>${r}</li>`).join('')}
                                </ul>
                            </div>
                        ` : ''}

                        ${considerations.length ? `
                            <div style="margin-bottom:12px;">
                                <strong style="font-size:0.85rem; color:#d97706;">⚠️ Key Considerations:</strong>
                                <ul style="margin:4px 0 0 16px; padding:0; font-size:0.88rem; color:#4b5563; line-height:1.4;">
                                    ${considerations.map(c => `<li>${c}</li>`).join('')}
                                </ul>
                            </div>
                        ` : ''}

                        <div style="text-align:right; margin-top:8px;">
                            <a href="cultivation-guides.html" class="btn btn-sm btn-outline-primary" style="text-decoration:none;">View Cultivation Guide 📖</a>
                        </div>
                    </div>
                `;
            });
            html += '</div>';
            container.innerHTML = html;
        }
    };

    window.PageModules = window.PageModules || {};
    window.PageModules.crops = CropsModule;
    window.PageModules['crop-recommendation'] = CropsModule;

})();
