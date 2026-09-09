// js/theme.js

window.Theme = {
    getTheme() {
        return localStorage.getItem('theme') || 'light';
    },

    setTheme(theme) {
        document.body.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        
        // Update all theme toggle buttons (supports both ID and class)
        document.querySelectorAll('#theme-toggle, .theme-toggle').forEach(btn => {
            if (theme === 'dark') {
                btn.innerHTML = '☀️';
                btn.setAttribute('title', window.I18n ? window.I18n.translate('light_mode') : 'Light Mode');
            } else {
                btn.innerHTML = '🌙';
                btn.setAttribute('title', window.I18n ? window.I18n.translate('dark_mode') : 'Dark Mode');
            }
        });
    },

    toggle() {
        const currentTheme = this.getTheme();
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
    },

    init() {
        this.setTheme(this.getTheme());
        
        // Bind all toggle buttons
        document.querySelectorAll('#theme-toggle, .theme-toggle').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggle();
            });
        });
    }
};
