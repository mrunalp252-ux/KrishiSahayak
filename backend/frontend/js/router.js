// js/router.js

window.Router = {
    navigateTo(page, params = {}) {
        let url = page;
        if (!url.endsWith('.html')) url += '.html';
        
        if (Object.keys(params).length > 0) {
            const queryString = new URLSearchParams(params).toString();
            url += '?' + queryString;
        }
        
        window.location.href = url;
    },

    getCurrentPage() {
        const path = window.location.pathname;
        const page = path.split('/').pop();
        if (!page) return 'index';
        return page.replace('.html', '');
    }
};
