// js/i18n.js

window.I18n = {
    currentLang: 'en',
    translations: {},
    supportedLangs: ['en', 'hi', 'mr'],

    async init() {
        this.currentLang = localStorage.getItem('language') || 'en';
        if (!this.supportedLangs.includes(this.currentLang)) {
            this.currentLang = 'en';
        }
        
        await this.loadTranslations(this.currentLang);
        if (this.currentLang !== 'en') {
            await this.loadTranslations('en');
        }
        
        this.translatePage();
        this.setupLangSelectors();
    },

    async loadTranslations(lang) {
        if (this.translations[lang]) return;
        try {
            const response = await fetch(`/locales/${lang}.json`);
            if (response.ok) {
                this.translations[lang] = await response.json();
            } else {
                console.warn(`Failed to load translations for ${lang}`);
                this.translations[lang] = {};
            }
        } catch (e) {
            console.error(`Error loading translations for ${lang}`, e);
            this.translations[lang] = {};
        }
    },

    humanizeKey(key) {
        if (!key || typeof key !== 'string') return '';
        
        const directMap = {
            'ai_greeting': 'Hello, how can I assist you with your farming today?',
            'enter_field_details': 'Enter Field Details',
            'get_recommendation': 'Get Crop Recommendations',
            'check_weather': 'Check Weather',
            'ask_ai': 'Ask AI Assistant',
            'active_crops': 'Active Crops',
            'new_advisory': 'New Advisory',
            'previous_crop': 'Previous Crop',
            'ai_recommendations': 'AI Crop Recommendations',
            'filter_farm': 'Farm',
            'filter_status': 'Status',
            'filter_type': 'Activity Type',
            'manage_farms': 'Manage Farms',
            'confirm_pwd': 'Confirm Password',
            'pref_lang': 'Preferred Language',
            'register_btn': 'Register',
            'login_link': 'Login',
            'create_account': 'Create an Account',
            'farmer_queries': 'Farmer Queries',
            'view_all': 'View All',
            'save_profile': 'Save Profile',
            'delete_farm': 'Delete Farm',
            'add_activity': 'Add Activity',
            'generate_plan': 'Generate Plan',
            'submit_form': 'Submit',
            'cancel_action': 'Cancel',
            'welcome_back': 'Welcome Back'
        };
        if (directMap[key]) return directMap[key];

        const wordMap = {
            'ai': 'AI',
            'id': 'ID',
            'npk': 'NPK',
            'apmc': 'APMC',
            'pwd': 'Password',
            'btn': 'Button',
            'pref': 'Preferred',
            'lang': 'Language',
            'min': 'Min',
            'max': 'Max',
            'desc': 'Description',
            'prev': 'Previous',
            'curr': 'Current',
            'qty': 'Quantity',
            'avg': 'Average',
            'url': 'URL',
            'api': 'API',
            'ph': 'pH'
        };

        let clean = key;
        const prefixes = ['filter_', 'btn_', 'lbl_', 'opt_', 'msg_', 'err_', 'stat_', 'col_', 'hdr_', 'feat_'];
        for (const p of prefixes) {
            if (clean.startsWith(p) && clean.length > p.length) {
                clean = clean.slice(p.length);
                break;
            }
        }

        const words = clean
            .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
            .replace(/[_\-.]+/g, ' ')
            .trim()
            .split(/\s+/);

        return words
            .filter(Boolean)
            .map(w => {
                const lower = w.toLowerCase();
                if (wordMap[lower]) return wordMap[lower];
                return lower.charAt(0).toUpperCase() + lower.slice(1);
            })
            .join(' ');
    },

    translate(key, defaultText) {
        if (!key || typeof key !== 'string') return defaultText || '';
        
        const langData = this.translations[this.currentLang];
        if (langData && langData[key] !== undefined && langData[key] !== '') {
            return langData[key];
        }
        
        const enData = this.translations['en'];
        if (enData && enData[key] !== undefined && enData[key] !== '') {
            return enData[key];
        }
        
        if (defaultText && typeof defaultText === 'string' && !defaultText.includes('_') && defaultText !== key) {
            return defaultText;
        }

        const humanFallback = this.humanizeKey(key);
        if (window.DEBUG === true) {
            console.warn(`[i18n] Missing translation for: "${key}", safe fallback: "${humanFallback}"`);
        }
        return humanFallback;
    },

    t(key, defaultText) {
        return this.translate(key, defaultText);
    },

    async setLanguage(lang) {
        if (lang === this.currentLang || !this.supportedLangs.includes(lang)) return;
        
        this.currentLang = lang;
        localStorage.setItem('language', lang);
        localStorage.setItem('krishi_language', lang);
        
        await this.loadTranslations(lang);
        this.translatePage();
        
        if (window.API && window.Auth && window.Auth.isAuthenticated()) {
            window.API.put('/users/profile', { language: lang }).catch(() => {});
        }
        
        window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
    },

    getCurrentLanguage() {
        return this.currentLang;
    },

    translatePage() {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (!key) return;

            const hasTranslation = (this.translations[this.currentLang] && this.translations[this.currentLang][key] !== undefined) ||
                                  (this.translations['en'] && this.translations['en'][key] !== undefined);

            const translated = this.translate(key);

            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                if (el.hasAttribute('placeholder')) {
                    if (hasTranslation || !el.placeholder || el.placeholder.includes('_') || el.placeholder === key) {
                        el.placeholder = translated;
                    }
                }
            } else {
                const existingText = el.textContent ? el.textContent.trim() : '';
                if (hasTranslation || !existingText || existingText === key || existingText.includes('_')) {
                    el.textContent = translated;
                }
            }
        });

        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            if (key) el.placeholder = this.translate(key);
        });

        document.querySelectorAll('[data-i18n-title]').forEach(el => {
            const key = el.getAttribute('data-i18n-title');
            if (key) el.title = this.translate(key);
        });

        document.querySelectorAll('[data-i18n-aria-label]').forEach(el => {
            const key = el.getAttribute('data-i18n-aria-label');
            if (key) el.setAttribute('aria-label', this.translate(key));
        });
        
        document.documentElement.lang = this.currentLang;
    },

    formatDate(date, options = {}) {
        if (!date) return '';
        try {
            const d = new Date(date);
            const localeMap = { 'en': 'en-IN', 'hi': 'hi-IN', 'mr': 'mr-IN' };
            const locale = localeMap[this.currentLang] || 'en-IN';
            return d.toLocaleDateString(locale, options);
        } catch(e) {
            return date;
        }
    },

    setupLangSelectors() {
        const selectors = document.querySelectorAll('#language-selector, .language-selector');
        selectors.forEach(selector => {
            selector.value = this.currentLang;
            selector.addEventListener('change', (e) => {
                this.setLanguage(e.target.value);
            });
        });
    }
};

window.i18n = window.I18n;
