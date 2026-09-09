// Build script to generate all HTML pages with proper structure
// Run: node build-pages.js
const fs = require('fs');
const path = require('path');

const PAGES_DIR = path.join(__dirname, '..', 'frontend', 'pages');

// Common sidebar HTML for authenticated pages
const SIDEBAR = `    <aside class="sidebar" id="sidebar">
      <div class="sidebar-logo">🌱 Krishi Sahayak</div>
      <nav class="sidebar-nav">
        <div class="nav-section">Main</div>
        <a href="dashboard.html" class="nav-item">📊 Dashboard</a>
        <a href="farms.html" class="nav-item">🌾 My Farms</a>
        <a href="crop-recommendation.html" class="nav-item">🌱 Crop Recommendation</a>
        <a href="farm-planner.html" class="nav-item">📅 Farm Planner</a>
        <a href="ai-assistant.html" class="nav-item">🤖 AI Assistant</a>
        <div class="nav-section">Information</div>
        <a href="weather.html" class="nav-item">🌤️ Weather</a>
        <a href="market-prices.html" class="nav-item">📈 Market Prices</a>
        <a href="pests-diseases.html" class="nav-item">🐛 Pests & Diseases</a>
        <a href="fertilizer-guide.html" class="nav-item">🧪 Fertilizer Guide</a>
        <a href="cultivation-guides.html" class="nav-item">📖 Cultivation Guides</a>
        <a href="advisories.html" class="nav-item">📢 Advisories</a>
        <div class="nav-section">Account</div>
        <a href="notifications.html" class="nav-item">🔔 Notifications</a>
        <a href="profile.html" class="nav-item">👤 Profile</a>
        <div class="nav-section expert-only">Expert</div>
        <a href="expert-dashboard.html" class="nav-item expert-only">🎓 Expert Dashboard</a>
        <div class="nav-section admin-only">Admin</div>
        <a href="admin-dashboard.html" class="nav-item admin-only">🛡️ Admin Dashboard</a>
        <a href="admin-crud.html" class="nav-item admin-only">📋 Manage Data</a>
      </nav>
      <div class="sidebar-footer">
        <button class="logout-btn" id="logout-btn">🚪 Logout</button>
      </div>
    </aside>`;

const TOPBAR = (title) => `      <header class="topbar">
        <div class="topbar-left">
          <button class="hamburger" id="hamburger">☰</button>
          <h2 class="page-title">${title}</h2>
        </div>
        <div class="topbar-right">
          <select class="language-selector" aria-label="Select Language">
            <option value="en">EN</option>
            <option value="mr">MR</option>
            <option value="hi">HI</option>
          </select>
          <button class="theme-toggle" aria-label="Toggle Theme">🌙</button>
          <a href="notifications.html" class="topbar-icon" style="text-decoration: none; position: relative;">
            🔔<span class="notification-badge" style="display:none">0</span>
          </a>
          <a href="profile.html" class="avatar" id="topbar-avatar">U</a>
        </div>
      </header>`;

// Script imports for authenticated pages  
const AUTH_SCRIPTS = `  <script src="/js/utils.js"></script>
  <script src="/js/api.js"></script>
  <script src="/js/auth.js"></script>
  <script src="/js/router.js"></script>
  <script src="/js/i18n.js"></script>
  <script src="/js/theme.js"></script>
  <script src="/js/voice.js"></script>`;

const APP_SCRIPT = `  <script src="/js/app.js"></script>`;

// Script imports for public pages (login, register, etc.)
const PUBLIC_SCRIPTS = AUTH_SCRIPTS;

function buildAuthPage(title, pageTitle, mainContent, pageModuleScript) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - Krishi Sahayak</title>
  <meta name="description" content="${title} - Smart Agriculture Platform for Indian Farmers">
  <link rel="stylesheet" href="/css/main.css">
  <link rel="stylesheet" href="/css/components.css">
  <link rel="stylesheet" href="/css/layout.css">
  <link rel="stylesheet" href="/css/responsive.css">
</head>
<body>
  <div class="app-layout">
${SIDEBAR}

    <div class="sidebar-overlay" id="sidebarOverlay"></div>

    <div class="main-wrapper">
${TOPBAR(pageTitle)}

      <main class="main-content">
${mainContent}
      </main>
    </div>
  </div>

