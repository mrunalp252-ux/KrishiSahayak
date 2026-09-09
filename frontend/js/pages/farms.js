// js/pages/farms.js

window.PageModules.farms = {
    currentPage: 1,

    async init() {
        await this.loadFarms();
        this.setupEventListeners();
    },

    async loadFarms(page = 1) {
        this.currentPage = page;
        try {
            const result = await window.API.get('/farms', { page, limit: 12 });
            const farms = result.farms || result.data || (Array.isArray(result) ? result : []);
            this.renderFarms(Array.isArray(farms) ? farms : []);
            
            if (result.pagination) {
                window.Utils.createPagination('#farms-pagination', result.pagination.page, result.pagination.totalPages, (p) => this.loadFarms(p));
            }
        } catch (e) {
            const container = document.getElementById('farms-container');
            if (container) container.innerHTML = '<div class="empty-state"><p>Could not load farms.</p></div>';
        }
    },

    renderFarms(farms) {
        const container = document.getElementById('farms-container');
        if (!container) return;
        
        if (farms.length === 0) {
            container.innerHTML = `<div class="empty-state" style="grid-column: 1/-1;"><p>No farms yet. Click "Add Farm" to get started!</p></div>`;
            return;
        }

        container.innerHTML = farms.map(farm => `
            <div class="card farm-card">
                <div class="card-header">
                    <h3>${window.Utils.sanitizeHtml(farm.farmName)}</h3>
                    <span class="badge badge-success">${farm.currentCrop ? 'Active' : 'Available'}</span>
                </div>
                <div class="card-body">
                    <p><strong>Location:</strong> ${window.Utils.sanitizeHtml((farm.village ? farm.village + ', ' : '') + farm.district)}</p>
                    <p><strong>Area:</strong> ${farm.landSize} ${window.Utils.formatLabel(farm.landUnit || 'acres')}</p>
                    <p><strong>Soil Type:</strong> ${window.Utils.formatLabel(farm.soilType) || '-'}</p>
                    <p><strong>Irrigation:</strong> ${window.Utils.formatLabel(farm.irrigationType) || '-'}</p>
                    <p><strong>Current Crop:</strong> ${window.Utils.sanitizeHtml(farm.currentCrop || 'None')}</p>
                </div>
                <div class="card-footer flex gap-2">
                    <button class="btn btn-outline btn-sm w-full" onclick="window.PageModules.farms.editFarm('${farm._id}')">Edit</button>
                    <button class="btn btn-danger btn-sm w-full" onclick="window.PageModules.farms.deleteFarm('${farm._id}')">Delete</button>
                </div>
            </div>
        `).join('');
    },
    
    setupEventListeners() {
        const addBtn = document.getElementById('add-farm-btn');
        if (addBtn) addBtn.onclick = () => this.showFarmForm();
    },

    showFarmForm(farm = null) {
        const soilTypes = ['alluvial', 'black', 'red', 'laterite', 'desert', 'mountain', 'clay', 'sandy', 'loamy', 'silt'];
        const irrigationTypes = ['rainfed', 'canal', 'borewell', 'well', 'drip', 'sprinkler', 'flood', 'other'];
        const landUnits = ['acres', 'hectares', 'bigha', 'guntha'];

        const html = `
            <h3 class="mb-3">${farm ? 'Edit Farm' : 'Add New Farm'}</h3>
            <form id="farm-form">
                <div class="form-group">
                    <label class="form-label">Farm Name *</label>
                    <input type="text" name="farmName" class="form-control" value="${farm?.farmName || ''}" required>
                </div>
                <div class="grid-2">
                    <div class="form-group">
                        <label class="form-label">State *</label>
                        <input type="text" name="state" class="form-control" value="${farm?.state || ''}" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">District *</label>
                        <input type="text" name="district" class="form-control" value="${farm?.district || ''}" required>
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">Village</label>
                    <input type="text" name="village" class="form-control" value="${farm?.village || ''}">
                </div>
                <div class="grid-2">
                    <div class="form-group">
                        <label class="form-label">Land Size *</label>
                        <input type="number" name="landSize" class="form-control" step="0.01" min="0" value="${farm?.landSize || ''}" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Unit</label>
                        <select name="landUnit" class="form-select">
                            ${landUnits.map(u => `<option value="${u}" ${farm?.landUnit === u ? 'selected' : ''}>${window.Utils.formatLabel(u)}</option>`).join('')}
                        </select>
                    </div>
                </div>
                <div class="grid-2">
                    <div class="form-group">
                        <label class="form-label">Soil Type *</label>
                        <select name="soilType" class="form-select" required>
                            ${soilTypes.map(s => `<option value="${s}" ${farm?.soilType === s ? 'selected' : ''}>${window.Utils.formatLabel(s)}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Irrigation Type *</label>
                        <select name="irrigationType" class="form-select" required>
                            ${irrigationTypes.map(i => `<option value="${i}" ${farm?.irrigationType === i ? 'selected' : ''}>${window.Utils.formatLabel(i)}</option>`).join('')}
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">Current Crop</label>
                    <input type="text" name="currentCrop" class="form-control" value="${farm?.currentCrop || ''}">
                </div>
                <div class="flex gap-2 mt-4">
                    <button type="submit" class="btn btn-primary">${farm ? 'Update' : 'Save'} Farm</button>
                    <button type="button" class="btn btn-secondary close-modal">Cancel</button>
                </div>
            </form>
        `;
        window.Utils.showModal(html, {
            onLoad: (modal, close) => {
                modal.querySelector('#farm-form').onsubmit = async (e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target);
                    const data = Object.fromEntries(formData.entries());
                    data.landSize = parseFloat(data.landSize);
                    try {
                        if (farm) {
                            await window.API.put(`/farms/${farm._id}`, data);
                            window.Utils.showToast('Farm updated successfully', 'success');
                        } else {
                            await window.API.post('/farms', data);
                            window.Utils.showToast('Farm created successfully', 'success');
                        }
                        close();
                        this.loadFarms(this.currentPage);
                    } catch(err) {}
                };
            }
        });
    },
    
    async editFarm(id) {
        try {
            const result = await window.API.get(`/farms/${id}`);
            const farm = result.data || result;
            this.showFarmForm(farm);
        } catch(e) {}
    },
    
    async deleteFarm(id) {
        const confirmed = await window.Utils.confirmDialog('Are you sure you want to delete this farm?');
        if (confirmed) {
            try {
                await window.API.delete(`/farms/${id}`);
                window.Utils.showToast('Farm deleted', 'success');
                this.loadFarms(this.currentPage);
            } catch(e) {}
        }
    }
};
