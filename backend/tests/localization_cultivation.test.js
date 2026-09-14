const request = require('supertest');
const app = require('./setup');
const fs = require('fs');
const path = require('path');
const User = require('../models/User');
const Farm = require('../models/Farm');
const CultivationGuide = require('../models/CultivationGuide');
const Scheme = require('../models/Scheme');
const { cropsData } = require('../seed/seedCrops');
const { buildCultivationGuides, STAGE_TITLES } = require('../seed/guideDataBuilder');

describe('Multilingual Localization, Cultivation Guides & Schemes Test Suite', () => {
  let adminToken;
  let farmerToken;
  let farmerUser;

  beforeAll(async () => {
    // Clean and setup admin & farmer users
    await User.deleteMany({ email: { $in: ['audit_admin@test.com', 'audit_farmer@test.com'] } });

    const adminRes = await request(app).post('/api/auth/register').send({
      name: 'Audit Admin',
      email: 'audit_admin@test.com',
      password: 'Password@123',
      phone: '9876540001',
      role: 'admin'
    });
    adminToken = adminRes.body.token;

    const farmerRes = await request(app).post('/api/auth/register').send({
      name: 'Audit Farmer',
      email: 'audit_farmer@test.com',
      password: 'Password@123',
      phone: '9876540002',
      role: 'farmer'
    });
    farmerToken = farmerRes.body.token;
    farmerUser = farmerRes.body.user;

    const farmerId = farmerUser._id || farmerUser.id;

    // Create a farm for the farmer to test profile summary
    await Farm.deleteMany({ owner: farmerId });
    await Farm.create({
      owner: farmerId,
      farmName: 'Audit Test Farm',
      state: 'Maharashtra',
      district: 'Pune',
      village: 'Baramati',
      landSize: 4.5,
      landUnit: 'acres',
      soilType: 'black',
      currentCrop: 'Soybean',
      irrigationType: 'drip'
    });

    // Seed test cultivation guides
    const allGuides = buildCultivationGuides();
    // Seed first 6 guides (Soybean and Rice in EN, MR, HI)
    const testGuides = allGuides.filter(g => ['Soybean', 'Rice'].includes(g.cropName));
    for (const g of testGuides) {
      await CultivationGuide.findOneAndUpdate(
        { cropName: g.cropName, language: g.language },
        g,
        { upsert: true, new: true }
      );
    }
  });

  afterAll(async () => {
    await User.deleteMany({ email: { $in: ['audit_admin@test.com', 'audit_farmer@test.com'] } });
    if (farmerUser) {
      const farmerId = farmerUser._id || farmerUser.id;
      await Farm.deleteMany({ owner: farmerId });
    }
  });

  describe('1. Localization Dictionary Completeness & Parity', () => {
    const localesDir = path.join(__dirname, '../../frontend/locales');
    const en = JSON.parse(fs.readFileSync(path.join(localesDir, 'en.json'), 'utf-8'));
    const mr = JSON.parse(fs.readFileSync(path.join(localesDir, 'mr.json'), 'utf-8'));
    const hi = JSON.parse(fs.readFileSync(path.join(localesDir, 'hi.json'), 'utf-8'));

    test('en.json has at least 350 localization keys', () => {
      const keys = Object.keys(en);
      expect(keys.length).toBeGreaterThanOrEqual(350);
    });

    test('100% key parity between en.json and mr.json (no missing Marathi keys)', () => {
      const enKeys = Object.keys(en);
      const mrKeys = new Set(Object.keys(mr));
      const missingInMr = enKeys.filter(k => !mrKeys.has(k));
      expect(missingInMr).toEqual([]);
    });

    test('100% key parity between en.json and hi.json (no missing Hindi keys)', () => {
      const enKeys = Object.keys(en);
      const hiKeys = new Set(Object.keys(hi));
      const missingInHi = enKeys.filter(k => !hiKeys.has(k));
      expect(missingInHi).toEqual([]);
    });

    test('mr.json and hi.json have non-empty localized string values', () => {
      for (const [k, v] of Object.entries(mr)) {
        expect(typeof v).toBe('string');
        expect(v.trim().length).toBeGreaterThan(0);
      }
      for (const [k, v] of Object.entries(hi)) {
        expect(typeof v).toBe('string');
        expect(v.trim().length).toBeGreaterThan(0);
      }
    });
  });

  describe('2. Crop Catalog Expansion (37 Crops)', () => {
    test('Catalog contains at least 30 authentic Indian/Maharashtra crops', () => {
      expect(cropsData.length).toBeGreaterThanOrEqual(30);
      expect(cropsData.length).toBe(37);
    });

    test('Every crop has valid agronomic parameters and season', () => {
      const validCategories = ['cereal', 'pulse', 'oilseed', 'commercial', 'cash_crop', 'vegetable', 'spice', 'fruit', 'plantation', 'fiber', 'other'];
      for (const c of cropsData) {
        expect(c.name).toBeDefined();
        expect(c.scientificName).toBeDefined();
        expect(validCategories).toContain(c.category);
        expect(Array.isArray(c.seasons)).toBe(true);
        expect(c.seasons.length).toBeGreaterThan(0);
        expect(c.durationDays).toBeDefined();
        expect(c.durationDays.min).toBeGreaterThan(0);
        expect(c.durationDays.max).toBeGreaterThanOrEqual(c.durationDays.min);
        expect(c.temperature).toBeDefined();
        expect(Array.isArray(c.suitableSoils)).toBe(true);
        expect(c.suitableSoils.length).toBeGreaterThan(0);
      }
    });

    test('Includes core Maharashtra staple and commercial crops', () => {
      const cropNames = cropsData.map(c => c.name);
      expect(cropNames).toContain('Soybean');
      expect(cropNames).toContain('Cotton');
      expect(cropNames).toContain('Sugarcane');
      expect(cropNames).toContain('Jowar');
      expect(cropNames).toContain('Onion');
      expect(cropNames).toContain('Pomegranate');
      expect(cropNames).toContain('Grapes');
    });
  });

  describe('3. Multilingual Cultivation Guides & Strict Sequential Step Numbering', () => {
    const allGuides = buildCultivationGuides();

    test('Generates exactly 111 guides (37 crops × 3 languages)', () => {
      expect(allGuides.length).toBe(111);
    });

    test('Every guide strictly starts at order: 1 and has sequential sections', () => {
      for (const guide of allGuides) {
        expect(Array.isArray(guide.sections)).toBe(true);
        expect(guide.sections.length).toBe(10);
        
        // Strict requirement: First section must have order: 1
        expect(guide.sections[0].order).toBe(1);

        // All sections must be strictly sequential (1, 2, 3, ... 10)
        guide.sections.forEach((sec, idx) => {
          expect(sec.order).toBe(idx + 1);
          expect(sec.title).toBeDefined();
          expect(sec.title.trim().length).toBeGreaterThan(0);
          expect(sec.content).toBeDefined();
          expect(sec.content.trim().length).toBeGreaterThan(0);
        });

        // Check language-specific section titles
        if (guide.language === 'mr') {
          expect(guide.sections[0].title).toBe('हवामान व अनुकूल परिस्थिती');
        } else if (guide.language === 'hi') {
          expect(guide.sections[0].title).toBe('जलवायु एवं मौसम की आवश्यकताएं');
        } else {
          expect(guide.sections[0].title).toBe('Climate & Weather Requirements');
        }
      }
    });

    test('GET /api/guides accepts language filter and returns localized guides', async () => {
      const resMr = await request(app).get('/api/guides?language=mr');
      expect(resMr.status).toBe(200);
      expect(resMr.body.success).toBe(true);
      expect(Array.isArray(resMr.body.data)).toBe(true);
      if (resMr.body.data.length > 0) {
        expect(resMr.body.data[0].language).toBe('mr');
        expect(resMr.body.data[0].sections[0].order).toBe(1);
      }
    });

    test('GET /api/guides/crop/:cropName respects ?lang=hi', async () => {
      const resHi = await request(app).get('/api/guides/crop/Soybean?lang=hi');
      expect(resHi.status).toBe(200);
      expect(resHi.body.success).toBe(true);
      expect(resHi.body.data.language).toBe('hi');
      expect(resHi.body.data.sections[0].order).toBe(1);
      expect(resHi.body.data.sections[0].title).toBe('जलवायु एवं मौसम की आवश्यकताएं');
    });
  });

  describe('4. Multilingual Government Schemes Module', () => {
    test('GET /api/schemes returns verified national and state schemes', async () => {
      const res = await request(app).get('/api/schemes');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(8);

      const titles = res.body.data.map(s => s.name || s.title || s.schemeName);
      const matchPmkisan = titles.some(t => t.includes('PM-KISAN') || t.includes('Kisan Samman'));
      expect(matchPmkisan).toBe(true);
    });

    test('Schemes return localized display fields in Marathi (?lang=mr)', async () => {
      const res = await request(app).get('/api/schemes?lang=mr');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      const firstScheme = res.body.data[0];
      expect(firstScheme.displayTitle).toBeDefined();
      expect(firstScheme.displayEligibility).toBeDefined();
      expect(firstScheme.displayBenefits).toBeDefined();
      expect(firstScheme.displayDocuments).toBeDefined();
      expect(firstScheme.applicationUrl).toBeDefined();
      expect(firstScheme.helpline).toBeDefined();
    });

    test('Schemes return localized display fields in Hindi (?lang=hi)', async () => {
      const res = await request(app).get('/api/schemes?lang=hi');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      const firstScheme = res.body.data[0];
      expect(firstScheme.displayTitle).toBeDefined();
      expect(firstScheme.displayEligibility).toBeDefined();
      expect(firstScheme.displayBenefits).toBeDefined();
    });
  });

  describe('5. Admin Security & Safe Farmer Profile Summary', () => {
    test('Non-admin user cannot access admin user profile details', async () => {
      const res = await request(app)
        .get(`/api/admin/users/${farmerUser._id || farmerUser.id}`)
        .set('Authorization', `Bearer ${farmerToken}`);
      expect([401, 403]).toContain(res.status);
    });

    test('Admin can fetch farmer profile and sensitive fields are stripped', async () => {
      const res = await request(app)
        .get(`/api/admin/users/${farmerUser._id || farmerUser.id}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      
      const user = res.body.data || res.body.user;
      expect(user).toBeDefined();
      expect(user.name).toBe('Audit Farmer');
      expect(user.farms).toBeDefined();
      expect(Array.isArray(user.farms)).toBe(true);
      expect(user.farms.length).toBe(1);
      expect(user.crops).toBeDefined();
      expect(user.crops).toContain('Soybean');

      // Crucial Security Checks: Never expose sensitive tokens/hashes
      expect(user.password).toBeUndefined();
      expect(user.passwordResetToken).toBeUndefined();
      expect(user.passwordResetExpires).toBeUndefined();
      expect(user.refreshTokens).toBeUndefined();
    });
  });
});