${AUTH_SCRIPTS}
${pageModuleScript ? `  <script src="/js/pages/${pageModuleScript}"></script>` : ''}
${APP_SCRIPT}
</body>
</html>
`;
}

// ======== DASHBOARD ========
const dashboardContent = `        <div class="page-header">
          <h2 id="welcome-text">Welcome back!</h2>
          <div class="date text-secondary" id="dashboard-date"></div>
        </div>

        <div class="grid-4 mb-4" id="dashboard-stats">
          <div class="card stat-card">
            <div class="stat-icon">🌾</div>
            <div class="stat-content">
              <h3 id="stat-farms">-</h3>
              <p data-i18n="total_farms">Total Farms</p>
            </div>
          </div>
          <div class="card stat-card">
            <div class="stat-icon" style="background: var(--accent);">🌱</div>
            <div class="stat-content">
              <h3 id="stat-crops">-</h3>
              <p data-i18n="active_crops">Active Crops</p>
            </div>
          </div>
          <div class="card stat-card">
            <div class="stat-icon" style="background: var(--info);">🌤️</div>
            <div class="stat-content">
              <h3 id="stat-weather">--°C</h3>
              <p id="stat-weather-desc" data-i18n="weather">Weather</p>
            </div>
          </div>
          <div class="card stat-card">
            <div class="stat-icon" style="background: var(--warning);">⚠️</div>
            <div class="stat-content">
              <h3 id="stat-advisories">-</h3>
              <p data-i18n="new_advisory">New Advisories</p>
            </div>
          </div>
        </div>

        <div class="grid-2 mb-4">
          <div class="card">
            <h3 class="mb-3" data-i18n="quick_actions">Quick Actions</h3>
            <div class="grid-2">
              <a href="farms.html" class="btn btn-secondary w-full" data-i18n="add_farm">Add Farm</a>
              <a href="crop-recommendation.html" class="btn btn-secondary w-full" data-i18n="get_recommendation">Get Recommendation</a>
              <a href="weather.html" class="btn btn-secondary w-full" data-i18n="check_weather">Check Weather</a>
              <a href="ai-assistant.html" class="btn btn-primary w-full" data-i18n="ask_ai">Ask AI Assistant</a>
            </div>
          </div>
          <div class="card">
            <h3 class="mb-3" data-i18n="recent_advisories">Recent Advisories</h3>
            <div id="dashboard-advisories">
              <div class="empty-state"><p>Loading advisories...</p></div>
            </div>
            <a href="advisories.html" class="btn btn-outline btn-sm mt-3" data-i18n="view_all">View All</a>
          </div>
        </div>

        <div class="card">
          <h3 class="mb-3" data-i18n="recent_activities">Recent Activities</h3>
          <div class="activity-timeline" id="dashboard-activities">
            <div class="empty-state"><p>Loading activities...</p></div>
          </div>
        </div>`;

fs.writeFileSync(path.join(PAGES_DIR, 'dashboard.html'), buildAuthPage('Dashboard', 'Dashboard', dashboardContent, 'dashboard.js'));

// ======== FARMS ========
const farmsContent = `        <div class="page-header">
          <h2 data-i18n="manage_farms">Manage Your Farms</h2>
          <button class="btn btn-primary" id="add-farm-btn">➕ Add Farm</button>
        </div>

        <div class="grid-3" id="farms-container">
          <div class="empty-state"><p>Loading farms...</p></div>
        </div>
        <div id="farms-pagination"></div>`;

fs.writeFileSync(path.join(PAGES_DIR, 'farms.html'), buildAuthPage('My Farms', 'My Farms', farmsContent, 'farms.js'));

// ======== CROP RECOMMENDATION ========
const cropRecContent = `        <div class="grid-2">
          <div class="card">
            <h3 class="mb-3" data-i18n="enter_field_details">Enter Field Details</h3>
            <form id="recommendation-form">
              <div class="grid-2">
                <div class="form-group">
                  <label class="form-label" data-i18n="state">State</label>
                  <select class="form-select" name="state" required>
                    <option value="">Select State</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Gujarat">Gujarat</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Madhya Pradesh">Madhya Pradesh</option>
                    <option value="Rajasthan">Rajasthan</option>
                    <option value="Uttar Pradesh">Uttar Pradesh</option>
                    <option value="Punjab">Punjab</option>
                    <option value="Haryana">Haryana</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label" data-i18n="district">District</label>
                  <input type="text" class="form-control" name="district" placeholder="e.g. Pune">
                </div>
              </div>
              <div class="grid-2">
                <div class="form-group">
                  <label class="form-label" data-i18n="soil_type">Soil Type</label>
                  <select class="form-select" name="soilType" required>
                    <option value="alluvial">Alluvial</option>
                    <option value="black">Black</option>
                    <option value="red">Red</option>
                    <option value="laterite">Laterite</option>
                    <option value="sandy">Sandy</option>
                    <option value="loamy">Loamy</option>
                    <option value="clay">Clay</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label" data-i18n="season">Season</label>
                  <select class="form-select" name="season" required>
                    <option value="kharif">Kharif (Monsoon)</option>
                    <option value="rabi">Rabi (Winter)</option>
                    <option value="zaid">Zaid (Summer)</option>
                  </select>
                </div>
              </div>
              <div class="grid-2">
                <div class="form-group">
                  <label class="form-label" data-i18n="temperature">Temperature (°C)</label>
                  <input type="number" class="form-control" name="temperature" placeholder="e.g. 28" min="0" max="55">
                </div>
                <div class="form-group">
                  <label class="form-label" data-i18n="water_availability">Water Availability</label>
                  <select class="form-select" name="waterAvailability">
                    <option value="abundant">Abundant</option>
                    <option value="moderate">Moderate</option>
                    <option value="scarce">Scarce</option>
                  </select>
                </div>
              </div>
              <div class="grid-2">
                <div class="form-group">
                  <label class="form-label" data-i18n="irrigation_type">Irrigation Type</label>
                  <select class="form-select" name="irrigationType">
                    <option value="rainfed">Rainfed</option>
                    <option value="drip">Drip</option>
                    <option value="sprinkler">Sprinkler</option>
                    <option value="canal">Canal</option>
                    <option value="borewell">Borewell</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label" data-i18n="previous_crop">Previous Crop</label>
                  <input type="text" class="form-control" name="previousCrop" placeholder="e.g. Soybean">
                </div>
              </div>
              <button type="submit" class="btn btn-primary w-full mt-3" data-i18n="get_recommendations">Get Recommendations</button>
            </form>
          </div>

          <div class="card">
            <h3 class="mb-3" data-i18n="ai_recommendations">AI Recommendations</h3>
            <div id="recommendations-container">
              <div class="empty-state">
                <p>Fill in the form and click "Get Recommendations" to see AI-powered crop suggestions.</p>
              </div>
            </div>
          </div>
        </div>`;

fs.writeFileSync(path.join(PAGES_DIR, 'crop-recommendation.html'), buildAuthPage('Crop Recommendation', 'Crop Recommendation AI', cropRecContent, 'crops.js'));

// ======== WEATHER ========
const weatherContent = `        <div id="weather-container">
          <div class="card weather-card mb-4" id="current-weather" style="background: linear-gradient(135deg, #4CAF50, #1B5E20); color: white;">
            <h3 class="mb-2" id="weather-location">Loading location...</h3>
            <p id="weather-time"></p>
            <div class="weather-temp my-3" style="color: white; font-size: 4rem;" id="weather-temp">--°C</div>
            <h4 id="weather-desc">Loading...</h4>
            <div class="grid-4 mt-4 text-center">
              <div>
                <div style="color: #eee;">Humidity</div>
                <div id="weather-humidity">--%</div>
              </div>
              <div>
                <div style="color: #eee;">Wind</div>
                <div id="weather-wind">-- km/h</div>
              </div>
              <div>
                <div style="color: #eee;">Pressure</div>
                <div id="weather-pressure">-- hPa</div>
              </div>
              <div>
                <div style="color: #eee;">Clouds</div>
                <div id="weather-clouds">--%</div>
              </div>
            </div>
          </div>

          <h3 class="mb-3" data-i18n="forecast">5-Day Forecast</h3>
          <div id="forecast-container" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem;">
            <div class="empty-state"><p>Loading forecast...</p></div>
          </div>
          <p class="text-secondary text-sm mt-3" id="weather-source"></p>
        </div>`;

fs.writeFileSync(path.join(PAGES_DIR, 'weather.html'), buildAuthPage('Weather', 'Weather Forecast', weatherContent, 'weather.js'));

// ======== MARKET PRICES ========
const marketContent = `        <div class="card mb-4">
          <div class="grid-4">
            <div class="form-group">
              <label class="form-label" data-i18n="search">Search</label>
              <input type="text" class="form-control" id="market-search" placeholder="Search crop...">
            </div>
            <div class="form-group">
              <label class="form-label" data-i18n="state">State</label>
              <input type="text" class="form-control" id="market-state" placeholder="e.g. Maharashtra">
            </div>
            <div class="form-group">
              <label class="form-label" data-i18n="sort_by">Sort By</label>
              <select class="form-select" id="market-sort">
                <option value="">Default</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="date_desc">Date: Newest</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">&nbsp;</label>
              <button class="btn btn-primary w-full" id="market-search-btn" data-i18n="search">Search</button>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="table-responsive">
            <table>
              <thead>
                <tr>
                  <th data-i18n="commodity">Commodity</th>
                  <th data-i18n="market">Market</th>
                  <th data-i18n="min_price">Min Price</th>
                  <th data-i18n="max_price">Max Price</th>
                  <th data-i18n="modal_price">Modal Price</th>
                  <th data-i18n="unit">Unit</th>
                  <th data-i18n="date">Date</th>
                </tr>
              </thead>
              <tbody id="market-tbody">
                <tr><td colspan="7" class="text-center">Loading market prices...</td></tr>
              </tbody>
            </table>
          </div>
          <div id="market-pagination"></div>
        </div>`;

fs.writeFileSync(path.join(PAGES_DIR, 'market-prices.html'), buildAuthPage('Market Prices', 'Market Prices (Mandi Bhav)', marketContent, 'market.js'));

// ======== PESTS & DISEASES ========
const pestsContent = `        <div class="tabs mb-4" id="pest-tabs">
          <div class="tab-item active" data-tab="pests" data-i18n="pests">Pests</div>
          <div class="tab-item" data-tab="diseases" data-i18n="diseases">Diseases</div>
        </div>

        <div class="grid-2 mb-4">
          <div class="form-group">
            <input type="text" class="form-control" id="pest-search" placeholder="Search pests or diseases...">
          </div>
          <div class="form-group">
            <select class="form-select" id="pest-crop-filter">
              <option value="">Filter by Crop: All</option>
            </select>
          </div>
        </div>

        <div class="grid-3" id="pests-container">
          <div class="empty-state"><p>Loading...</p></div>
        </div>
        <div id="pests-pagination"></div>`;

fs.writeFileSync(path.join(PAGES_DIR, 'pests-diseases.html'), buildAuthPage('Pests & Diseases', 'Pests & Diseases Library', pestsContent, 'pests.js'));

// ======== FERTILIZER GUIDE ========
const fertilizerContent = `        <div class="grid-2 mb-4">
          <div class="form-group">
            <input type="text" class="form-control" id="fertilizer-search" placeholder="Search fertilizer guides...">
          </div>
          <div class="form-group">
            <select class="form-select" id="fertilizer-crop-filter">
              <option value="">Filter by Crop: All</option>
            </select>
          </div>
        </div>

        <div class="grid-3" id="fertilizer-container">
          <div class="empty-state"><p>Loading fertilizer guides...</p></div>
        </div>
        <div id="fertilizer-pagination"></div>`;

fs.writeFileSync(path.join(PAGES_DIR, 'fertilizer-guide.html'), buildAuthPage('Fertilizer Guide', 'Fertilizer Guide', fertilizerContent, 'fertilizer.js'));

// ======== CULTIVATION GUIDES ========
const guidesContent = `        <div class="grid-2 mb-4">
          <div class="form-group">
            <input type="text" class="form-control" id="guide-search" placeholder="Search cultivation guides...">
          </div>
          <div class="form-group">
            <select class="form-select" id="guide-crop-filter">
              <option value="">Filter by Crop: All</option>
            </select>
          </div>
        </div>

        <div class="grid-3" id="guides-container">
          <div class="empty-state"><p>Loading cultivation guides...</p></div>
        </div>
        <div id="guides-pagination"></div>`;

fs.writeFileSync(path.join(PAGES_DIR, 'cultivation-guides.html'), buildAuthPage('Cultivation Guides', 'Cultivation Guides', guidesContent, 'guides.js'));

// ======== ADVISORIES ========
const advisoriesContent = `        <div class="form-group mb-4">
          <input type="text" class="form-control" id="advisory-search" placeholder="Search advisories...">
        </div>

        <div id="advisories-container">
          <div class="empty-state"><p>Loading advisories...</p></div>
        </div>
        <div id="advisories-pagination"></div>`;

fs.writeFileSync(path.join(PAGES_DIR, 'advisories.html'), buildAuthPage('Advisories', 'Agricultural Advisories', advisoriesContent, 'advisories.js'));

// ======== NOTIFICATIONS ========
const notificationsContent = `        <div class="page-header">
          <h2 data-i18n="notifications">Notifications</h2>
          <button class="btn btn-secondary" id="mark-all-read-btn" data-i18n="mark_all_read">Mark All Read</button>
        </div>

        <div id="notifications-container">
          <div class="empty-state"><p>Loading notifications...</p></div>
        </div>
        <div id="notifications-pagination"></div>`;

fs.writeFileSync(path.join(PAGES_DIR, 'notifications.html'), buildAuthPage('Notifications', 'Notifications', notificationsContent, 'notifications.js'));

// ======== PROFILE ========
const profileContent = `        <div class="grid-2">
          <div class="card">
            <div class="text-center mb-4">
              <div class="avatar" id="profile-avatar" style="width: 100px; height: 100px; font-size: 3rem; margin: 0 auto 1rem;">U</div>
              <h3 id="profile-name">Loading...</h3>
              <p class="text-secondary" id="profile-email"></p>
              <div class="mt-2">
                <input type="file" id="profile-image-input" accept="image/*" style="display:none">
                <button class="btn btn-outline btn-sm" id="change-picture-btn" data-i18n="change_picture">Change Picture</button>
              </div>
            </div>
          </div>
          
          <div class="card">
            <h3 class="mb-4" data-i18n="personal_info">Personal Information</h3>
            <form id="profile-form">
              <div class="grid-2">
                <div class="form-group">
                  <label class="form-label" data-i18n="full_name">Full Name</label>
                  <input type="text" class="form-control" name="name" id="profile-name-input">
                </div>
                <div class="form-group">
                  <label class="form-label" data-i18n="mobile">Mobile</label>
                  <input type="text" class="form-control" name="mobile" id="profile-mobile">
                </div>
              </div>
              <div class="form-group">
                <label class="form-label" data-i18n="email">Email (Read Only)</label>
                <input type="email" class="form-control" id="profile-email-ro" readonly style="background: var(--bg-color);">
              </div>
              <div class="grid-2">
                <div class="form-group">
                  <label class="form-label" data-i18n="state">State</label>
                  <input type="text" class="form-control" name="state" id="profile-state">
                </div>
                <div class="form-group">
                  <label class="form-label" data-i18n="district">District</label>
                  <input type="text" class="form-control" name="district" id="profile-district">
                </div>
              </div>
              <div class="grid-2">
                <div class="form-group">
                  <label class="form-label" data-i18n="village">Village</label>
                  <input type="text" class="form-control" name="village" id="profile-village">
                </div>
                <div class="form-group">
                  <label class="form-label" data-i18n="pref_lang">Language</label>
                  <select class="form-select" name="language" id="profile-language">
                    <option value="en">English</option>
                    <option value="mr">मराठी (Marathi)</option>
                    <option value="hi">हिंदी (Hindi)</option>
                  </select>
                </div>
              </div>
              
              <div class="flex gap-2 mt-4">
                <button type="submit" class="btn btn-primary" data-i18n="save_changes">Save Changes</button>
                <button type="button" class="btn btn-secondary" id="change-password-btn" data-i18n="change_password">Change Password</button>
              </div>
            </form>
          </div>
        </div>`;

fs.writeFileSync(path.join(PAGES_DIR, 'profile.html'), buildAuthPage('Profile', 'Profile', profileContent, 'profile.js'));

// ======== FARM PLANNER ========
const plannerContent = `        <div class="page-header">
          <h2 data-i18n="farm_planner">Farm Activity Planner</h2>
          <div class="flex gap-2">
            <button class="btn btn-secondary" id="generate-plan-btn" data-i18n="generate_plan">Auto-Generate Plan</button>
            <button class="btn btn-primary" id="add-activity-btn" data-i18n="add_activity">➕ Add Activity</button>
          </div>
        </div>

        <div class="card mb-4">
          <div class="grid-4">
            <div class="form-group">
              <label class="form-label" data-i18n="filter_farm">Farm</label>
              <select class="form-select" id="planner-farm-filter">
                <option value="">All Farms</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label" data-i18n="filter_status">Status</label>
              <select class="form-select" id="planner-status-filter">
                <option value="">All</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label" data-i18n="filter_type">Type</label>
              <select class="form-select" id="planner-type-filter">
                <option value="">All Types</option>
                <option value="land_preparation">Land Preparation</option>
                <option value="sowing">Sowing</option>
                <option value="irrigation">Irrigation</option>
                <option value="fertilizing">Fertilizing</option>
                <option value="weeding">Weeding</option>
                <option value="pest_monitoring">Pest Monitoring</option>
                <option value="harvesting">Harvesting</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">&nbsp;</label>
              <button class="btn btn-secondary w-full" id="planner-filter-btn" data-i18n="filter">Filter</button>
            </div>
          </div>
        </div>

        <div id="activities-container">
          <div class="empty-state"><p>Loading activities...</p></div>
        </div>
        <div id="activities-pagination"></div>`;

fs.writeFileSync(path.join(PAGES_DIR, 'farm-planner.html'), buildAuthPage('Farm Planner', 'Farm Activity Planner', plannerContent, 'planner.js'));

// ======== AI ASSISTANT ========
const aiContent = `        <div class="disclaimer" data-i18n="ai_disclaimer">
          AI advice is generated automatically. Please verify critical information with local agricultural experts.
        </div>
        
        <div class="chat-container" style="flex: 1; margin-bottom: 1.5rem; height: 500px;">
          <div class="chat-messages" id="chat-messages">
            <div class="chat-bubble assistant" data-i18n="ai_greeting">
              Namaste! I am your Krishi Sahayak AI Assistant. How can I help you with your farming today? You can ask about crops, pests, fertilizers, or weather.
            </div>
          </div>
          <div class="chat-input">
            <input type="file" id="chat-image-input" accept="image/*" style="display:none">
            <button class="btn btn-icon" id="chat-image-btn" style="background: var(--bg-color); border: 1px solid var(--border-color);" title="Upload Image">📷</button>
            <input type="text" class="form-control" id="chat-input" placeholder="Type your message..." style="flex: 1;">
            <button class="btn voice-btn" id="chat-voice-btn" title="Voice Input">🎤</button>
            <button class="btn btn-primary" id="chat-send-btn" data-i18n="send">Send</button>
          </div>
        </div>`;

fs.writeFileSync(path.join(PAGES_DIR, 'ai-assistant.html'), buildAuthPage('AI Assistant', 'Krishi AI Assistant', aiContent, 'ai-chat.js'));

// ======== EXPERT DASHBOARD ========
const expertContent = `        <div class="page-header">
          <h2 data-i18n="expert_dashboard">Expert Dashboard</h2>
          <button class="btn btn-primary" id="publish-guidance-btn" data-i18n="publish_guidance">Publish Guidance</button>
        </div>

        <div class="card mb-4">
          <h3 class="mb-3" data-i18n="farmer_queries">Farmer Queries</h3>
          <div id="expert-queries-container">
            <div class="empty-state"><p>Loading queries...</p></div>
          </div>
          <div id="expert-queries-pagination"></div>
        </div>`;

fs.writeFileSync(path.join(PAGES_DIR, 'expert-dashboard.html'), buildAuthPage('Expert Dashboard', 'Expert Dashboard', expertContent, 'expert.js'));

// ======== ADMIN DASHBOARD ========
const adminDashContent = `        <div class="page-header">
          <h2 data-i18n="admin_overview">System Overview</h2>
        </div>

        <div class="grid-4 mb-4" id="admin-stats">
          <div class="card stat-card"><div class="stat-content"><h3 id="admin-stat-farmers">-</h3><p>Total Farmers</p></div></div>
          <div class="card stat-card"><div class="stat-content"><h3 id="admin-stat-experts">-</h3><p>Verified Experts</p></div></div>
          <div class="card stat-card"><div class="stat-content"><h3 id="admin-stat-farms">-</h3><p>Total Farms</p></div></div>
          <div class="card stat-card"><div class="stat-content"><h3 id="admin-stat-crops">-</h3><p>Active Crops</p></div></div>
          <div class="card stat-card"><div class="stat-content"><h3 id="admin-stat-market">-</h3><p>Market Records</p></div></div>
          <div class="card stat-card"><div class="stat-content"><h3 id="admin-stat-advisories">-</h3><p>Active Advisories</p></div></div>
          <div class="card stat-card"><div class="stat-content"><h3 id="admin-stat-active">-</h3><p>Active Users (7d)</p></div></div>
          <div class="card stat-card"><div class="stat-content"><h3 id="admin-stat-db">-</h3><p>Database Status</p></div></div>
        </div>

        <h3 class="mb-3" data-i18n="management_modules">Management Modules</h3>
        <div class="grid-4">
          <a href="admin-crud.html?tab=users" class="card text-center" style="text-decoration: none; color: inherit;">
            <div style="font-size: 2rem; margin-bottom: 1rem;">👥</div><h4>Manage Users</h4>
          </a>
          <a href="admin-crud.html?tab=crops" class="card text-center" style="text-decoration: none; color: inherit;">
            <div style="font-size: 2rem; margin-bottom: 1rem;">🌱</div><h4>Manage Crops</h4>
          </a>
          <a href="admin-crud.html?tab=market" class="card text-center" style="text-decoration: none; color: inherit;">
            <div style="font-size: 2rem; margin-bottom: 1rem;">📈</div><h4>Market Prices</h4>
          </a>
          <a href="admin-crud.html?tab=pests" class="card text-center" style="text-decoration: none; color: inherit;">
            <div style="font-size: 2rem; margin-bottom: 1rem;">🐛</div><h4>Pests & Diseases</h4>
          </a>
          <a href="admin-crud.html?tab=fertilizers" class="card text-center" style="text-decoration: none; color: inherit;">
            <div style="font-size: 2rem; margin-bottom: 1rem;">🧪</div><h4>Fertilizer Guides</h4>
          </a>
          <a href="admin-crud.html?tab=guides" class="card text-center" style="text-decoration: none; color: inherit;">
            <div style="font-size: 2rem; margin-bottom: 1rem;">📖</div><h4>Cultivation Guides</h4>
          </a>
          <a href="admin-crud.html?tab=advisories" class="card text-center" style="text-decoration: none; color: inherit;">
            <div style="font-size: 2rem; margin-bottom: 1rem;">📢</div><h4>Advisories</h4>
          </a>
          <a href="admin-crud.html?tab=audit" class="card text-center" style="text-decoration: none; color: inherit;">
            <div style="font-size: 2rem; margin-bottom: 1rem;">📋</div><h4>Audit Logs</h4>
          </a>
        </div>`;

fs.writeFileSync(path.join(PAGES_DIR, 'admin-dashboard.html'), buildAuthPage('Admin Dashboard', 'Admin Dashboard', adminDashContent, 'admin.js'));

// ======== ADMIN CRUD ========
const adminCrudContent = `        <div class="tabs mb-4" id="crud-tabs" style="overflow-x: auto; white-space: nowrap;">
          <div class="tab-item" data-tab="users">Users</div>
          <div class="tab-item" data-tab="crops">Crops</div>
          <div class="tab-item" data-tab="market">Market Prices</div>
          <div class="tab-item" data-tab="pests">Pests</div>
          <div class="tab-item" data-tab="diseases">Diseases</div>
          <div class="tab-item" data-tab="fertilizers">Fertilizers</div>
          <div class="tab-item" data-tab="guides">Guides</div>
          <div class="tab-item" data-tab="advisories">Advisories</div>
          <div class="tab-item" data-tab="audit">Audit Logs</div>
        </div>

        <div class="card">
          <div class="flex justify-between align-center mb-3">
            <div class="search-bar" style="width: 300px;">
              <input type="text" class="form-control" id="crud-search" placeholder="Search...">
            </div>
            <button class="btn btn-primary" id="crud-add-btn">➕ Add New</button>
          </div>

          <div class="table-responsive">
            <table>
              <thead id="crud-thead"><tr><td>Loading...</td></tr></thead>
              <tbody id="crud-tbody"><tr><td>Loading...</td></tr></tbody>
            </table>
          </div>
          <div id="crud-pagination"></div>
        </div>`;

fs.writeFileSync(path.join(PAGES_DIR, 'admin-crud.html'), buildAuthPage('Data Management', 'Data Management (CRUD)', adminCrudContent, 'admin-crud.js'));

// ======== PUBLIC PAGES ========

// LOGIN
const loginHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Login - Krishi Sahayak</title>
  <meta name="description" content="Login to Krishi Sahayak - Smart Agriculture Platform">
  <link rel="stylesheet" href="/css/main.css">
  <link rel="stylesheet" href="/css/components.css">
  <link rel="stylesheet" href="/css/layout.css">
  <link rel="stylesheet" href="/css/responsive.css">
</head>
<body style="display: flex; align-items: center; justify-content: center; min-height: 100vh;">
  
  <div class="card" style="width: 100%; max-width: 400px;">
    <div class="text-center mb-4">
      <h1 style="color: var(--primary); margin-bottom: 0;">🌱 Krishi Sahayak</h1>
      <p class="text-secondary" data-i18n="login_tagline">Smart Farming, Better Future</p>
    </div>
    
    <form id="login-form">
      <div class="form-group">
        <label for="email" class="form-label" data-i18n="email">Email</label>
        <input type="email" id="email" name="email" class="form-control" required>
      </div>
      <div class="form-group">
        <label for="password" class="form-label" data-i18n="password">Password</label>
        <input type="password" id="password" name="password" class="form-control" required>
      </div>
      
      <button type="submit" class="btn btn-primary w-full mb-3" data-i18n="login_btn">Login</button>
      
      <div class="text-center mb-2">
        <a href="forgot-password.html" data-i18n="forgot_pwd">Forgot Password?</a>
      </div>
      <div class="text-center">
        <span class="text-secondary" data-i18n="no_account">Don't have an account?</span> 
        <a href="register.html" data-i18n="register_link">Register</a>
      </div>
    </form>
    
    <div class="text-center mt-4 pt-3" style="border-top: 1px solid var(--border-color);">
      <select class="language-selector" aria-label="Select Language">
        <option value="en">English</option>
        <option value="mr">मराठी</option>
        <option value="hi">हिंदी</option>
      </select>
      <button class="theme-toggle" aria-label="Toggle Theme" style="margin-left: 1rem;">🌙</button>
    </div>
  </div>

${PUBLIC_SCRIPTS}
${APP_SCRIPT}
</body>
</html>
`;
fs.writeFileSync(path.join(PAGES_DIR, 'login.html'), loginHtml);

