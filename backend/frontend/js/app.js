// js/app.js - Central application initialization

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Init Theme
    if (window.Theme) window.Theme.init();
    
    // 2. Init i18n
    if (window.I18n) await window.I18n.init();
    
    // 3. Determine page context
    const pagePath = window.location.pathname;
    const pageName = pagePath.split('/').pop().replace('.html', '') || 'index';
    const publicPages = ['login', 'register', 'index', 'forgot-password', 'reset-password', ''];
    const isPublicPage = publicPages.includes(pageName);
    const isAdminPage = pageName.startsWith('admin');
    const isExpertPage = pageName.startsWith('expert');
    
    // 4. Auth check for protected pages
    if (!isPublicPage && window.Auth) {
        if (!window.Auth.checkAuth()) return;
        
        // Role-based access control
        const user = window.Auth.getUser();
        if (isAdminPage && user && user.role !== 'admin') {
            window.Utils && window.Utils.showToast('Access denied: Admin only', 'error');
            window.location.href = '/pages/dashboard.html';
            return;
        }
        if (isExpertPage && user && !['expert', 'admin'].includes(user.role)) {
            window.Utils && window.Utils.showToast('Access denied: Expert only', 'error');
            window.location.href = '/pages/dashboard.html';
            return;
        }
        
        // Setup authenticated UI
        setupTopbar();
        setupRoleVisibility();
    }
    
    // 5. Init Auth form handlers (login/register/forgot/reset)
    if (window.Auth) window.Auth.init();
    
    // 6. Setup Sidebar
    setupSidebar();
    
    // 7. Mobile Navigation
    setupMobileNav();

    // 8. Page-specific init
    const moduleAliases = {
        'crop-recommendation': 'crops',
        'farm-planner': 'planner',
        'fertilizer-guide': 'fertilizer',
        'cultivation-guides': 'guides',
        'pests-diseases': 'pests',
        'market-prices': 'market',
        'ai-assistant': 'aiChat',
        'admin-dashboard': 'admin',
        'admin-crud': 'adminCrud',
        'expert-dashboard': 'expert'
    };
    const resolvedKey = (window.PageModules && window.PageModules[pageName])
        ? pageName
        : (moduleAliases[pageName] && window.PageModules && window.PageModules[moduleAliases[pageName]] ? moduleAliases[pageName] : null);

    if (resolvedKey && window.PageModules && window.PageModules[resolvedKey]) {
        try {
            await window.PageModules[resolvedKey].init();
        } catch(err) {
            console.error(`Error initializing page module "${resolvedKey}":`, err);
        }
    }
});

function setupTopbar() {
    const user = window.Auth.getUser();
    if (!user) return;
    
    // Set username
    const userNameEl = document.getElementById('topbar-username');
    if (userNameEl) userNameEl.textContent = user.name;
    
    // Set avatar initial
    const avatarEl = document.getElementById('topbar-avatar');
    if (avatarEl) {
        if (user.profileImage) {
            avatarEl.innerHTML = `<img src="${user.profileImage}" alt="${user.name}" style="width:100%;height:100%;object-fit:cover;border-radius:50%">`;
        } else {
            avatarEl.textContent = (user.name || 'U').charAt(0).toUpperCase();
        }
    }
    
    // Fetch notifications count
    if (window.API) {
        window.API.get('/notifications/unread-count')
            .then(result => {
                const count = result.count || (result.data && result.data.count) || 0;
                const badges = document.querySelectorAll('.notification-badge');
                badges.forEach(badge => {
                    badge.textContent = count > 99 ? '99+' : count;
                    badge.style.display = count > 0 ? 'inline-flex' : 'none';
                });
            }).catch(() => {});
    }
}

function setupRoleVisibility() {
    const user = window.Auth.getUser();
    if (!user) return;
    
    // Show/hide admin-only items
    document.querySelectorAll('.admin-only').forEach(el => {
        el.style.display = user.role === 'admin' ? '' : 'none';
    });
    
    // Show/hide expert-only items
    document.querySelectorAll('.expert-only').forEach(el => {
        el.style.display = ['expert', 'admin'].includes(user.role) ? '' : 'none';
    });
}

function setupSidebar() {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.sidebar-nav a, .sidebar-nav .nav-item');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href') || '';
        if (href === currentPath) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

function setupMobileNav() {
    const hamburger = document.getElementById('hamburger');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    
    if (hamburger && sidebar) {
        hamburger.addEventListener('click', () => {
            sidebar.classList.toggle('open');
            if (overlay) overlay.classList.toggle('active');
        });
    }
    
    if (overlay && sidebar) {
        overlay.addEventListener('click', () => {
            sidebar.classList.remove('open');
            overlay.classList.remove('active');
        });
    }
}

// Global store for page modules
window.PageModules = window.PageModules || {};
