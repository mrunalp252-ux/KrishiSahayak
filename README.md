# Krishi Sahayak (कृषी सहायक) 🌾

Krishi Sahayak is a digital agriculture platform purpose-built for Indian farmers, specifically tailored with deep regional agronomic data for Maharashtra and national agricultural standards. It delivers localized step-by-step crop cultivation guides, hyper-local weather with agromet advisories, verified government subsidies and schemes, an AI Plant Doctor, farm activity planning, and real-time mandi prices in **Marathi (मराठी)**, **Hindi (हिंदी)**, and **English**.

---

## 🌟 Key Features

### 1. 📖 111 Multilingual Cultivation Guides (37 Crops)
- **37 Authentic Indian & Maharashtra Crops**: Cereals (Rice, Wheat, Maize, Jowar, Bajra), Pulses (Tur, Moong, Urad, Gram), Oilseeds (Soybean, Groundnut, Mustard, Sunflower, Sesame, Safflower), Commercial & Fibers (Cotton, Sugarcane), Vegetables (Onion, Tomato, Potato, Brinjal, Okra, Cabbage, Cauliflower, Chilli, Garlic, Ginger), Spices (Turmeric, Coriander), and Fruits (Mango, Grapes, Pomegranate, Banana, Guava).
- **Strict Sequential 10-Step Scientific Cycle**: Every guide strictly starts at **Step 1** (`Step 1` / `पायरी १` / `चरण १`) and covers:
  1. Climate & Weather Requirements
  2. Soil Preparation & Tillage
  3. Seed Variety Selection & Bio-Fungicide Treatment
  4. Sowing & Spacing Specifications
  5. Water Management & Critical Irrigation Stages
  6. Balanced NPK & Micronutrient Fertilization
  7. Integrated Pest Management (IPM) & Biological Controls
  8. Disease Identification & Safe Chemical Sprays
  9. Harvesting & Maturity Indicators
  10. Post-Harvest Handling, Curing & Storage

### 2. 🏛️ Multilingual Government Schemes & Subsidies
- Fully localized portal for Central and Maharashtra State agricultural schemes:
  - **PM-KISAN** (Pradhan Mantri Kisan Samman Nidhi)
  - **PMFBY** (Pradhan Mantri Fasal Bima Yojana)
  - **Kisan Credit Card (KCC)**
  - **Soil Health Card Scheme**
  - **PM Krishi Sinchayee Yojana (PMKSY)** (Drip & Sprinkler Subsidies)
  - **MahaDBT Farmer Schemes & PoCRA** (Project on Climate Resilient Agriculture)
  - **Namo Shetkari Mahasanman Nidhi Yojana** (Maharashtra ₹6,000 top-up)
  - **Sub-Mission on Agricultural Mechanization (SMAM)**
  - **PM-KUSUM** (Solar Water Pumps)
  - **Gopinath Munde Shetkari Apghat Vima Yojana**
- Real-time language switching for titles, benefits, eligibility criteria, required documents, direct application links, and toll-free helplines.

### 3. 🤖 AI Plant Doctor & Agricultural Assistant
- Instant crop disease diagnosis with leaf photo uploads or symptoms description.
- Multi-provider AI abstraction supporting Google Gemini with automated fallback and retry mechanisms.
- Strict security against credential leakage; zero exposure of internal tokens or API keys.
- Voice-enabled query support in Marathi, Hindi, and English.

### 4. 📅 Farm Activity Planner & Expense Tracker
- Automated crop calendar generator from land preparation to harvest.
- Real-time tracking of labour expenses, seed/fertilizer inputs, and spray treatments.
- Task reminders and status tracking (Pending, In Progress, Completed).

### 5. 🌤️ Weather Forecast & Agromet Advisories
- 7-day hyperlocal forecast with temperature, humidity, rain probability, wind speed, and UV index.
- Actionable farming advisories generated for upcoming rain or drought conditions.

### 6. 📈 Real-Time Mandi Prices & APMC Rates
- Market commodity rates with minimum, maximum, and modal pricing across APMCs.

### 7. 🛡️ Robust Security & Role-Based Access Control
- JWT authentication with secure HTTP-only refresh tokens.
- Role-based authorization for Farmers, Agricultural Experts, and System Admins.
- Farmer profile inspection endpoint with strict scrubbing of password hashes and reset tokens.

---

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (zero heavy frameworks, instant loading, mobile touch-first UI, Mukta Devanagari typography).
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB with Mongoose ODM.
- **Security**: Helmet, Express Rate Limit, Express Validator, Bcrypt, XSS Filters.
- **Testing**: Jest (70 automated regression tests passing across 8 test suites), Supertest.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (running locally or a MongoDB Atlas URI)

### Local Setup
1. **Clone the repository**:
   ```bash
   git clone https://github.com/mrunalp252-ux/KrishiSahayak.git
   cd KrishiSahayak
   ```

2. **Install dependencies**:
   ```bash
   npm install
   cd backend && npm install && cd ..
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the `backend/` directory:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/krishi-sahayak
   JWT_SECRET=your-secure-jwt-secret
   JWT_REFRESH_SECRET=your-secure-refresh-secret
   AI_PROVIDER=gemini
   AI_API_KEY=your-optional-gemini-key
   FRONTEND_URL=http://localhost:5000
   ```

4. **Seed Database (37 Crops, 111 Guides, 10 Schemes)**:
   ```bash
   cd backend
   npm run seed
   cd ..
   ```

5. **Build and Run**:
   ```bash
   npm run build
   npm start
   ```
   Open `http://localhost:5000` in your web browser.

---

## 🧪 Testing

Run the automated Jest test suite:
```bash
cd backend
npm test
```
**Test Results**: 8 test suites passed, 70 tests passed (100% pass rate).

---

## 🌐 Live Production Deployment

- **Live URL**: [https://krishi-sahayak-i53i.onrender.com](https://krishi-sahayak-i53i.onrender.com)
- **Production Host**: Render (Free Tier Web Service)
- **Database**: MongoDB Atlas

---

## 📄 License
Distributed under the MIT License.
