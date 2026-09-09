// js/pages/expert.js - Expert Agronomist Dashboard Controller

(function() {
    'use strict';

    const ExpertModule = {
        currentPage: 1,
        limit: 10,
        totalPages: 1,

        async init() {
            const user = window.Auth ? window.Auth.getUser() : null;
            if (!user || !['expert', 'admin'].includes(user.role)) {
                window.location.href = 'dashboard.html';
                return;
            }

            this.setupEventListeners();
            await this.loadQueries();
        },

        setupEventListeners() {
            const publishBtn = document.getElementById('publish-guidance-btn');
            if (publishBtn) {
                publishBtn.addEventListener('click', () => this.openPublishGuidanceModal());
            }
        },

        async loadQueries() {
            const container = document.getElementById('expert-queries-container') || document.getElementById('expert-queries-list');
            if (container) {
                container.innerHTML = '<div class="empty-state" style="text-align:center; padding:40px;"><p>Loading farmer queries...</p></div>';
            }

            try {
                const res = await window.API.get(`/expert/queries?page=${this.currentPage}&limit=${this.limit}`);
                const queries = res.queries || res.data || [];
                const pagination = res.pagination || {
                    page: this.currentPage,
                    limit: this.limit,
                    total: queries.length,
                    totalPages: Math.ceil(queries.length / this.limit) || 1
                };

                this.totalPages = pagination.totalPages || 1;
                this.renderQueries(queries);
                this.renderPagination(pagination);
            } catch (err) {
                console.error('Error loading expert queries:', err);
                if (container) {
                    container.innerHTML = `<div class="empty-state" style="color:#ef4444; text-align:center; padding:40px;"><p>Failed to load queries: ${err.message}</p></div>`;
                }
            }
        },

        renderQueries(queries) {
            const container = document.getElementById('expert-queries-container') || document.getElementById('expert-queries-list');
            if (!container) return;

            if (!queries || queries.length === 0) {
                container.innerHTML = `
                    <div class="text-center" style="padding:48px; color:#6b7280;">
                        <p style="font-size:1.15rem; margin-bottom:8px;">🎓 No pending farmer queries.</p>
                        <small>When farmers ask advisory questions, they will appear here for expert review.</small>
                    </div>
                `;
                return;
            }

            let html = '<div style="display:flex; flex-direction:column; gap:16px;">';
            queries.forEach(q => {
                const farmer = q.farmerName || (q.farmer && q.farmer.name) || 'Farmer';
                const location = q.location || (q.farmer && q.farmer.district) || 'Local Region';
                const question = q.question || q.message || q.query || 'No question description provided.';
                const crop = q.crop ? `<span class="badge badge-info">${q.crop}</span>` : '';
                const isAnswered = q.status === 'answered' || !!q.response;

                html += `
                    <div class="card" style="border-left:4px solid ${isAnswered ? '#10b981' : '#f59e0b'}; padding:16px;">
                        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px;">
                            <div>
                                <strong style="font-size:1.05rem; color:var(--text-color, #1f2937);">🧑‍🌾 ${farmer}</strong>
                                <span style="font-size:0.85rem; color:#6b7280; margin-left:6px;">(${location})</span>
                            </div>
                            <div>
                                ${crop}
                                <span class="badge badge-${isAnswered ? 'success' : 'warning'}" style="margin-left:6px;">${isAnswered ? 'Answered' : 'Pending Review'}</span>
                            </div>
                        </div>

                        <p style="font-size:0.95rem; color:var(--text-color, #374151); line-height:1.5; margin-bottom:12px; background:var(--bg-secondary, #f9fafb); padding:10px; border-radius:6px;">
                            ${question}
                        </p>

                        ${q.response ? `
                            <div style="background:rgba(16, 185, 129, 0.08); padding:10px; border-radius:6px; margin-bottom:12px; font-size:0.9rem;">
                                <strong style="color:#059669;">Your Advice:</strong> ${q.response}
                            </div>
                        ` : ''}

                        <div style="text-align:right;">
                            <button class="btn btn-sm btn-primary" onclick="window.PageModules.expert.respondToQuery('${q._id}')">
                                ${isAnswered ? '✏️ Edit Advice' : '💬 Send Advisory Response'}
                            </button>
                        </div>
                    </div>
                `;
            });
            html += '</div>';
            container.innerHTML = html;
        },

        renderPagination(pagination) {
            const container = document.getElementById('expert-queries-pagination');
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
                        <button class="btn btn-sm ${current === 1 ? 'btn-disabled' : 'btn-outline-primary'}" id="expert-prev" ${current === 1 ? 'disabled' : ''}>◀ Prev</button>
                        <button class="btn btn-sm ${current === totalPages ? 'btn-disabled' : 'btn-outline-primary'}" id="expert-next" ${current === totalPages ? 'disabled' : ''}>Next ▶</button>
                    </div>
                </div>
            `;

            const prev = document.getElementById('expert-prev');
            const next = document.getElementById('expert-next');
            if (prev) {
                prev.onclick = () => {
                    if (this.currentPage > 1) {
                        this.currentPage--;
                        this.loadQueries();
                    }
                };
            }
            if (next) {
                next.onclick = () => {
                    if (this.currentPage < totalPages) {
                        this.currentPage++;
                        this.loadQueries();
                    }
                };
            }
        },

        respondToQuery(id) {
            const html = `
                <div style="min-width:320px; max-width:500px; width:100%;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
                        <h3 style="margin:0;">💬 Agronomist Response</h3>
                        <button class="close-modal" style="background:none; border:none; font-size:1.5rem; cursor:pointer;">&times;</button>
                    </div>
                    <form id="respond-form">
                        <div class="form-group mb-3">
                            <label class="form-label">Expert Advisory Solution <span style="color:red">*</span></label>
                            <textarea class="form-control" name="answer" rows="5" required placeholder="Provide clear agronomic advice, fertilizer dosages, or disease treatments..."></textarea>
                        </div>
                        <div style="display:flex; justify-content:flex-end; gap:10px;">
                            <button type="button" class="btn btn-outline-secondary close-modal">Cancel</button>
                            <button type="submit" class="btn btn-primary" id="expert-submit-btn">Send Advice to Farmer</button>
                        </div>
                    </form>
                </div>
            `;

            window.Utils.showModal(html, {
                onLoad: (modal, close) => {
                    const form = modal.querySelector('#respond-form');
                    form.addEventListener('submit', async (e) => {
                        e.preventDefault();
                        const answer = form.answer.value.trim();
                        if (!answer) return;

                        const btn = modal.querySelector('#expert-submit-btn');
                        btn.disabled = true;
                        btn.textContent = 'Sending...';

                        try {
                            await window.API.post(`/expert/queries/${id}/respond`, { answer });
                            window.Utils.showToast('Response delivered to farmer successfully! 🌾', 'success');
                            close(true);
                            this.loadQueries();
                        } catch (err) {
                            window.Utils.showToast(`Failed to send response: ${err.message}`, 'error');
                            btn.disabled = false;
                            btn.textContent = 'Send Advice to Farmer';
                        }
                    });
                }
            });
        },

        openPublishGuidanceModal() {
            const html = `
                <div style="min-width:320px; max-width:520px; width:100%;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
                        <h3 style="margin:0;">📢 Broadcast Agromet Advisory</h3>
                        <button class="close-modal" style="background:none; border:none; font-size:1.5rem; cursor:pointer;">&times;</button>
                    </div>
                    <form id="publish-advisory-form">
                        <div class="form-group mb-3">
                            <label class="form-label">Advisory Headline <span style="color:red">*</span></label>
                            <input type="text" class="form-control" name="title" placeholder="e.g. Warning: Sudden Temperature Rise in Central MH" required>
                        </div>
                        <div class="form-group mb-3">
                            <label class="form-label">Severity Level <span style="color:red">*</span></label>
                            <select class="form-control" name="severity" required>
                                <option value="info">Information (Blue)</option>
                                <option value="warning" selected>Warning (Orange)</option>
                                <option value="critical">Critical Urgent (Red)</option>
                            </select>
                        </div>
                        <div class="form-group mb-3">
                            <label class="form-label">Target Region / State</label>
                            <input type="text" class="form-control" name="targetState" placeholder="e.g. Maharashtra (leave blank for all)">
                        </div>
                        <div class="form-group mb-3">
                            <label class="form-label">Detailed Actionable Guidance <span style="color:red">*</span></label>
                            <textarea class="form-control" name="message" rows="4" placeholder="Advise farmers on protective measures, irrigation adjustments, or prophylactic sprays..." required></textarea>
                        </div>
                        <div style="display:flex; justify-content:flex-end; gap:10px;">
                            <button type="button" class="btn btn-outline-secondary close-modal">Cancel</button>
                            <button type="submit" class="btn btn-primary" id="publish-save-btn">Broadcast Advisory</button>
                        </div>
                    </form>
                </div>
            `;

            window.Utils.showModal(html, {
                onLoad: (modal, close) => {
                    const form = modal.querySelector('#publish-advisory-form');
                    form.addEventListener('submit', async (e) => {
                        e.preventDefault();
                        const formData = new FormData(form);
                        const payload = {
                            title: formData.get('title'),
                            severity: formData.get('severity'),
                            targetState: formData.get('targetState') || 'All India',
                            message: formData.get('message'),
                            isActive: true
                        };

                        const btn = modal.querySelector('#publish-save-btn');
                        btn.disabled = true;
                        btn.textContent = 'Broadcasting...';

                        try {
                            await window.API.post('/advisories', payload);
                            window.Utils.showToast('Advisory broadcast to farmers across region! 📢', 'success');
                            close(true);
                        } catch (err) {
                            window.Utils.showToast(`Error publishing advisory: ${err.message}`, 'error');
                            btn.disabled = false;
                            btn.textContent = 'Broadcast Advisory';
                        }
                    });
                }
            });
        }
    };

    window.PageModules = window.PageModules || {};
    window.PageModules.expert = ExpertModule;
    window.PageModules['expert-dashboard'] = ExpertModule;

})();
