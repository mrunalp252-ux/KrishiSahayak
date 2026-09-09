// js/utils.js

window.Utils = {
    showToast(message, type = 'info', duration = 3000) {
        const cleanMessage = this.cleanErrorMessage ? this.cleanErrorMessage(message) : message;
        const toastContainer = document.getElementById('toast-container') || this.createToastContainer();
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = cleanMessage;
        toastContainer.appendChild(toast);
        
        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    },

    createToastContainer() {
        const container = document.createElement('div');
        container.id = 'toast-container';
        container.style.position = 'fixed';
        container.style.bottom = '20px';
        container.style.right = '20px';
        container.style.zIndex = '9999';
        document.body.appendChild(container);
        
        // Add basic styles
        const style = document.createElement('style');
        style.textContent = `
            .toast { padding: 12px 24px; margin-top: 10px; border-radius: 4px; color: white; opacity: 0; transition: opacity 0.3s; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .toast.show { opacity: 1; }
            .toast-info { background: #3b82f6; }
            .toast-success { background: #10b981; }
            .toast-error { background: #ef4444; }
            .toast-warning { background: #f59e0b; }
        `;
        document.head.appendChild(style);
        
        return container;
    },

    showModal(contentHtml, options = {}) {
        return new Promise((resolve) => {
            const modalOverlay = document.createElement('div');
            modalOverlay.style.position = 'fixed';
            modalOverlay.style.top = '0';
            modalOverlay.style.left = '0';
            modalOverlay.style.width = '100%';
            modalOverlay.style.height = '100%';
            modalOverlay.style.backgroundColor = 'rgba(0,0,0,0.5)';
            modalOverlay.style.display = 'flex';
            modalOverlay.style.alignItems = 'center';
            modalOverlay.style.justifyContent = 'center';
            modalOverlay.style.zIndex = '9999';

            const modalContent = document.createElement('div');
            modalContent.style.backgroundColor = 'var(--bg-color, white)';
            modalContent.style.padding = '20px';
            modalContent.style.borderRadius = '8px';
            modalContent.style.minWidth = '300px';
            modalContent.style.maxWidth = '90%';
            modalContent.style.maxHeight = '90%';
            modalContent.style.overflowY = 'auto';
            modalContent.innerHTML = contentHtml;

            modalOverlay.appendChild(modalContent);
            document.body.appendChild(modalOverlay);

            const closeBtn = modalContent.querySelector('.close-modal');
            if (closeBtn) {
                closeBtn.onclick = () => {
                    modalOverlay.remove();
                    resolve(null);
                };
            }
            
            modalOverlay.onclick = (e) => {
                if(e.target === modalOverlay && options.dismissible !== false) {
                    modalOverlay.remove();
                    resolve(null);
                }
            };
            
            // Allow caller to bind events
            if (options.onLoad) {
                options.onLoad(modalContent, (result) => {
                    modalOverlay.remove();
                    resolve(result);
                });
            }
        });
    },

    confirmDialog(message) {
        return new Promise((resolve) => {
            const html = `
                <div class="confirm-dialog" style="text-align: center;">
                    <h3 style="margin-top: 0;">${window.I18n ? window.I18n.translate('confirm_action') : 'Confirm'}</h3>
                    <p>${message}</p>
                    <div style="margin-top: 20px; display: flex; justify-content: center; gap: 10px;">
                        <button id="confirm-yes" style="padding: 8px 16px; background: #ef4444; color: white; border: none; border-radius: 4px; cursor: pointer;">
                            ${window.I18n ? window.I18n.translate('yes') : 'Yes'}
                        </button>
                        <button id="confirm-no" style="padding: 8px 16px; background: #9ca3af; color: white; border: none; border-radius: 4px; cursor: pointer;">
                            ${window.I18n ? window.I18n.translate('no') : 'No'}
                        </button>
                    </div>
                </div>
            `;
            this.showModal(html, {
                onLoad: (modal, close) => {
                    modal.querySelector('#confirm-yes').onclick = () => close(true);
                    modal.querySelector('#confirm-no').onclick = () => close(false);
                }
            }).then(resolve);
        });
    },

    formatDate(dateStr) {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return d.toLocaleDateString();
    },

    formatCurrency(amount) {
        if (amount == null) return '';
        return '₹ ' + Number(amount).toLocaleString('en-IN');
    },

    formatNumber(num) {
        if (num == null) return '';
        return Number(num).toLocaleString();
    },

    debounce(fn, delay) {
        let timeout;
        return function (...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => fn.apply(this, args), delay);
        };
    },

    sanitizeHtml(str) {
        if (!str) return '';
        const temp = document.createElement('div');
        temp.textContent = str;
        return temp.innerHTML;
    },

    showLoading(element) {
        if(typeof element === 'string') element = document.querySelector(element);
        if (!element) return;
        element.dataset.originalHtml = element.innerHTML;
        element.innerHTML = `<div class="spinner" style="border: 4px solid rgba(0,0,0,0.1); width: 36px; height: 36px; border-radius: 50%; border-left-color: #10b981; animation: spin 1s linear infinite; margin: 20px auto;"></div>
        <style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>`;
    },

    hideLoading(element) {
        if(typeof element === 'string') element = document.querySelector(element);
        if (!element || !element.dataset.originalHtml) return;
        element.innerHTML = element.dataset.originalHtml;
        delete element.dataset.originalHtml;
    },

    createPagination(container, currentPage, totalPages, onPageChange) {
        if(typeof container === 'string') container = document.querySelector(container);
        if (!container || totalPages <= 1) {
            if(container) container.innerHTML = '';
            return;
        }
        
        let html = '<div class="pagination" style="display: flex; gap: 5px; justify-content: center; margin-top: 20px;">';
        
        const createBtn = (page, text, disabled) => `
            <button class="page-btn ${disabled ? 'disabled' : ''} ${page === currentPage ? 'active' : ''}" 
                    data-page="${page}" 
                    style="padding: 5px 10px; border: 1px solid #ddd; background: ${page === currentPage ? '#10b981' : 'white'}; color: ${page === currentPage ? 'white' : 'black'}; cursor: ${disabled ? 'not-allowed' : 'pointer'}; opacity: ${disabled ? '0.5' : '1'}; border-radius: 4px;"
                    ${disabled ? 'disabled' : ''}>
                ${text}
            </button>
        `;
        
        html += createBtn(currentPage - 1, '&laquo;', currentPage === 1);
        
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
                html += createBtn(i, i, false);
            } else if (i === currentPage - 3 || i === currentPage + 3) {
                html += '<span style="padding: 5px 10px;">...</span>';
            }
        }
        
        html += createBtn(currentPage + 1, '&raquo;', currentPage === totalPages);
        html += '</div>';
        
        container.innerHTML = html;
        
        container.querySelectorAll('.page-btn:not(.disabled)').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const page = parseInt(e.target.dataset.page);
                if (page !== currentPage) {
                    onPageChange(page);
                }
            });
        });
    },

    getQueryParam(name) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    },

    setQueryParam(name, value) {
        const url = new URL(window.location);
        if (value) {
            url.searchParams.set(name, value);
        } else {
            url.searchParams.delete(name);
        }
        window.history.pushState({}, '', url);
    },

    isEmpty(value) {
        return value == null || value === '' || (Array.isArray(value) && value.length === 0) || (typeof value === 'object' && Object.keys(value).length === 0);
    },

    truncate(str, maxLength) {
        if (!str || str.length <= maxLength) return str;
        return str.substring(0, maxLength) + '...';
    },

    formatLabel(val) {
        if (val == null || val === '') return '';
        if (typeof val !== 'string') return String(val);

        const knownEnums = {
            'alluvial': 'Alluvial Soil',
            'black': 'Black Soil',
            'red': 'Red Soil',
            'laterite': 'Laterite Soil',
            'desert': 'Desert Soil',
            'mountain': 'Mountain Soil',
            'clay': 'Clay Soil',
            'sandy': 'Sandy Soil',
            'loamy': 'Loamy Soil',
            'silt': 'Silt Soil',
            'rainfed': 'Rainfed',
            'canal': 'Canal Irrigation',
            'borewell': 'Borewell',
            'well': 'Open Well',
            'drip': 'Drip Irrigation',
            'sprinkler': 'Sprinkler Irrigation',
            'flood': 'Flood Irrigation',
            'abundant': 'Abundant',
            'moderate': 'Moderate',
            'scarce': 'Scarce',
            'low': 'Low',
            'medium': 'Medium',
            'high': 'High',
            'critical': 'Critical',
            'kharif': 'Kharif',
            'rabi': 'Rabi',
            'zaid': 'Zaid',
            'all': 'All Seasons',
            'basal': 'Basal Application',
            'vegetative': 'Vegetative Stage',
            'flowering': 'Flowering Stage',
            'fruiting': 'Fruiting Stage',
            'maturity': 'Maturity Stage',
            'harvesting': 'Harvesting',
            'general': 'General Application',
            'land_preparation': 'Land Preparation',
            'seed_selection': 'Seed Selection',
            'sowing': 'Sowing',
            'irrigation': 'Irrigation',
            'nutrient_management': 'Nutrient Management',
            'pest_management': 'Pest Management',
            'disease_management': 'Disease Management',
            'post_harvest': 'Post Harvest',
            'pending': 'Pending',
            'in_progress': 'In Progress',
            'completed': 'Completed',
            'overdue': 'Overdue',
            'active': 'Active',
            'inactive': 'Inactive',
            'farmer': 'Farmer',
            'expert': 'Agricultural Expert',
            'admin': 'Administrator',
            'cereals': 'Cereals',
            'pulses': 'Pulses',
            'oilseeds': 'Oilseeds',
            'vegetables': 'Vegetables',
            'fruits': 'Fruits',
            'spices': 'Spices',
            'fiber': 'Fiber Crops',
            'commercial': 'Commercial Crops',
            'other': 'Other',
            'fungal': 'Fungal',
            'bacterial': 'Bacterial',
            'viral': 'Viral',
            'nematode': 'Nematode',
            'nutritional': 'Nutritional Deficiency',
            'urgent': 'Urgent',
            'warning': 'Warning',
            'info': 'Informational',
            'create': 'Created',
            'update': 'Updated',
            'delete': 'Deleted',
            'login': 'Logged In',
            'logout': 'Logged Out'
        };

        const key = val.trim().toLowerCase();
        if (knownEnums[key]) return knownEnums[key];

        const clean = val
            .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
            .replace(/[_\-]+/g, ' ')
            .trim();

        return clean.split(/\s+/).map(w => {
            const upper = w.toUpperCase();
            if (['AI', 'ID', 'NPK', 'APMC', 'URL', 'IP'].includes(upper)) return upper;
            return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
        }).join(' ');
    },

    cleanErrorMessage(msg) {
        if (!msg) return 'An unexpected error occurred. Please try again.';
        if (typeof msg !== 'string') {
            try { msg = JSON.stringify(msg); } catch(e) { return 'An unexpected error occurred.'; }
        }

        const lower = msg.toLowerCase();
        if (lower.includes('econnrefused') || lower.includes('failed to fetch') || lower.includes('networkerror')) {
            return 'Unable to connect to the server. Please check your internet connection and try again.';
        }
        if (lower.includes('casterror') || lower.includes('resource not found with id')) {
            return 'The requested information could not be found.';
        }
        if (lower.includes('mongoservererror') || lower.includes('duplicate key') || lower.includes('e11000')) {
            return 'A record with this information already exists.';
        }
        if (lower.includes('jwt malformed') || lower.includes('token is invalid') || lower.includes('token is expired') || lower.includes('session expired')) {
            return 'Your session has expired. Please log in again.';
        }
        if (lower.includes('cannot read properties of undefined') || lower.includes('is not defined') || lower.includes('typeerror')) {
            return 'An unexpected application error occurred. Please refresh and try again.';
        }
        if (lower.includes('validationerror')) {
            msg = msg.replace(/validationerror:?\s*/gi, '').trim();
            if (!msg) return 'Please check the entered information and correct any errors.';
        }
        if (msg.trim() === 'undefined' || msg.trim() === 'null') {
            return 'An unexpected error occurred. Please try again.';
        }

        return msg.replace(/\b([a-z]+[A-Z][a-zA-Z]*|[a-z]+_[a-z0-9_]+)\b/g, (match) => {
            return this.formatLabel(match);
        });
    }
};
