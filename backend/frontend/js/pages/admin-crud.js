// js/pages/admin-crud.js - Comprehensive CRUD Data Management for Administrators

(function() {
    'use strict';

    let currentTab = 'users';
    let currentPage = 1;
    let currentSearch = '';
    let currentLimit = 10;
    let currentData = [];

    const TAB_CONFIGS = {
        users: {
            title: 'Users',
            endpoint: '/users',
            idField: '_id',
            columns: [
                { label: 'Name', key: 'name' },
                { label: 'Email', key: 'email' },
                { label: 'Role', key: 'role', render: r => `<span class="badge badge-${r.role === 'admin' ? 'danger' : r.role === 'expert' ? 'primary' : 'success'}">${window.Utils.formatLabel(r.role)}</span>` },
                { label: 'Verified', key: 'isVerified', render: r => r.isVerified ? '✅ Yes' : '❌ No' },
                { label: 'Status', key: 'isActive', render: r => r.isActive !== false ? '<span class="badge badge-success">Active</span>' : '<span class="badge badge-warning">Inactive</span>' },
                { label: 'Actions', actions: ['edit', 'delete'] }
            ],
            fields: [
                { name: 'name', label: 'Full Name', type: 'text', required: true },
                { name: 'email', label: 'Email Address', type: 'email', required: true },
                { name: 'phone', label: 'Phone Number', type: 'tel' },
                { name: 'role', label: 'Role', type: 'select', options: ['farmer', 'expert', 'admin'], required: true },
                { name: 'isVerified', label: 'Verified', type: 'checkbox' },
                { name: 'isActive', label: 'Active', type: 'checkbox', default: true }
            ]
        },
        crops: {
            title: 'Crops',
            endpoint: '/crops',
            idField: '_id',
            columns: [
                { label: 'Crop Name', key: 'cropName', render: r => `<strong>${r.cropName || r.name}</strong>` },
                { label: 'Scientific Name', key: 'scientificName' },
                { label: 'Category', key: 'category', render: r => `<span class="badge badge-info">${window.Utils.formatLabel(r.category) || 'N/A'}</span>` },
                { label: 'Duration (Days)', key: 'duration' },
                { label: 'Seasons', key: 'suitableSeasons', render: r => Array.isArray(r.suitableSeasons) ? r.suitableSeasons.join(', ') : (r.suitableSeasons || 'N/A') },
                { label: 'Actions', actions: ['edit', 'delete'] }
            ],
            fields: [
                { name: 'cropName', label: 'Crop Name', type: 'text', required: true },
                { name: 'scientificName', label: 'Scientific Name', type: 'text' },
                { name: 'category', label: 'Category', type: 'select', options: ['cereals', 'pulses', 'vegetables', 'fruits', 'oilseeds', 'commercial', 'other'], required: true },
                { name: 'suitableSeasons', label: 'Seasons (comma separated)', type: 'text', hint: 'kharif, rabi, zaid' },
                { name: 'duration', label: 'Duration (Days)', type: 'number', required: true },
                { name: 'waterRequirement', label: 'Water Requirement', type: 'select', options: ['low', 'medium', 'high'] }
            ]
        },
        market: {
            title: 'Market Prices',
            endpoint: '/market',
            idField: '_id',
            columns: [
                { label: 'Crop', key: 'cropName', render: r => `<strong>${r.cropName}</strong>` },
                { label: 'Market', key: 'marketName' },
                { label: 'State', key: 'state' },
                { label: 'Modal Price (₹/qtl)', key: 'price', render: r => window.Utils ? window.Utils.formatCurrency(r.price || r.modalPrice) : `₹${r.price || r.modalPrice}` },
                { label: 'Min / Max (₹)', render: r => `₹${r.minPrice || '-'} / ₹${r.maxPrice || '-'}` },
                { label: 'Actions', actions: ['edit', 'delete'] }
            ],
            fields: [
                { name: 'cropName', label: 'Crop Name', type: 'text', required: true },
                { name: 'marketName', label: 'Market / Mandi', type: 'text', required: true },
                { name: 'district', label: 'District', type: 'text', required: true },
                { name: 'state', label: 'State', type: 'text', required: true },
                { name: 'price', label: 'Modal Price (₹/qtl)', type: 'number', required: true },
                { name: 'minPrice', label: 'Minimum Price (₹/qtl)', type: 'number' },
                { name: 'maxPrice', label: 'Maximum Price (₹/qtl)', type: 'number' }
            ]
        },
        pests: {
            title: 'Pests',
            endpoint: '/pests',
            idField: '_id',
            columns: [
                { label: 'Pest Name', key: 'pestName', render: r => `<strong>${r.pestName || r.name}</strong>` },
                { label: 'Scientific Name', key: 'scientificName' },
                { label: 'Crops Affected', key: 'cropsAffected', render: r => Array.isArray(r.cropsAffected) ? r.cropsAffected.slice(0, 3).join(', ') : (r.cropsAffected || '-') },
                { label: 'Severity', key: 'severity', render: r => `<span class="badge badge-${r.severity === 'high' ? 'danger' : r.severity === 'medium' ? 'warning' : 'info'}">${window.Utils.formatLabel(r.severity || 'medium')}</span>` },
                { label: 'Actions', actions: ['edit', 'delete'] }
            ],
            fields: [
                { name: 'pestName', label: 'Pest Name', type: 'text', required: true },
                { name: 'scientificName', label: 'Scientific Name', type: 'text' },
                { name: 'cropsAffected', label: 'Crops Affected (comma-separated)', type: 'text' },
                { name: 'severity', label: 'Severity', type: 'select', options: ['low', 'medium', 'high'] },
                { name: 'symptoms', label: 'Symptoms', type: 'textarea' },
                { name: 'organicControl', label: 'Organic Control', type: 'textarea' },
                { name: 'chemicalControl', label: 'Chemical Control', type: 'textarea' }
            ]
        },
        diseases: {
            title: 'Diseases',
            endpoint: '/diseases',
            idField: '_id',
            columns: [
                { label: 'Disease Name', key: 'diseaseName', render: r => `<strong>${r.diseaseName || r.name}</strong>` },
                { label: 'Pathogen Type', key: 'pathogenType', render: r => `<span class="badge badge-warning">${window.Utils.formatLabel(r.pathogenType || 'fungal')}</span>` },
                { label: 'Crops Affected', key: 'cropsAffected', render: r => Array.isArray(r.cropsAffected) ? r.cropsAffected.slice(0, 3).join(', ') : (r.cropsAffected || '-') },
                { label: 'Severity', key: 'severity', render: r => `<span class="badge badge-${r.severity === 'high' ? 'danger' : r.severity === 'medium' ? 'warning' : 'info'}">${window.Utils.formatLabel(r.severity || 'medium')}</span>` },
                { label: 'Actions', actions: ['edit', 'delete'] }
            ],
            fields: [
                { name: 'diseaseName', label: 'Disease Name', type: 'text', required: true },
                { name: 'scientificName', label: 'Scientific Name', type: 'text' },
                { name: 'pathogenType', label: 'Pathogen Type', type: 'select', options: ['fungal', 'bacterial', 'viral', 'nematode', 'other'] },
                { name: 'cropsAffected', label: 'Crops Affected (comma-separated)', type: 'text' },
                { name: 'severity', label: 'Severity', type: 'select', options: ['low', 'medium', 'high'] },
                { name: 'symptoms', label: 'Symptoms', type: 'textarea' },
                { name: 'prevention', label: 'Prevention', type: 'textarea' },
                { name: 'treatment', label: 'Treatment', type: 'textarea' }
            ]
        },
        fertilizers: {
            title: 'Fertilizers',
            endpoint: '/fertilizers',
            idField: '_id',
            columns: [
                { label: 'Crop', key: 'cropName', render: r => `<strong>${r.cropName || (r.crop && r.crop.cropName) || 'All'}</strong>` },
                { label: 'Stage', key: 'applicationStage', render: r => `<span class="badge badge-info">${window.Utils.formatLabel(r.applicationStage || 'general')}</span>` },
                { label: 'Soil Type', key: 'soilType' },
                { label: 'Type', key: 'fertilizerType', render: r => r.fertilizerType || 'NPK' },
                { label: 'Actions', actions: ['edit', 'delete'] }
            ],
            fields: [
                { name: 'cropName', label: 'Crop Name', type: 'text', required: true },
                { name: 'soilType', label: 'Soil Type', type: 'select', options: ['alluvial', 'black', 'red', 'laterite', 'sandy', 'loamy', 'clay', 'all'] },
                { name: 'applicationStage', label: 'Application Stage', type: 'select', options: ['basal', 'vegetative', 'flowering', 'fruiting', 'maturity', 'general'] },
                { name: 'fertilizerType', label: 'Fertilizer Type', type: 'text', default: 'chemical' },
                { name: 'organicOptions', label: 'Organic Options', type: 'textarea' },
                { name: 'chemicalOptions', label: 'Chemical Options', type: 'textarea' },
                { name: 'applicationMethod', label: 'Application Method', type: 'text' }
            ]
        },
        guides: {
            title: 'Cultivation Guides',
            endpoint: '/guides',
            idField: '_id',
            columns: [
                { label: 'Crop', key: 'cropName', render: r => `<strong>${r.cropName || (r.crop && r.crop.cropName) || 'Crop'}</strong>` },
                { label: 'Climate', key: 'climateRequirements', render: r => (r.climateRequirements || '').substring(0, 40) + '...' },
                { label: 'Soil', key: 'soilRequirements', render: r => (r.soilRequirements || '').substring(0, 40) + '...' },
                { label: 'Actions', actions: ['edit', 'delete'] }
            ],
            fields: [
                { name: 'cropName', label: 'Crop Name', type: 'text', required: true },
                { name: 'climateRequirements', label: 'Climate Requirements', type: 'textarea' },
                { name: 'soilRequirements', label: 'Soil Requirements', type: 'textarea' },
                { name: 'waterManagement', label: 'Water Management', type: 'textarea' },
                { name: 'harvesting', label: 'Harvesting Guide', type: 'textarea' }
            ]
        },
        advisories: {
            title: 'Advisories',
            endpoint: '/advisories',
            idField: '_id',
            columns: [
                { label: 'Title', key: 'title', render: r => `<strong>${r.title}</strong>` },
                { label: 'Severity', key: 'severity', render: r => `<span class="badge badge-${r.severity === 'critical' ? 'danger' : r.severity === 'warning' ? 'warning' : 'info'}">${window.Utils.formatLabel(r.severity)}</span>` },
                { label: 'Target State', key: 'targetState', render: r => r.targetState || 'All India' },
                { label: 'Active', key: 'isActive', render: r => r.isActive !== false ? '✅ Active' : '❌ Inactive' },
                { label: 'Actions', actions: ['edit', 'delete'] }
            ],
            fields: [
                { name: 'title', label: 'Advisory Title', type: 'text', required: true },
                { name: 'message', label: 'Advisory Message', type: 'textarea', required: true },
                { name: 'severity', label: 'Severity', type: 'select', options: ['info', 'warning', 'critical'], required: true },
                { name: 'targetState', label: 'Target State', type: 'text', hint: 'Leave empty for all states' },
                { name: 'affectedCrops', label: 'Affected Crops (comma separated)', type: 'text' },
                { name: 'isActive', label: 'Active', type: 'checkbox', default: true }
            ]
        },
        audit: {
            title: 'Audit Logs',
            endpoint: '/admin/audit-logs',
            idField: '_id',
            readOnly: true,
            columns: [
                { label: 'Timestamp', key: 'createdAt', render: r => window.Utils ? window.Utils.formatDate(r.createdAt) : new Date(r.createdAt).toLocaleString() },
                { label: 'User', key: 'user', render: r => r.user ? (r.user.name || r.user.email || r.user) : 'System' },
                { label: 'Action', key: 'action', render: r => `<span class="badge badge-${r.action === 'delete' ? 'danger' : r.action === 'create' ? 'success' : 'info'}">${window.Utils.formatLabel(r.action)}</span>` },
                { label: 'Resource', key: 'resource', render: r => `<strong>${r.resource || '-'}</strong>` },
                { label: 'Details', key: 'details', render: r => r.details || '-' },
                { label: 'IP Address', key: 'ip', render: r => r.ip || '-' }
            ]
        }
    };

    const AdminCrud = {
        async init() {
            this.bindEvents();
            await this.switchTab('users');
        },

        bindEvents() {
            // Tab switching
            const tabsContainer = document.getElementById('crud-tabs');
            if (tabsContainer) {
                tabsContainer.addEventListener('click', (e) => {
                    const tabEl = e.target.closest('.tab-item');
                    if (tabEl && tabEl.dataset.tab) {
                        this.switchTab(tabEl.dataset.tab);
                    }
                });
            }

            // Search input
            const searchInput = document.getElementById('crud-search');
            if (searchInput) {
                searchInput.addEventListener('input', window.Utils ? window.Utils.debounce((e) => {
                    currentSearch = e.target.value.trim();
                    currentPage = 1;
                    this.loadData();
                }, 300) : (e) => {
                    currentSearch = e.target.value.trim();
                    currentPage = 1;
                    this.loadData();
                });
            }

            // Add New button
            const addBtn = document.getElementById('crud-add-btn');
            if (addBtn) {
                addBtn.addEventListener('click', () => {
                    this.openCreateModal();
                });
            }
        },

        async switchTab(tabKey) {
            if (!TAB_CONFIGS[tabKey]) return;
            currentTab = tabKey;
            currentPage = 1;
            currentSearch = '';

            const searchInput = document.getElementById('crud-search');
            if (searchInput) searchInput.value = '';

            // Update tab UI
            document.querySelectorAll('#crud-tabs .tab-item').forEach(el => {
                if (el.dataset.tab === tabKey) {
                    el.classList.add('active');
                } else {
                    el.classList.remove('active');
                }
            });

            // Show/hide Add button for read-only tabs like audit
            const addBtn = document.getElementById('crud-add-btn');
            if (addBtn) {
                addBtn.style.display = TAB_CONFIGS[tabKey].readOnly ? 'none' : 'inline-block';
            }

            this.renderHeaders();
            await this.loadData();
        },

        renderHeaders() {
            const config = TAB_CONFIGS[currentTab];
            const thead = document.getElementById('crud-thead');
            if (!thead) return;

            let html = '<tr>';
            config.columns.forEach(col => {
                html += `<th>${col.label}</th>`;
            });
            html += '</tr>';
            thead.innerHTML = html;
        },

        async loadData() {
            const config = TAB_CONFIGS[currentTab];
            const tbody = document.getElementById('crud-tbody');
            if (!tbody) return;

            tbody.innerHTML = `<tr><td colspan="${config.columns.length}" style="text-align:center; padding: 24px;">Loading ${config.title}...</td></tr>`;

            try {
                const params = {
                    page: currentPage,
                    limit: currentLimit
                };
                if (currentSearch) params.search = currentSearch;

                const res = await window.API.get(config.endpoint, params);
                
                // Extract items safely from various envelope shapes
                let items = [];
                let pagination = null;

                if (res.data && Array.isArray(res.data)) {
                    items = res.data;
                } else if (res[currentTab] && Array.isArray(res[currentTab])) {
                    items = res[currentTab];
                } else if (res.users && Array.isArray(res.users)) {
                    items = res.users;
                } else if (res.crops && Array.isArray(res.crops)) {
                    items = res.crops;
                } else if (res.prices && Array.isArray(res.prices)) {
                    items = res.prices;
                } else if (res.pests && Array.isArray(res.pests)) {
                    items = res.pests;
                } else if (res.diseases && Array.isArray(res.diseases)) {
                    items = res.diseases;
                } else if (res.guides && Array.isArray(res.guides)) {
                    items = res.guides;
                } else if (res.advisories && Array.isArray(res.advisories)) {
                    items = res.advisories;
                } else if (res.logs && Array.isArray(res.logs)) {
                    items = res.logs;
                } else if (Array.isArray(res)) {
                    items = res;
                }

                pagination = res.pagination || (res.data && res.data.pagination) || {
                    page: currentPage,
                    limit: currentLimit,
                    total: items.length,
                    totalPages: Math.ceil(items.length / currentLimit) || 1
                };

                currentData = items;
                this.renderRows(items);
                this.renderPagination(pagination);
            } catch (err) {
                console.error(`Error loading ${config.title}:`, err);
                tbody.innerHTML = `<tr><td colspan="${config.columns.length}" style="text-align:center; color: #ef4444; padding: 24px;">Failed to load ${config.title}: ${err.message}</td></tr>`;
            }
        },

        renderRows(items) {
            const config = TAB_CONFIGS[currentTab];
            const tbody = document.getElementById('crud-tbody');
            if (!tbody) return;

            if (!items || items.length === 0) {
                tbody.innerHTML = `<tr><td colspan="${config.columns.length}" style="text-align:center; padding: 32px; color: #6b7280;">No records found.</td></tr>`;
                return;
            }

            let html = '';
            items.forEach((item, index) => {
                html += '<tr>';
                config.columns.forEach(col => {
                    if (col.actions) {
                        html += `<td><div style="display:flex; gap: 8px;">`;
                        if (col.actions.includes('edit')) {
                            html += `<button class="btn btn-sm btn-outline-primary crud-edit-btn" data-index="${index}">✏️ Edit</button>`;
                        }
                        if (col.actions.includes('delete')) {
                            html += `<button class="btn btn-sm btn-outline-danger crud-delete-btn" data-id="${item[config.idField] || item.id}">🗑️</button>`;
                        }
                        html += `</div></td>`;
                    } else if (col.render) {
                        html += `<td>${col.render(item)}</td>`;
                    } else {
                        const val = item[col.key];
                        html += `<td>${val != null ? val : '-'}</td>`;
                    }
                });
                html += '</tr>';
            });

            tbody.innerHTML = html;

            // Bind edit buttons
            tbody.querySelectorAll('.crud-edit-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const idx = parseInt(e.currentTarget.dataset.index, 10);
                    this.openEditModal(currentData[idx]);
                });
            });

            // Bind delete buttons
            tbody.querySelectorAll('.crud-delete-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = e.currentTarget.dataset.id;
                    this.confirmDelete(id);
                });
            });
        },

        renderPagination(pagination) {
            const container = document.getElementById('crud-pagination');
            if (!container) return;

            const totalPages = pagination.totalPages || Math.ceil((pagination.total || 0) / (pagination.limit || 10)) || 1;
            const current = pagination.page || currentPage;

            if (totalPages <= 1) {
                container.innerHTML = `<div style="text-align: right; padding: 12px; font-size: 0.85rem; color: #6b7280;">Total: ${pagination.total || currentData.length} records</div>`;
                return;
            }

            let html = `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; font-size: 0.85rem;">
                    <div style="color: #6b7280;">Showing page ${current} of ${totalPages} (${pagination.total || currentData.length} total)</div>
                    <div style="display: flex; gap: 6px;">
                        <button class="btn btn-sm ${current === 1 ? 'btn-disabled' : 'btn-outline-primary'}" id="crud-prev-page" ${current === 1 ? 'disabled' : ''}>◀ Prev</button>
                        <button class="btn btn-sm ${current === totalPages ? 'btn-disabled' : 'btn-outline-primary'}" id="crud-next-page" ${current === totalPages ? 'disabled' : ''}>Next ▶</button>
                    </div>
                </div>
            `;
            container.innerHTML = html;

            const prevBtn = document.getElementById('crud-prev-page');
            const nextBtn = document.getElementById('crud-next-page');

            if (prevBtn) {
                prevBtn.onclick = () => {
                    if (currentPage > 1) {
                        currentPage--;
                        this.loadData();
                    }
                };
            }
            if (nextBtn) {
                nextBtn.onclick = () => {
                    if (currentPage < totalPages) {
                        currentPage++;
                        this.loadData();
                    }
                };
            }
        },

        openCreateModal() {
            const config = TAB_CONFIGS[currentTab];
            if (!config || !config.fields) return;

            let fieldsHtml = '';
            config.fields.forEach(field => {
                fieldsHtml += `<div class="form-group mb-3">`;
                fieldsHtml += `<label class="form-label"><strong>${field.label}</strong> ${field.required ? '<span style="color:red">*</span>' : ''}</label>`;
                
                if (field.type === 'select') {
                    fieldsHtml += `<select class="form-control" name="${field.name}" ${field.required ? 'required' : ''}>`;
                    field.options.forEach(opt => {
                        fieldsHtml += `<option value="${opt}">${window.Utils.formatLabel(opt)}</option>`;
                    });
                    fieldsHtml += `</select>`;
                } else if (field.type === 'textarea') {
                    fieldsHtml += `<textarea class="form-control" name="${field.name}" rows="3" ${field.required ? 'required' : ''}></textarea>`;
                } else if (field.type === 'checkbox') {
                    fieldsHtml += `<div style="display:flex; align-items:center; gap:8px;"><input type="checkbox" name="${field.name}" ${field.default ? 'checked' : ''}> <span>Enabled</span></div>`;
                } else {
                    fieldsHtml += `<input type="${field.type || 'text'}" class="form-control" name="${field.name}" ${field.required ? 'required' : ''} ${field.hint ? `placeholder="${field.hint}"` : ''}>`;
                }
                fieldsHtml += `</div>`;
            });

            const modalHtml = `
                <div style="min-width: 320px; max-width: 500px; width: 100%;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                        <h3 style="margin: 0;">➕ Add New ${config.title.slice(0, -1)}</h3>
                        <button class="close-modal" style="background:none; border:none; font-size:1.4rem; cursor:pointer;">&times;</button>
                    </div>
                    <form id="crud-create-form">
                        ${fieldsHtml}
                        <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;">
                            <button type="button" class="btn btn-outline-secondary close-modal">Cancel</button>
                            <button type="submit" class="btn btn-primary" id="crud-save-btn">Save</button>
                        </div>
                    </form>
                </div>
            `;

            window.Utils.showModal(modalHtml, {
                onLoad: (modal, close) => {
                    const form = modal.querySelector('#crud-create-form');
                    form.addEventListener('submit', async (e) => {
                        e.preventDefault();
                        const formData = new FormData(form);
                        const payload = {};

                        config.fields.forEach(f => {
                            if (f.type === 'checkbox') {
                                payload[f.name] = form.querySelector(`[name="${f.name}"]`).checked;
                            } else if (f.type === 'number') {
                                const val = formData.get(f.name);
                                payload[f.name] = val ? Number(val) : undefined;
                            } else {
                                const val = formData.get(f.name);
                                if (f.name === 'suitableSeasons' || f.name === 'cropsAffected') {
                                    payload[f.name] = val ? val.split(',').map(s => s.trim()).filter(Boolean) : [];
                                } else {
                                    payload[f.name] = val;
                                }
                            }
                        });

                        try {
                            const saveBtn = modal.querySelector('#crud-save-btn');
                            if (saveBtn) { saveBtn.disabled = true; saveBtn.textContent = 'Saving...'; }

                            await window.API.post(config.endpoint, payload);
                            window.Utils.showToast(`${config.title.slice(0, -1)} created successfully!`, 'success');
                            close(true);
                            this.loadData();
                        } catch (err) {
                            window.Utils.showToast(`Error: ${err.message}`, 'error');
                            const saveBtn = modal.querySelector('#crud-save-btn');
                            if (saveBtn) { saveBtn.disabled = false; saveBtn.textContent = 'Save'; }
                        }
                    });
                }
            });
        },

        openEditModal(item) {
            const config = TAB_CONFIGS[currentTab];
            if (!config || !config.fields || !item) return;

            const id = item[config.idField] || item.id;
            let fieldsHtml = '';

            config.fields.forEach(field => {
                let currentVal = item[field.name];
                if (Array.isArray(currentVal)) {
                    currentVal = currentVal.join(', ');
                } else if (currentVal == null) {
                    currentVal = '';
                }

                fieldsHtml += `<div class="form-group mb-3">`;
                fieldsHtml += `<label class="form-label"><strong>${field.label}</strong> ${field.required ? '<span style="color:red">*</span>' : ''}</label>`;
                
                if (field.type === 'select') {
                    fieldsHtml += `<select class="form-control" name="${field.name}" ${field.required ? 'required' : ''}>`;
                    field.options.forEach(opt => {
                        const sel = String(currentVal).toLowerCase() === opt.toLowerCase() ? 'selected' : '';
                        fieldsHtml += `<option value="${opt}" ${sel}>${window.Utils.formatLabel(opt)}</option>`;
                    });
                    fieldsHtml += `</select>`;
                } else if (field.type === 'textarea') {
                    fieldsHtml += `<textarea class="form-control" name="${field.name}" rows="3" ${field.required ? 'required' : ''}>${currentVal}</textarea>`;
                } else if (field.type === 'checkbox') {
                    fieldsHtml += `<div style="display:flex; align-items:center; gap:8px;"><input type="checkbox" name="${field.name}" ${currentVal ? 'checked' : ''}> <span>Enabled</span></div>`;
                } else {
                    fieldsHtml += `<input type="${field.type || 'text'}" class="form-control" name="${field.name}" value="${currentVal}" ${field.required ? 'required' : ''}>`;
                }
                fieldsHtml += `</div>`;
            });

            const modalHtml = `
                <div style="min-width: 320px; max-width: 500px; width: 100%;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                        <h3 style="margin: 0;">✏️ Edit ${config.title.slice(0, -1)}</h3>
                        <button class="close-modal" style="background:none; border:none; font-size:1.4rem; cursor:pointer;">&times;</button>
                    </div>
                    <form id="crud-edit-form">
                        ${fieldsHtml}
                        <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;">
                            <button type="button" class="btn btn-outline-secondary close-modal">Cancel</button>
                            <button type="submit" class="btn btn-primary" id="crud-update-btn">Update</button>
                        </div>
                    </form>
                </div>
            `;

            window.Utils.showModal(modalHtml, {
                onLoad: (modal, close) => {
                    const form = modal.querySelector('#crud-edit-form');
                    form.addEventListener('submit', async (e) => {
                        e.preventDefault();
                        const formData = new FormData(form);
                        const payload = {};

                        config.fields.forEach(f => {
                            if (f.type === 'checkbox') {
                                payload[f.name] = form.querySelector(`[name="${f.name}"]`).checked;
                            } else if (f.type === 'number') {
                                const val = formData.get(f.name);
                                payload[f.name] = val ? Number(val) : undefined;
                            } else {
                                const val = formData.get(f.name);
                                if (f.name === 'suitableSeasons' || f.name === 'cropsAffected') {
                                    payload[f.name] = val ? val.split(',').map(s => s.trim()).filter(Boolean) : [];
                                } else {
                                    payload[f.name] = val;
                                }
                            }
                        });

                        try {
                            const updateBtn = modal.querySelector('#crud-update-btn');
                            if (updateBtn) { updateBtn.disabled = true; updateBtn.textContent = 'Updating...'; }

                            await window.API.put(`${config.endpoint}/${id}`, payload);
                            window.Utils.showToast(`${config.title.slice(0, -1)} updated successfully!`, 'success');
                            close(true);
                            this.loadData();
                        } catch (err) {
                            window.Utils.showToast(`Error: ${err.message}`, 'error');
                            const updateBtn = modal.querySelector('#crud-update-btn');
                            if (updateBtn) { updateBtn.disabled = false; updateBtn.textContent = 'Update'; }
                        }
                    });
                }
            });
        },

        async confirmDelete(id) {
            const config = TAB_CONFIGS[currentTab];
            const confirmed = await window.Utils.confirmDialog(`Are you sure you want to delete this ${config.title.slice(0, -1)}? This action cannot be undone.`);
            if (!confirmed) return;

            try {
                await window.API.delete(`${config.endpoint}/${id}`);
                window.Utils.showToast(`${config.title.slice(0, -1)} deleted successfully!`, 'success');
                this.loadData();
            } catch (err) {
                window.Utils.showToast(`Failed to delete: ${err.message}`, 'error');
            }
        }
    };

    window.PageModules = window.PageModules || {};
    window.PageModules.adminCrud = AdminCrud;
    window.PageModules['admin-crud'] = AdminCrud;

})();
