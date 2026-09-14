const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, '..', '..', 'frontend', 'pages');
const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.html'));

const NAV_CONFIG = [
  { section: 'nav_main', label: 'Main' },
  { href: 'dashboard.html', i18n: 'nav_dashboard', label: '📊 Dashboard' },
  { href: 'farms.html', i18n: 'nav_farms', label: '🌾 My Farms' },
  { href: 'crop-recommendation.html', i18n: 'nav_crops', label: '🌱 Crop Recommendation' },
  { href: 'farm-planner.html', i18n: 'nav_planner', label: '📅 Farm Planner' },
  { href: 'ai-assistant.html', i18n: 'nav_ai', label: '🤖 AI Assistant' },
  { section: 'nav_information', label: 'Information' },
  { href: 'weather.html', i18n: 'nav_weather', label: '🌤️ Weather' },
  { href: 'market-prices.html', i18n: 'nav_market', label: '📈 Market Prices' },
  { href: 'pests-diseases.html', i18n: 'nav_pests', label: '🐛 Pests & Diseases' },
  { href: 'fertilizer-guide.html', i18n: 'nav_fertilizer', label: '🧪 Fertilizer Guide' },
  { href: 'cultivation-guides.html', i18n: 'nav_guides', label: '📖 Cultivation Guides' },
  { href: 'advisories.html', i18n: 'nav_advisories', label: '📢 Advisories' },
  { href: 'schemes.html', i18n: 'nav_schemes', label: '🏛️ Government Schemes' },
  { section: 'nav_account', label: 'Account' },
  { href: 'notifications.html', i18n: 'nav_notifications', label: '🔔 Notifications' },
  { href: 'profile.html', i18n: 'nav_profile', label: '👤 Profile' },
  { section: 'nav_expert', label: 'Expert', extraClass: 'expert-only' },
  { href: 'expert-dashboard.html', i18n: 'nav_expert_dashboard', label: '🎓 Expert Dashboard', extraClass: 'expert-only' },
  { section: 'nav_admin', label: 'Admin', extraClass: 'admin-only' },
  { href: 'admin-dashboard.html', i18n: 'nav_admin_dashboard', label: '🛡️ Admin Dashboard', extraClass: 'admin-only' },
  { href: 'admin-crud.html', i18n: 'nav_admin_crud', label: '📋 Manage Data', extraClass: 'admin-only' }
];

const FONT_LINKS = `  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Mukta:wght@400;500;600;700&display=swap" rel="stylesheet">`;

files.forEach(file => {
  const filePath = path.join(pagesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Add Mukta font if not present
  if (!content.includes('family=Mukta')) {
    content = content.replace('</head>', `${FONT_LINKS}\n</head>`);
  }

  // Check if page has a sidebar
  if (!content.includes('<nav class="sidebar-nav">')) {
    fs.writeFileSync(filePath, content, 'utf8');
    return;
  }

  // Build localized sidebar for this page
  let navHtml = '      <nav class="sidebar-nav">\n';
  NAV_CONFIG.forEach(item => {
    if (item.section) {
      const cls = item.extraClass ? `nav-section ${item.extraClass}` : 'nav-section';
      navHtml += `        <div class="${cls}" data-i18n="${item.section}">${item.label}</div>\n`;
    } else {
      const isActive = file === item.href;
      let cls = 'nav-item';
      if (item.extraClass) cls += ` ${item.extraClass}`;
      if (isActive) cls += ' active';
      navHtml += `        <a href="${item.href}" class="${cls}" data-i18n="${item.i18n}">${item.label}</a>\n`;
    }
  });
  navHtml += '      </nav>\n      <div class="sidebar-footer">\n        <button class="logout-btn" id="logout-btn" data-i18n="logout">🚪 Logout</button>\n      </div>';

  // Replace sidebar nav and footer
  const sidebarRegex = /<nav class="sidebar-nav">[\s\S]*?<\/div>[\s]*<\/aside>/;
  if (sidebarRegex.test(content)) {
    content = content.replace(sidebarRegex, `${navHtml}\n    </aside>`);
  }

  // Also ensure page-title has data-i18n
  const currentNav = NAV_CONFIG.find(i => i.href === file);
  if (currentNav) {
    content = content.replace(/<h2 class="page-title">([^<]+)<\/h2>/, `<h2 class="page-title" data-i18n="${currentNav.i18n}">$1</h2>`);
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Standardized sidebar & font for ${file}`);
});

// Also add Mukta font to frontend/index.html
const indexHtmlPath = path.join(__dirname, '..', '..', 'frontend', 'index.html');
if (fs.existsSync(indexHtmlPath)) {
  let indexContent = fs.readFileSync(indexHtmlPath, 'utf8');
  if (!indexContent.includes('family=Mukta')) {
    indexContent = indexContent.replace('</head>', `${FONT_LINKS}\n</head>`);
    fs.writeFileSync(indexHtmlPath, indexContent, 'utf8');
    console.log('Added Mukta font to index.html');
  }
}