// REGISTER
const registerHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Register - Krishi Sahayak</title>
  <meta name="description" content="Create an account on Krishi Sahayak">
  <link rel="stylesheet" href="/css/main.css">
  <link rel="stylesheet" href="/css/components.css">
  <link rel="stylesheet" href="/css/layout.css">
  <link rel="stylesheet" href="/css/responsive.css">
</head>
<body style="display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 2rem 1rem;">
  
  <div class="card" style="width: 100%; max-width: 600px;">
    <div class="text-center mb-4">
      <h2 style="color: var(--primary);" data-i18n="create_account">Create an Account</h2>
    </div>
    
    <form id="register-form">
      <div class="grid-2">
        <div class="form-group">
          <label for="name" class="form-label" data-i18n="full_name">Full Name</label>
          <input type="text" id="name" name="name" class="form-control" required>
        </div>
        <div class="form-group">
          <label for="mobile" class="form-label" data-i18n="mobile">Mobile Number</label>
          <input type="tel" id="mobile" name="mobile" class="form-control">
        </div>
      </div>
      
      <div class="form-group">
        <label for="email" class="form-label" data-i18n="email">Email</label>
        <input type="email" id="email" name="email" class="form-control" required>
      </div>
      
      <div class="grid-2">
        <div class="form-group">
          <label for="password" class="form-label" data-i18n="password">Password</label>
          <input type="password" id="password" name="password" class="form-control" minlength="8" required>
        </div>
        <div class="form-group">
          <label for="confirm_pwd" class="form-label" data-i18n="confirm_pwd">Confirm Password</label>
          <input type="password" id="confirm_pwd" name="confirm_password" class="form-control" required>
        </div>
      </div>
      
      <div class="grid-2">
        <div class="form-group">
          <label for="state" class="form-label" data-i18n="state">State</label>
          <select id="state" name="state" class="form-select">
            <option value="">Select State</option>
            <option value="Maharashtra">Maharashtra</option>
            <option value="Gujarat">Gujarat</option>
            <option value="Karnataka">Karnataka</option>
            <option value="Madhya Pradesh">Madhya Pradesh</option>
            <option value="Rajasthan">Rajasthan</option>
            <option value="Uttar Pradesh">Uttar Pradesh</option>
            <option value="Punjab">Punjab</option>
            <option value="Haryana">Haryana</option>
            <option value="Tamil Nadu">Tamil Nadu</option>
            <option value="Andhra Pradesh">Andhra Pradesh</option>
            <option value="Telangana">Telangana</option>
            <option value="Bihar">Bihar</option>
            <option value="West Bengal">West Bengal</option>
            <option value="Odisha">Odisha</option>
          </select>
        </div>
        <div class="form-group">
          <label for="district" class="form-label" data-i18n="district">District</label>
          <input type="text" id="district" name="district" class="form-control">
        </div>
      </div>
      
      <div class="grid-2">
        <div class="form-group">
          <label for="village" class="form-label" data-i18n="village">Village</label>
          <input type="text" id="village" name="village" class="form-control">
        </div>
        <div class="form-group">
          <label for="language" class="form-label" data-i18n="pref_lang">Preferred Language</label>
          <select id="language" name="language" class="form-select">
            <option value="en">English</option>
            <option value="mr">मराठी (Marathi)</option>
            <option value="hi">हिंदी (Hindi)</option>
          </select>
        </div>
      </div>
      
      <button type="submit" class="btn btn-primary w-full mb-3 mt-2" data-i18n="register_btn">Register</button>
      
      <div class="text-center">
        <span class="text-secondary" data-i18n="has_account">Already have an account?</span> 
        <a href="login.html" data-i18n="login_link">Login</a>
      </div>
    </form>
  </div>

