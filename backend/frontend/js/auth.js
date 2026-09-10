// js/auth.js

window.Auth = {
    async login(email, password) {
        try {
            const result = await window.API.post('/auth/login', { email, password });
            const data = result.data || result;
            window.API.setTokens(data.accessToken, data.refreshToken);
            this.setUser(data.user);
            if (window.Utils) window.Utils.showToast(window.I18n ? window.I18n.translate('login_success') : 'Login Successful', 'success');
            
            // Redirect based on role
            const role = data.user.role;
            setTimeout(() => {
                if (role === 'admin') {
                    window.location.href = '/pages/admin-dashboard.html';
                } else if (role === 'expert') {
                    window.location.href = '/pages/expert-dashboard.html';
                } else {
                    window.location.href = '/pages/dashboard.html';
                }
            }, 800);
            return data;
        } catch (error) {
            throw error;
        }
    },

    async register(formData) {
        try {
            const result = await window.API.post('/auth/register', formData);
            const data = result.data || result;
            if (window.Utils) window.Utils.showToast(window.I18n ? window.I18n.translate('register_success') : 'Registration Successful', 'success');
            setTimeout(() => { window.location.href = '/pages/login.html'; }, 800);
            return data;
        } catch (error) {
            throw error;
        }
    },

    async logout() {
        try {
            if (this.isAuthenticated()) {
                await window.API.post('/auth/logout', { refreshToken: localStorage.getItem('refreshToken') }).catch(() => {});
            }
        } finally {
            window.API.clearTokens();
            localStorage.removeItem('user');
            window.location.href = '/pages/login.html';
        }
    },

    async forgotPassword(email) {
        await window.API.post('/auth/forgot-password', { email });
        if (window.Utils) window.Utils.showToast(window.I18n ? window.I18n.translate('send_reset_link') : 'If that email is registered, a reset link has been sent.', 'success');
    },

    async resetPassword(token, password) {
        await window.API.post('/auth/reset-password', { token, password });
        if (window.Utils) window.Utils.showToast(window.I18n ? window.I18n.translate('password_reset_success') : 'Password reset successful', 'success');
        setTimeout(() => { window.location.href = '/pages/login.html'; }, 1000);
    },

    isAuthenticated() {
        return !!window.API.getToken();
    },

    getUser() {
        try {
            const userStr = localStorage.getItem('user');
            return userStr ? JSON.parse(userStr) : null;
        } catch(e) {
            return null;
        }
    },

    setUser(user) {
        if (user) {
            localStorage.setItem('user', JSON.stringify(user));
        }
    },

    checkAuth() {
        if (!this.isAuthenticated()) {
            window.location.href = '/pages/login.html';
            return false;
        }
        return true;
    },

    checkRole(roles) {
        const user = this.getUser();
        if (!user || !user.role) return false;
        
        if (Array.isArray(roles)) {
            return roles.includes(user.role);
        }
        return user.role === roles;
    },
    
    init() {
        // Login form handler
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const email = document.getElementById('email').value;
                const password = document.getElementById('password').value;
                const submitBtn = loginForm.querySelector('button[type="submit"]');
                try {
                    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Logging in...'; }
                    await this.login(email, password);
                } catch(err) {
                    if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = window.I18n ? window.I18n.translate('login_btn') : 'Login'; }
                }
            });
        }
        
        // Register form handler
        const registerForm = document.getElementById('register-form');
        if (registerForm) {
            registerForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const nameInput = document.getElementById('name');
                const name = nameInput ? nameInput.value.trim() : '';
                if (!name) {
                    if (window.Utils) window.Utils.showToast('Full Name is required', 'error');
                    if (nameInput) nameInput.focus();
                    return;
                }

                const emailInput = document.getElementById('email');
                const email = emailInput ? emailInput.value.trim() : '';
                if (!email) {
                    if (window.Utils) window.Utils.showToast('Email is required', 'error');
                    if (emailInput) emailInput.focus();
                    return;
                }
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email)) {
                    if (window.Utils) window.Utils.showToast('Please enter a valid email address', 'error');
                    if (emailInput) emailInput.focus();
                    return;
                }

                const passwordInput = document.getElementById('password');
                const password = passwordInput ? passwordInput.value : '';
                const confirmPwdInput = document.getElementById('confirm_pwd');
                const confirmPwd = confirmPwdInput ? confirmPwdInput.value : '';

                if (!password) {
                    if (window.Utils) window.Utils.showToast('Password is required', 'error');
                    if (passwordInput) passwordInput.focus();
                    return;
                }
                if (password.length < 8) {
                    if (window.Utils) window.Utils.showToast('Password must be at least 8 characters', 'error');
                    if (passwordInput) passwordInput.focus();
                    return;
                }
                if (!/\d/.test(password)) {
                    if (window.Utils) window.Utils.showToast('Password must contain at least one number', 'error');
                    if (passwordInput) passwordInput.focus();
                    return;
                }
                if (password !== confirmPwd) {
                    if (window.Utils) window.Utils.showToast('Passwords do not match', 'error');
                    if (confirmPwdInput) confirmPwdInput.focus();
                    return;
                }

                const mobileInput = document.getElementById('mobile');
                const mobileRaw = mobileInput ? mobileInput.value.trim() : '';
                if (mobileRaw) {
                    const cleanedMobile = mobileRaw.replace(/[\s\-()]/g, '');
                    if (!/^\+?[0-9]{10,15}$/.test(cleanedMobile)) {
                        if (window.Utils) window.Utils.showToast('Invalid mobile number', 'error');
                        if (mobileInput) mobileInput.focus();
                        return;
                    }
                }

                const selectedLang = (document.getElementById('language') ? document.getElementById('language').value : '') || localStorage.getItem('language') || 'en';

                const formData = {
                    name: name,
                    email: email,
                    password: password,
                    state: document.getElementById('state') ? document.getElementById('state').value : '',
                    district: document.getElementById('district') ? document.getElementById('district').value.trim() : '',
                    village: document.getElementById('village') ? document.getElementById('village').value.trim() : '',
                    language: selectedLang,
                    preferredLanguage: selectedLang,
                    role: 'farmer'
                };

                // Only attach mobile if user provided a non-empty string
                if (mobileRaw) {
                    formData.mobile = mobileRaw.replace(/[\s\-()]/g, '');
                }

                const submitBtn = registerForm.querySelector('button[type="submit"]');
                try {
                    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Registering...'; }
                    await this.register(formData);
                } catch(err) {
                    if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = window.I18n ? window.I18n.translate('register_btn') : 'Register'; }
                }
            });
        }
        
        // Forgot password form
        const forgotForm = document.getElementById('forgot-form');
        if (forgotForm) {
            forgotForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const email = document.getElementById('email').value;
                const submitBtn = forgotForm.querySelector('button[type="submit"]');
                try {
                    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Sending...'; }
                    await this.forgotPassword(email);
                } catch(err) {
                    // Already handled
                } finally {
                    if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Send Reset Link'; }
                }
            });
        }
        
        // Reset password form
        const resetForm = document.getElementById('reset-form');
        if (resetForm) {
            resetForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const pwd = document.getElementById('pwd').value;
                const cpwd = document.getElementById('cpwd').value;
                if (pwd !== cpwd) {
                    if (window.Utils) window.Utils.showToast('Passwords do not match', 'error');
                    return;
                }
                const token = window.Utils ? window.Utils.getQueryParam('token') : new URLSearchParams(window.location.search).get('token');
                if (!token) {
                    if (window.Utils) window.Utils.showToast('Invalid reset link', 'error');
                    return;
                }
                try {
                    await this.resetPassword(token, pwd);
                } catch(err) {
                    // Already handled
                }
            });
        }
        
        // Logout button
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        }
    }
};
