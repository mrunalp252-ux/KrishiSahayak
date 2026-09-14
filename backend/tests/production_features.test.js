const request = require('supertest');
const app = require('./setup');
const User = require('../models/User');
const Farm = require('../models/Farm');
const FarmActivity = require('../models/FarmActivity');
const Scheme = require('../models/Scheme');
const imageAnalysisService = require('../services/imageAnalysisService');
const weatherService = require('../services/weatherService');
const fs = require('fs');
const path = require('path');

describe('Production-Ready Feature Test Suite', () => {
  let farmerToken;
  let adminToken;
  let farmerId;
  let testFarmId;

  beforeAll(async () => {
    // 1. Setup test farmer
    await User.deleteMany({ email: { $in: ['prodtest_farmer@test.com', 'prodtest_admin@test.com'] } });
    
    const farmerRes = await request(app).post('/api/auth/register').send({
      name: 'Ramesh Patil',
      email: 'prodtest_farmer@test.com',
      password: 'Password@123',
      phone: '9876500001',
      role: 'farmer'
    });
    farmerToken = farmerRes.body.token;
    farmerId = farmerRes.body.user._id || farmerRes.body.user.id;

    // 2. Setup test admin
    const adminRes = await request(app).post('/api/auth/register').send({
      name: 'System Admin',
      email: 'prodtest_admin@test.com',
      password: 'Password@123',
      phone: '9876500002',
      role: 'admin'
    });
    adminToken = adminRes.body.token;

    // 3. Setup test farm
    const farmRes = await request(app)
      .post('/api/farms')
      .set('Authorization', `Bearer ${farmerToken}`)
      .send({
        farmName: 'Patil Farm',
        state: 'Maharashtra',
        district: 'Nashik',
        village: 'Dindori',
        landSize: 5,
        landUnit: 'acres',
        soilType: 'black',
        currentCrop: 'Soybean',
        irrigationType: 'drip'
      });
    testFarmId = (farmRes.body.data && farmRes.body.data._id) || farmRes.body._id || (farmRes.body.farm && farmRes.body.farm._id);
  });

  afterAll(async () => {
    await FarmActivity.deleteMany({ user: farmerId });
    await Farm.deleteMany({ owner: farmerId });
    await User.deleteMany({ email: { $in: ['prodtest_farmer@test.com', 'prodtest_admin@test.com'] } });
  });

  // ==========================================
  // 1. AI Plant Doctor & Image Diagnosis Service
  // ==========================================
  describe('AI Plant Doctor & Disease Diagnosis', () => {
    it('should diagnose crop symptoms with structured IPM safety guidance', async () => {
      const buffer = Buffer.from('fake_leaf_image_content');
      const diagnosis = await imageAnalysisService.analyzePlantHealth(buffer, 'image/jpeg', {
        crop: 'Tomato',
        symptoms: 'Yellow spots with dark concentric rings on lower leaves',
        language: 'en'
      });

      expect(diagnosis).toBeDefined();
      expect(diagnosis.plantIdentified).toBe('Tomato');
      expect(diagnosis.confidenceScore).toBeGreaterThanOrEqual(0.6);
      expect(diagnosis.severity).toBeDefined();
      expect(Array.isArray(diagnosis.symptomsDetected)).toBe(true);
      expect(Array.isArray(diagnosis.immediateActions)).toBe(true);
      expect(Array.isArray(diagnosis.plantCare)).toBe(true);
      expect(diagnosis.treatmentGuidance).toBeDefined();
      expect(diagnosis.treatmentGuidance.cultural).toBeDefined();
      expect(diagnosis.treatmentGuidance.safetyWarning).toContain('protective equipment');
    });

    it('should provide Marathi diagnosis and safety guidance when requested', async () => {
      const buffer = Buffer.from('fake_cotton_image');
      const diagnosis = await imageAnalysisService.analyzePlantHealth(buffer, 'image/jpeg', {
        crop: 'Cotton',
        symptoms: 'Curling leaves and white insects under leaf',
        language: 'mr'
      });

      expect(diagnosis).toBeDefined();
      expect(diagnosis.treatmentGuidance).toBeDefined();
      expect(diagnosis.treatmentGuidance.safetyWarning).toBeDefined();
    });

    it('should handle unclear images gracefully with escalation instructions', async () => {
      const buffer = Buffer.from('blurry_unclear_sample');
      const diagnosis = await imageAnalysisService.analyzePlantHealth(buffer, 'image/jpeg', {
        crop: 'Unknown',
        symptoms: 'blurry image',
        language: 'en'
      });

      expect(diagnosis).toBeDefined();
      expect(diagnosis.immediateActions.length).toBeGreaterThan(0);
      expect(diagnosis.immediateActions[0]).toContain('clear, close-up photo');
    });
  });

  // ==========================================
  // 2. Weather Alerts & Agromet Advisory Engine
  // ==========================================
  describe('Weather Alerts & Agromet Advisory Generation', () => {
    it('should generate heavy rain alert and spray advisory when rainfall is high', () => {
      const mockWeather = {
        rain: 25,
        description: 'heavy rain with thunderstorm',
        temp: 26,
        humidity: 88,
        windSpeed: 16
      };

      const { alerts, advice } = weatherService._generateWeatherAlertsAndAdvice(mockWeather);

      expect(alerts.length).toBeGreaterThanOrEqual(1);
      const rainAlert = alerts.find(a => a.type === 'heavy_rain');
      expect(rainAlert).toBeDefined();
      expect(rainAlert.severity).toBe('critical');

      expect(advice.length).toBeGreaterThanOrEqual(1);
      const sprayAdvice = advice.find(a => a.category === 'spraying');
      expect(sprayAdvice).toBeDefined();
      expect(sprayAdvice.text).toContain('Postpone');
    });

    it('should generate heatwave warning and irrigation advice when temperatures exceed 38C', () => {
      const mockWeather = {
        temp: 41,
        temperature: 41,
        description: 'Clear and dry',
        humidity: 25,
        windSpeed: 12
      };

      const { alerts, advice } = weatherService._generateWeatherAlertsAndAdvice(mockWeather);

      const heatAlert = alerts.find(a => a.type === 'heatwave');
      expect(heatAlert).toBeDefined();
      expect(heatAlert.title).toContain('Heatwave');

      const irrAdvice = advice.find(a => a.category === 'irrigation');
      expect(irrAdvice).toBeDefined();
      expect(irrAdvice.text).toContain('early mornings');
    });

    it('should generate high humidity fungal disease advisory', () => {
      const mockWeather = {
        temp: 25,
        humidity: 82,
        description: 'Overcast humid',
        windSpeed: 8
      };

      const { advice } = weatherService._generateWeatherAlertsAndAdvice(mockWeather);
      const fungalAdvice = advice.find(a => a.category === 'disease_risk');
      expect(fungalAdvice).toBeDefined();
      expect(fungalAdvice.text).toContain('fungal');
    });
  });

  // ==========================================
  // 3. Farm Diary & Expense Tracking Endpoints
  // ==========================================
  describe('Farm Diary & Expense Tracking API', () => {
    it('should create an activity with detailed expense tracking and calculate totalCost', async () => {
      const res = await request(app)
        .post('/api/planner')
        .set('Authorization', `Bearer ${farmerToken}`)
        .send({
          farm: testFarmId,
          title: 'Sowing and Basal Fertilizer',
          type: 'sowing',
          scheduledDate: new Date().toISOString().split('T')[0],
          description: 'Sowed certified soybean seeds with DAP basal dose',
          expenses: {
            seedCost: 2500,
            fertilizerCost: 1800,
            sprayCost: 0,
            labourCost: 1200,
            otherCost: 300
          },
          fertilizerUsed: {
            fertilizerName: 'DAP (18:46:0)',
            quantity: 50,
            unit: 'kg'
          }
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.expenses).toBeDefined();
      expect(res.body.data.expenses.totalCost).toBe(5800);
      expect(res.body.data.fertilizerUsed.fertilizerName).toBe('DAP (18:46:0)');
    });

    it('should aggregate farm expenses across categories in /api/planner/expense-summary', async () => {
      // Add second activity with spraying expense
      await request(app)
        .post('/api/planner')
        .set('Authorization', `Bearer ${farmerToken}`)
        .send({
          farm: testFarmId,
          title: 'Neem Oil Preventive Spray',
          type: 'pest_monitoring',
          scheduledDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          expenses: {
            sprayCost: 650,
            labourCost: 500
          },
          sprayTreatment: {
            chemicalName: 'Neem Oil 10000 PPM',
            dosage: '3ml / L water'
          }
        });

      const res = await request(app)
        .get('/api/planner/expense-summary')
        .set('Authorization', `Bearer ${farmerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      const summary = res.body.data;
      expect(summary.totalSeedCost).toBe(2500);
      expect(summary.totalFertilizerCost).toBe(1800);
      expect(summary.totalSprayCost).toBe(650);
      expect(summary.totalLabourCost).toBe(1700);
      expect(summary.grandTotalCost).toBe(6950);
      expect(summary.byCategory.seed).toBe(2500);
    });

    it('should return upcoming farm tasks in /api/planner/upcoming with urgency ratings', async () => {
      const res = await request(app)
        .get('/api/planner/upcoming?days=14')
        .set('Authorization', `Bearer ${farmerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);

      const task = res.body.data[0];
      expect(task.title).toBeDefined();
      expect(task.urgency).toMatch(/normal|urgent|upcoming|overdue/);
      expect(task.scheduledDate).toBeDefined();
    });
  });

  // ==========================================
  // 4. Government Schemes & Subsidies Module
  // ==========================================
  describe('Government Schemes Module', () => {
    it('should retrieve list of government agricultural schemes', async () => {
      const res = await request(app).get('/api/schemes');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(6);

      const titles = res.body.data.map(s => s.shortCode || s.title);
      expect(titles.some(t => t.includes('PM-KISAN'))).toBe(true);
      expect(titles.some(t => t.includes('PMFBY'))).toBe(true);
      expect(titles.some(t => t.includes('KCC'))).toBe(true);
      expect(titles.some(t => t.includes('PMKSY'))).toBe(true);
    });

    it('should filter schemes by category and level', async () => {
      const insRes = await request(app).get('/api/schemes?category=crop_insurance');
      expect(insRes.status).toBe(200);
      expect(insRes.body.data.length).toBeGreaterThanOrEqual(1);
      expect(insRes.body.data[0].shortCode).toBe('PMFBY');

      const stateRes = await request(app).get('/api/schemes?level=state');
      expect(stateRes.status).toBe(200);
      expect(stateRes.body.data.length).toBeGreaterThanOrEqual(1);
      expect(stateRes.body.data[0].state).toBe('Maharashtra');
    });

    it('should localize scheme titles and descriptions based on lang parameter', async () => {
      const mrRes = await request(app).get('/api/schemes?lang=mr');
      expect(mrRes.status).toBe(200);
      const pmKisan = mrRes.body.data.find(s => s.shortCode === 'PM-KISAN');
      expect(pmKisan.displayTitle).toContain('किसान सन्मान निधी');
      expect(pmKisan.displayBenefits).toContain('६,०००');

      const hiRes = await request(app).get('/api/schemes?lang=hi');
      expect(hiRes.status).toBe(200);
      const pmKisanHi = hiRes.body.data.find(s => s.shortCode === 'PM-KISAN');
      expect(pmKisanHi.displayTitle).toContain('किसान सम्मान निधि');
    });

    it('should fetch single scheme by shortCode', async () => {
      const res = await request(app).get('/api/schemes/PM-KISAN');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.shortCode).toBe('PM-KISAN');
      expect(res.body.data.applicationUrl).toBe('https://pmkisan.gov.in');
      expect(res.body.data.helpline).toBeDefined();
    });
  });

  // ==========================================
  // 5. Admin Farmer Detail Inspection Security
  // ==========================================
  describe('Admin Farmer Details Inspection & Security', () => {
    it('should allow admin to inspect farmer details with farms list', async () => {
      const res = await request(app)
        .get(`/api/users/${farmerId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data._id.toString()).toBe(farmerId.toString());
      expect(res.body.data.name).toBe('Ramesh Patil');
      expect(Array.isArray(res.body.data.farms)).toBe(true);

      // SECURITY AUDIT: Ensure password and refresh tokens are strictly absent
      expect(res.body.data.password).toBeUndefined();
      expect(res.body.data.refreshTokens).toBeUndefined();
    });

    it('should forbid unauthorized farmers from inspecting other users (403)', async () => {
      const res = await request(app)
        .get(`/api/users/${farmerId}`)
        .set('Authorization', `Bearer ${farmerToken}`);

      expect(res.status).toBe(403);
    });
  });

  // ==========================================
  // 6. Localization Dictionaries Integrity
  // ==========================================
  describe('Localization Dictionary Integrity', () => {
    it('should have valid en, mr, and hi JSON dictionaries with matching critical keys', () => {
      const localesDir = path.join(__dirname, '../../frontend/locales');
      const en = JSON.parse(fs.readFileSync(path.join(localesDir, 'en.json'), 'utf8'));
      const mr = JSON.parse(fs.readFileSync(path.join(localesDir, 'mr.json'), 'utf8'));
      const hi = JSON.parse(fs.readFileSync(path.join(localesDir, 'hi.json'), 'utf8'));

      const criticalKeys = [
        'nav_dashboard',
        'nav_farms',
        'nav_planner',
        'nav_schemes',
        'plant_doctor',
        'diagnose_now',
        'total_farm_expenses',
        'upcoming_tasks',
        'voice_listening',
        'voice_processing'
      ];

      criticalKeys.forEach(k => {
        expect(en[k]).toBeDefined();
        expect(mr[k]).toBeDefined();
        expect(hi[k]).toBeDefined();
        expect(mr[k]).not.toBe(en[k]); // Marathi must be translated
        expect(hi[k]).not.toBe(en[k]); // Hindi must be translated
      });
    });
  });
});
