// js/pages/planner.js - Farm Activity Planner Page Controller

(function() {
    'use strict';

    const PlannerModule = {
        currentPage: 1,
        limit: 12,
        totalPages: 1,
        farms: [],

        async init() {
            await this.loadFarms();
            this.setupEventListeners();
            await this.loadActivities();
            await this.loadExpenseStats();
        },

        async loadExpenseStats() {
            try {
                const [expRes, upRes] = await Promise.all([
                    window.API.get('/planner/expense-summary').catch(() => null),
                    window.API.get('/planner/upcoming?days=14').catch(() => null)
                ]);

                if (expRes && expRes.data) {
                    const d = expRes.data;
                    const elTotal = document.getElementById('stat-total-expense');
                    const elLabour = document.getElementById('stat-labour-expense');
                    const elInputs = document.getElementById('stat-inputs-expense');
                    if (elTotal) elTotal.textContent = `₹${(d.grandTotalCost || 0).toLocaleString('en-IN')}`;
                    if (elLabour) elLabour.textContent = `₹${(d.totalLabourCost || 0).toLocaleString('en-IN')}`;
                    if (elInputs) elInputs.textContent = `₹${((d.totalSeedCost || 0) + (d.totalFertilizerCost || 0) + (d.totalSprayCost || 0)).toLocaleString('en-IN')}`;
                }

                if (upRes && upRes.data) {
                    const elUp = document.getElementById('stat-upcoming-count');
                    if (elUp) elUp.textContent = upRes.data.length || 0;
                }
            } catch (err) {
                console.warn('Could not load planner expense stats:', err);
            }
        },

        async loadFarms() {
            try {
                const res = await window.API.get('/farms');
                this.farms = res.farms || res.data || [];
                const selector = document.getElementById('planner-farm-filter');
                if (selector && this.farms.length > 0) {
                    let html = '<option value="">All Farms</option>';
                    this.farms.forEach(f => {
                        const name = f.farmName || f.name || 'Unnamed Farm';
                        html += `<option value="${f._id}">${name}</option>`;
                    });
                    selector.innerHTML = html;
                }
            } catch (err) {
                console.warn('Could not load farms for planner:', err);
            }
        },

        setupEventListeners() {
            const filterBtn = document.getElementById('planner-filter-btn');
            const farmFilter = document.getElementById('planner-farm-filter');
            const statusFilter = document.getElementById('planner-status-filter');
            const typeFilter = document.getElementById('planner-type-filter');
            const addBtn = document.getElementById('add-activity-btn');
            const genBtn = document.getElementById('generate-plan-btn');

            const applyFilter = () => {
                this.currentPage = 1;
                this.loadActivities();
            };

            if (filterBtn) filterBtn.addEventListener('click', applyFilter);
            if (farmFilter) farmFilter.addEventListener('change', applyFilter);
            if (statusFilter) statusFilter.addEventListener('change', applyFilter);
            if (typeFilter) typeFilter.addEventListener('change', applyFilter);

            if (addBtn) addBtn.addEventListener('click', () => this.openAddModal());
            if (genBtn) genBtn.addEventListener('click', () => this.openGeneratePlanModal());
        },

        async loadActivities() {
            const farm = document.getElementById('planner-farm-filter')?.value || '';
            const status = document.getElementById('planner-status-filter')?.value || '';
            const type = document.getElementById('planner-type-filter')?.value || '';
            const container = document.getElementById('activities-container');

            if (container) {
                container.innerHTML = '<div class="empty-state" style="text-align:center; padding:40px;"><p>Loading farm activities...</p></div>';
            }

            try {
                let url = `/planner?page=${this.currentPage}&limit=${this.limit}`;
                if (farm) url += `&farm=${encodeURIComponent(farm)}`;
                if (status) url += `&status=${encodeURIComponent(status)}`;
                if (type) url += `&type=${encodeURIComponent(type)}`;

                const res = await window.API.get(url);
                const activities = res.activities || res.data || [];
                const pagination = res.pagination || {
                    page: this.currentPage,
                    limit: this.limit,
                    total: activities.length,
                    totalPages: Math.ceil(activities.length / this.limit) || 1
                };

                this.totalPages = pagination.totalPages || 1;
                this.renderActivities(activities);
                this.renderPagination(pagination);
            } catch (err) {
                console.error('Error loading activities:', err);
                if (container) {
                    container.innerHTML = `<div class="empty-state" style="color:#ef4444; text-align:center; padding:40px;"><p>Failed to load activities: ${err.message}</p></div>`;
                }
            }
        },

        renderActivities(activities) {
            const container = document.getElementById('activities-container');
            if (!container) return;

            if (!activities || activities.length === 0) {
                container.innerHTML = `
                    <div class="card" style="text-align:center; padding:48px; color:#6b7280;">
                        <p style="font-size:1.2rem; margin-bottom:12px;">📅 No activities scheduled yet.</p>
                        <p style="margin-bottom:20px; font-size:0.95rem;">You can add a custom farm task or auto-generate a complete crop cycle plan.</p>
                        <div style="display:flex; justify-content:center; gap:12px;">
                            <button class="btn btn-secondary" onclick="window.PageModules.planner.openGeneratePlanModal()">Auto-Generate Plan</button>
                            <button class="btn btn-primary" onclick="window.PageModules.planner.openAddModal()">➕ Add Activity</button>
                        </div>
                    </div>
                `;
                return;
            }

            let html = '<div class="grid-3" style="gap: 16px;">';
            activities.forEach(act => {
                const title = act.title || act.activityName || 'Farm Task';
                const type = (act.type || act.activityType || 'General').replace(/_/g, ' ');
                const status = act.status || 'pending';
                const date = act.scheduledDate ? (window.Utils ? window.Utils.formatDate(act.scheduledDate) : new Date(act.scheduledDate).toLocaleDateString()) : 'Unscheduled';
                const farmName = (act.farm && act.farm.farmName) || (this.farms.find(f => f._id === act.farm)?.farmName) || 'Farm Task';
                const description = act.description || act.notes || '';

                const tCompleted = (window.I18n && window.I18n.t('completed')) || 'Completed';
                const tInProgress = (window.I18n && window.I18n.t('in_progress')) || 'In Progress';
                const tPending = (window.I18n && window.I18n.t('pending')) || 'Pending';
                const tDone = (window.I18n && window.I18n.t('complete')) || 'Done';

                const statusBadge = status === 'completed' 
                    ? `<span class="badge badge-success">${tCompleted}</span>`
                    : (status === 'in_progress' ? `<span class="badge badge-warning">${tInProgress}</span>` : `<span class="badge badge-info">${tPending}</span>`);

                const expTotal = (act.expenses && act.expenses.totalCost) ? act.expenses.totalCost : 0;
                const expBadge = expTotal > 0 ? `<span class="badge" style="background:#ecfdf5; color:#065f46; border:1px solid #a7f3d0; font-size:0.75rem; font-weight:600;">💰 ₹${expTotal.toLocaleString('en-IN')}</span>` : '';
                const fertBadge = (act.fertilizerUsed && act.fertilizerUsed.fertilizerName) ? `<span class="badge" style="background:#f0fdf4; color:#15803d; border:1px solid #bbf7d0; font-size:0.75rem;">🌱 ${act.fertilizerUsed.fertilizerName}</span>` : '';
                const sprayBadge = (act.sprayTreatment && act.sprayTreatment.chemicalName) ? `<span class="badge" style="background:#fffbeb; color:#b45309; border:1px solid #fde68a; font-size:0.75rem;">🧪 ${act.sprayTreatment.chemicalName}</span>` : '';

                html += `
                    <div class="card" style="display:flex; flex-direction:column; justify-content:space-between; border-left: 4px solid ${status === 'completed' ? '#10b981' : '#3b82f6'};">
                        <div>
                            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px;">
                                <h3 style="margin:0; font-size:1.15rem; color:var(--text-color, #1f2937);">${title}</h3>
                                ${statusBadge}
                            </div>
                            <div style="font-size:0.85rem; color:#6b7280; margin-bottom:8px;">
                                <span>🏷️ ${window.Utils.formatLabel(type)}</span> &bull; <span>🌾 ${farmName}</span>
                            </div>
                            <div style="font-size:0.85rem; color:#4b5563; margin-bottom:10px;">
                                📅 <strong>Scheduled:</strong> ${date}
                            </div>
                            ${(expBadge || fertBadge || sprayBadge) ? `<div style="display:flex; flex-wrap:wrap; gap:6px; margin-bottom:10px;">${expBadge}${fertBadge}${sprayBadge}</div>` : ''}
                            ${description ? `<p style="font-size:0.9rem; color:#4b5563; line-height:1.4; margin-bottom:14px;">${description}</p>` : ''}
                        </div>

                        <div style="display:flex; justify-content:space-between; align-items:center; pt-2; border-top:1px solid #f3f4f6;">
                            <div>
                                ${status !== 'completed' ? `
                                    <button class="btn btn-sm btn-outline-success" onclick="window.PageModules.planner.markComplete('${act._id}')">✓ ${tDone}</button>
                                ` : `<span style="color:#10b981; font-size:0.85rem;">✓ ${tCompleted}</span>`}
                            </div>
                            <div style="display:flex; gap:6px;">
                                <button class="btn btn-sm btn-outline-danger" onclick="window.PageModules.planner.deleteActivity('${act._id}')">🗑️</button>
                            </div>
                        </div>
                    </div>
                `;
            });
            html += '</div>';
            container.innerHTML = html;
        },

        renderPagination(pagination) {
            const container = document.getElementById('activities-pagination');
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
                        <button class="btn btn-sm ${current === 1 ? 'btn-disabled' : 'btn-outline-primary'}" id="planner-prev" ${current === 1 ? 'disabled' : ''}>◀ Prev</button>
                        <button class="btn btn-sm ${current === totalPages ? 'btn-disabled' : 'btn-outline-primary'}" id="planner-next" ${current === totalPages ? 'disabled' : ''}>Next ▶</button>
                    </div>
                </div>
            `;

            const prev = document.getElementById('planner-prev');
            const next = document.getElementById('planner-next');
            if (prev) {
                prev.onclick = () => {
                    if (this.currentPage > 1) {
                        this.currentPage--;
                        this.loadActivities();
                    }
                };
            }
            if (next) {
                next.onclick = () => {
                    if (this.currentPage < totalPages) {
                        this.currentPage++;
                        this.loadActivities();
                    }
                };
            }
        },

        openAddModal() {
            let farmOptions = this.farms.map(f => `<option value="${f._id}">${f.farmName || f.name}</option>`).join('');
            if (!farmOptions) farmOptions = '<option value="">No farms available (Register a farm first)</option>';

            const modalHtml = `
                <div style="min-width:320px; max-width:480px; width:100%;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
                        <h3 style="margin:0;">➕ Add Farm Activity</h3>
                        <button class="close-modal" style="background:none; border:none; font-size:1.5rem; cursor:pointer;">&times;</button>
                    </div>
                    <form id="add-activity-form">
                        <div class="form-group mb-3">
                            <label class="form-label">Farm <span style="color:red">*</span></label>
                            <select class="form-control" name="farm" required>
                                ${farmOptions}
                            </select>
                        </div>
                        <div class="form-group mb-3">
                            <label class="form-label">Activity Title <span style="color:red">*</span></label>
                            <input type="text" class="form-control" name="title" placeholder="e.g. Sowing hybrid seeds" required>
                        </div>
                        <div class="form-group mb-3">
                            <label class="form-label">Activity Type <span style="color:red">*</span></label>
                            <select class="form-control" name="type" required>
                                <option value="land_preparation">Land Preparation</option>
                                <option value="sowing">Sowing</option>
                                <option value="irrigation">Irrigation</option>
                                <option value="fertilizing">Fertilizing</option>
                                <option value="weeding">Weeding</option>
                                <option value="pest_monitoring">Pest Monitoring</option>
                                <option value="harvesting">Harvesting</option>
                                <option value="post_harvest">Post Harvest</option>
                            </select>
                        </div>
                        <div class="form-group mb-3">
                            <label class="form-label">Scheduled Date <span style="color:red">*</span></label>
                            <input type="date" class="form-control" name="scheduledDate" required value="${new Date().toISOString().split('T')[0]}">
                        </div>
                        <div class="form-group mb-3">
                            <label class="form-label">Description / Instructions</label>
                            <textarea class="form-control" name="description" rows="2" placeholder="Notes, instructions or observations..."></textarea>
                        </div>

                        <details style="margin-bottom:16px; background:rgba(16,185,129,0.05); border:1px solid rgba(16,185,129,0.2); border-radius:6px; padding:10px 12px;">
                            <summary style="font-size:0.88rem; font-weight:600; cursor:pointer; color:#065f46;">💰 Farm Diary & Expenses (Optional)</summary>
                            <div style="margin-top:10px; display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                                <div>
                                    <label class="form-label" style="font-size:0.8rem;">Seed Cost (₹)</label>
                                    <input type="number" class="form-control" name="seedCost" min="0" placeholder="0">
                                </div>
                                <div>
                                    <label class="form-label" style="font-size:0.8rem;">Fertilizer Cost (₹)</label>
                                    <input type="number" class="form-control" name="fertilizerCost" min="0" placeholder="0">
                                </div>
                                <div>
                                    <label class="form-label" style="font-size:0.8rem;">Spray / Chemical Cost (₹)</label>
                                    <input type="number" class="form-control" name="sprayCost" min="0" placeholder="0">
                                </div>
                                <div>
                                    <label class="form-label" style="font-size:0.8rem;">Labour Cost (₹)</label>
                                    <input type="number" class="form-control" name="labourCost" min="0" placeholder="0">
                                </div>
                            </div>
                            <div style="margin-top:10px;">
                                <label class="form-label" style="font-size:0.8rem;">Input / Chemical Details (e.g. Urea 50kg, Neem oil)</label>
                                <input type="text" class="form-control" name="inputDetails" placeholder="Name & dosage used">
                            </div>
                        </details>

                        <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:20px;">
                            <button type="button" class="btn btn-outline-secondary close-modal">Cancel</button>
                            <button type="submit" class="btn btn-primary" id="save-activity-btn">Save Activity</button>
                        </div>
                    </form>
                </div>
            `;

            window.Utils.showModal(modalHtml, {
                onLoad: (modal, close) => {
                    const form = modal.querySelector('#add-activity-form');
                    form.addEventListener('submit', async (e) => {
                        e.preventDefault();
                        const formData = new FormData(form);
                        const seedCost = Number(formData.get('seedCost')) || 0;
                        const fertilizerCost = Number(formData.get('fertilizerCost')) || 0;
                        const sprayCost = Number(formData.get('sprayCost')) || 0;
                        const labourCost = Number(formData.get('labourCost')) || 0;
                        const inputDetails = formData.get('inputDetails') || '';

                        const payload = {
                            farm: formData.get('farm'),
                            title: formData.get('title'),
                            type: formData.get('type'),
                            scheduledDate: formData.get('scheduledDate'),
                            description: formData.get('description'),
                            status: 'pending'
                        };

                        if (seedCost > 0 || fertilizerCost > 0 || sprayCost > 0 || labourCost > 0) {
                            payload.expenses = {
                                seedCost,
                                fertilizerCost,
                                sprayCost,
                                labourCost,
                                totalCost: seedCost + fertilizerCost + sprayCost + labourCost
                            };
                        }

                        if (inputDetails) {
                            if (payload.type === 'fertilizing') {
                                payload.fertilizerUsed = { fertilizerName: inputDetails };
                            } else if (payload.type === 'pest_monitoring' || payload.type === 'disease_monitoring') {
                                payload.sprayTreatment = { chemicalName: inputDetails };
                            }
                        }

                        try {
                            const btn = modal.querySelector('#save-activity-btn');
                            btn.disabled = true;
                            btn.textContent = 'Saving...';

                            await window.API.post('/planner', payload);
                            window.Utils.showToast('Activity & Diary logged successfully!', 'success');
                            close(true);
                            this.loadActivities();
                            this.loadExpenseStats();
                        } catch (err) {
                            window.Utils.showToast(`Error: ${err.message}`, 'error');
                            const btn = modal.querySelector('#save-activity-btn');
                            btn.disabled = false;
                            btn.textContent = 'Save Activity';
                        }
                    });
                }
            });
        },

        openGeneratePlanModal() {
            let farmOptions = this.farms.map(f => `<option value="${f._id}">${f.farmName || f.name} (${f.currentCrop || 'No crop assigned'})</option>`).join('');
            if (!farmOptions) {
                window.Utils.showToast('Please add a farm under "My Farms" before generating a plan.', 'warning');
                return;
            }

            const modalHtml = `
                <div style="min-width:320px; max-width:480px; width:100%;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
                        <h3 style="margin:0;">⚡ Auto-Generate Activity Plan</h3>
                        <button class="close-modal" style="background:none; border:none; font-size:1.5rem; cursor:pointer;">&times;</button>
                    </div>
                    <p style="font-size:0.9rem; color:#4b5563; margin-bottom:16px;">
                        Select your farm and crop to automatically generate a full cultivation timeline from land preparation to harvest.
                    </p>
                    <form id="generate-plan-form">
                        <div class="form-group mb-3">
                            <label class="form-label">Select Farm <span style="color:red">*</span></label>
                            <select class="form-control" name="farmId" required>
                                ${farmOptions}
                            </select>
                        </div>
                        <div class="form-group mb-3">
                            <label class="form-label">Crop Name <span style="color:red">*</span></label>
                            <input type="text" class="form-control" name="crop" placeholder="e.g. Cotton, Soybean, Wheat, Rice" required>
                        </div>
                        <div class="form-group mb-3">
                            <label class="form-label">Target Sowing Date <span style="color:red">*</span></label>
                            <input type="date" class="form-control" name="sowingDate" required value="${new Date().toISOString().split('T')[0]}">
                        </div>
                        <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:20px;">
                            <button type="button" class="btn btn-outline-secondary close-modal">Cancel</button>
                            <button type="submit" class="btn btn-primary" id="start-gen-btn">Generate Plan</button>
                        </div>
                    </form>
                </div>
            `;

            window.Utils.showModal(modalHtml, {
                onLoad: (modal, close) => {
                    const form = modal.querySelector('#generate-plan-form');
                    form.addEventListener('submit', async (e) => {
                        e.preventDefault();
                        const formData = new FormData(form);
                        const payload = {
                            farmId: formData.get('farmId'),
                            crop: formData.get('crop'),
                            sowingDate: formData.get('sowingDate')
                        };

                        try {
                            const btn = modal.querySelector('#start-gen-btn');
                            btn.disabled = true;
                            btn.textContent = 'Generating Plan...';

                            await window.API.post('/planner/generate-plan', payload);
                            window.Utils.showToast('Activity cycle generated successfully!', 'success');
                            close(true);
                            this.loadActivities();
                        } catch (err) {
                            window.Utils.showToast(`Error: ${err.message}`, 'error');
                            const btn = modal.querySelector('#start-gen-btn');
                            btn.disabled = false;
                            btn.textContent = 'Generate Plan';
                        }
                    });
                }
            });
        },

        async markComplete(id) {
            try {
                await window.API.put(`/planner/${id}/complete`, { status: 'completed' });
                window.Utils.showToast('Activity marked as completed! 🎉', 'success');
                this.loadActivities();
            } catch (err) {
                window.Utils.showToast(`Error: ${err.message}`, 'error');
            }
        },

        async deleteActivity(id) {
            const confirmed = await window.Utils.confirmDialog('Are you sure you want to delete this activity?');
            if (!confirmed) return;

            try {
                await window.API.delete(`/planner/${id}`);
                window.Utils.showToast('Activity deleted', 'success');
                this.loadActivities();
            } catch (err) {
                window.Utils.showToast(`Error deleting activity: ${err.message}`, 'error');
            }
        }
    };

    window.PageModules = window.PageModules || {};
    window.PageModules.planner = PlannerModule;
    window.PageModules['farm-planner'] = PlannerModule;

})();