${PUBLIC_SCRIPTS}
${APP_SCRIPT}
</body>
</html>
`;
fs.writeFileSync(path.join(PAGES_DIR, 'register.html'), registerHtml);

// FORGOT PASSWORD
const forgotHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Forgot Password - Krishi Sahayak</title>
  <link rel="stylesheet" href="/css/main.css">
  <link rel="stylesheet" href="/css/components.css">
  <link rel="stylesheet" href="/css/layout.css">
  <link rel="stylesheet" href="/css/responsive.css">
</head>
<body style="display: flex; align-items: center; justify-content: center; min-height: 100vh;">
  
  <div class="card" style="width: 100%; max-width: 400px;">
    <div class="text-center mb-4">
      <h2 style="color: var(--primary);" data-i18n="forgot_password">Forgot Password</h2>
      <p class="text-secondary">Enter your email to reset your password.</p>
    </div>
    
    <form id="forgot-form">
      <div class="form-group">
        <label for="email" class="form-label" data-i18n="email">Email</label>
        <input type="email" id="email" name="email" class="form-control" required>
      </div>
      
      <button type="submit" class="btn btn-primary w-full mb-3" data-i18n="send_reset_link">Send Reset Link</button>
      
      <div class="text-center">
        <a href="login.html" data-i18n="back_to_login">Back to Login</a>
      </div>
    </form>
  </div>

${PUBLIC_SCRIPTS}
${APP_SCRIPT}
</body>
</html>
`;
fs.writeFileSync(path.join(PAGES_DIR, 'forgot-password.html'), forgotHtml);

