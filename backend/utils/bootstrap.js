const logger = require('./logger');
const mongoose = require('mongoose');
const User = require('../models/User');
const Crop = require('../models/Crop');
const Pest = require('../models/Pest');
const Disease = require('../models/Disease');
const FertilizerGuide = require('../models/FertilizerGuide');
const CultivationGuide = require('../models/CultivationGuide');
const MarketPrice = require('../models/MarketPrice');
const Advisory = require('../models/Advisory');

let isBootstrapping = false;
let hasBootstrapped = false;

async function bootstrap() {
  if (hasBootstrapped || isBootstrapping) {
    return;
  }
  if (mongoose.connection.readyState !== 1) {
    return;
  }

  isBootstrapping = true;

  try {
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@krishisahayak.com').toLowerCase().trim();
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';
    const expertEmail = (process.env.EXPERT_EMAIL || 'expert@krishisahayak.com').toLowerCase().trim();
    const expertPassword = process.env.EXPERT_PASSWORD || 'Expert@123456';

    // 1. Bootstrap Admin user
    let admin = await User.findOne({ email: adminEmail }).select('+password');
    if (!admin) {
      admin = new User({
        name: 'System Administrator',
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
        state: 'Maharashtra',
        district: 'Pune',
        village: 'Pune City',
        language: 'en',
        isActive: true
      });
      await admin.save();
      logger.info(`[Bootstrap] Initial admin user created: ${adminEmail}`);
    } else {
      let needsSave = false;
      if (admin.role !== 'admin') {
        admin.role = 'admin';
        needsSave = true;
      }
      if (!admin.isActive) {
        admin.isActive = true;
        needsSave = true;
      }
      const isPasswordMatch = await admin.comparePassword(adminPassword);
      if (!isPasswordMatch && process.env.ADMIN_SYNC_PASSWORD !== 'false') {
        admin.password = adminPassword;
        needsSave = true;
        logger.info(`[Bootstrap] Admin password synchronized to configured credentials: ${adminEmail}`);
      }
      if (needsSave) {
        await admin.save();
        logger.info(`[Bootstrap] Admin user role/status/credentials verified: ${adminEmail}`);
      }
    }

    // 2. Bootstrap Expert user
    let expert = await User.findOne({ email: expertEmail }).select('+password');
    if (!expert) {
      expert = new User({
        name: 'Dr. Rajesh Patil (Agri Expert)',
        email: expertEmail,
        password: expertPassword,
        role: 'expert',
        state: 'Maharashtra',
        district: 'Pune',
        village: 'Pune City',
        language: 'mr',
        isActive: true
      });
      await expert.save();
      logger.info(`[Bootstrap] Initial expert user created: ${expertEmail}`);
    } else {
      let needsSave = false;
      if (expert.role !== 'expert') {
        expert.role = 'expert';
        needsSave = true;
      }
      if (!expert.isActive) {
        expert.isActive = true;
        needsSave = true;
      }
      const isExpertMatch = await expert.comparePassword(expertPassword);
      if (!isExpertMatch && process.env.EXPERT_SYNC_PASSWORD !== 'false') {
        expert.password = expertPassword;
        needsSave = true;
        logger.info(`[Bootstrap] Expert password synchronized: ${expertEmail}`);
      }
      if (needsSave) {
        await expert.save();
      }
    }

    // 3. Bootstrap reference collections if empty
    const cropCount = await Crop.countDocuments();
    if (cropCount === 0) {
      const seedCrops = require('../seed/seedCrops');
      await seedCrops();
      logger.info('[Bootstrap] Reference crops seeded');
    }

    const pestCount = await Pest.countDocuments();
    if (pestCount === 0) {
      const seedPests = require('../seed/seedPests');
      await seedPests();
      logger.info('[Bootstrap] Reference pests seeded');
    }

    const diseaseCount = await Disease.countDocuments();
    if (diseaseCount === 0) {
      const seedDiseases = require('../seed/seedDiseases');
      await seedDiseases();
      logger.info('[Bootstrap] Reference diseases seeded');
    }

    const fertCount = await FertilizerGuide.countDocuments();
    if (fertCount === 0) {
      const seedFertilizers = require('../seed/seedFertilizers');
      await seedFertilizers();
      logger.info('[Bootstrap] Reference fertilizers seeded');
    }

    const guideCount = await CultivationGuide.countDocuments();
    if (guideCount === 0) {
      const seedGuides = require('../seed/seedGuides');
      await seedGuides();
      logger.info('[Bootstrap] Reference cultivation guides seeded');
    }

    const marketCount = await MarketPrice.countDocuments();
    if (marketCount === 0) {
      const seedMarketPrices = require('../seed/seedMarketPrices');
      await seedMarketPrices();
      logger.info('[Bootstrap] Reference market prices seeded');
    }

    const advisoryCount = await Advisory.countDocuments();
    if (advisoryCount === 0) {
      const seedAdvisories = require('../seed/seedAdvisories');
      await seedAdvisories();
      logger.info('[Bootstrap] Reference advisories seeded');
    }

    hasBootstrapped = true;
    logger.info('[Bootstrap] Production data verification complete');
  } catch (err) {
    logger.warn(`[Bootstrap] Data bootstrap non-fatal warning: ${err.message}`);
  } finally {
    isBootstrapping = false;
  }
}

module.exports = bootstrap;
