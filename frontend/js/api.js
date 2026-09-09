// js/api.js

window.API = {
    BASE_URL: window.API_BASE_URL || (window.location.origin || 'http://localhost:5000') + '/api',

    async request(endpoint, options = {}) {
        const url = `${this.BASE_URL}${endpoint}`;
        
        const headers = options.headers || {};
        
        const token = this.getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        if (!(options.body instanceof FormData) && options.method && options.method !== 'GET') {
            headers['Content-Type'] = 'application/json';
        }
        
        options.headers = headers;
        
        try {
            let response = await fetch(url, options);
            
            // Handle 401 Unauthorized (token expired)
            if (response.status === 401 && token) {
                const refreshed = await this.refreshAccessToken();
                if (refreshed) {
                    options.headers['Authorization'] = `Bearer ${this.getToken()}`;
                    response = await fetch(url, options);
                } else {
                    this.clearTokens();
                    window.location.href = '/pages/login.html';
                    throw new Error('Session expired');
                }
            }
            
            if (!response.ok) {
                let errorMsg = 'API request failed';
                try {
                    const errorData = await response.json();
                    if (errorData.errors && Array.isArray(errorData.errors) && errorData.errors.length > 0) {
                        const msgs = errorData.errors.map(err => {
                            if (typeof err === 'string') return err;
                            if (err.msg) return err.msg;
                            if (err.message) return err.message;
                            const vals = Object.values(err);
                            return vals.length > 0 ? vals[0] : JSON.stringify(err);
                        });
                        errorMsg = msgs.join(', ');
                    } else if (errorData.message) {
                        errorMsg = errorData.message;
                    }
                } catch(e) {}
                if (window.Utils && window.Utils.cleanErrorMessage) {
                    errorMsg = window.Utils.cleanErrorMessage(errorMsg);
                }
                throw new Error(errorMsg);
            }
            
            if (response.status === 204) return null;
            
            return await response.json();
            
        } catch (error) {
            console.error('API Error:', error);
            if (window.Utils && error.message !== 'Session expired') {
                const clean = window.Utils.cleanErrorMessage ? window.Utils.cleanErrorMessage(error.message) : error.message;
                window.Utils.showToast(clean, 'error');
            }
            throw error;
        }
    },

    async get(endpoint, params = {}) {
        const filteredParams = {};
        Object.entries(params).forEach(([k, v]) => {
            if (v !== undefined && v !== null && v !== '') filteredParams[k] = v;
        });
        const queryString = new URLSearchParams(filteredParams).toString();
        const url = queryString ? `${endpoint}?${queryString}` : endpoint;
        return this.request(url, { method: 'GET' });
    },

    async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    async put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },

    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    },

    async upload(endpoint, formData) {
        return this.request(endpoint, {
            method: 'POST',
            body: formData
        });
    },

    async refreshAccessToken() {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) return false;
        
        try {
            const response = await fetch(`${this.BASE_URL}/auth/refresh-token`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: refreshToken })
            });
            
            if (response.ok) {
                const result = await response.json();
                if (result.data) {
                    this.setTokens(result.data.accessToken, result.data.refreshToken || refreshToken);
                } else {
                    this.setTokens(result.accessToken, result.refreshToken || refreshToken);
                }
                return true;
            }
            return false;
        } catch (e) {
            return false;
        }
    },

    getToken() {
        return localStorage.getItem('accessToken');
    },

    setTokens(access, refresh) {
        if (access) localStorage.setItem('accessToken', access);
        if (refresh) localStorage.setItem('refreshToken', refresh);
    },

    clearTokens() {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
    }
};