// RESET PASSWORD
const resetHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Password - Krishi Sahayak</title>
  <link rel="stylesheet" href="/css/main.css">
  <link rel="stylesheet" href="/css/components.css">
  <link rel="stylesheet" href="/css/layout.css">
  <link rel="stylesheet" href="/css/responsive.css">
</head>
<body style="display: flex; align-items: center; justify-content: center; min-height: 100vh;">
  
  <div class="card" style="width: 100%; max-width: 400px;">
    <div class="text-center mb-4">
      <h2 style="color: var(--primary);" data-i18n="reset_password">Reset Password</h2>
      <p class="text-secondary">Enter your new password.</p>
    </div>
    
    <form id="reset-form">
      <div class="form-group">
        <label for="pwd" class="form-label" data-i18n="new_password">New Password</label>
        <input type="password" id="pwd" name="password" class="form-control" minlength="8" required>
      </div>
      <div class="form-group">
        <label for="cpwd" class="form-label" data-i18n="confirm_pwd">Confirm Password</label>
        <input type="password" id="cpwd" name="confirmPassword" class="form-control" required>
      </div>
      
      <button type="submit" class="btn btn-primary w-full mb-3" data-i18n="reset_password">Reset Password</button>
    </form>
  </div>

${PUBLIC_SCRIPTS}
${APP_SCRIPT}
</body>
</html>
`;
fs.writeFileSync(path.join(PAGES_DIR, 'reset-password.html'), resetHtml);

console.log('All HTML pages generated successfully!');
