require('dotenv').config();
const mongoose = require('mongoose');

const seedAdmin = require('./seedAdmin');
const seedCrops = require('./seedCrops');
const seedPests = require('./seedPests');
const seedDiseases = require('./seedDiseases');
const seedFertilizers = require('./seedFertilizers');
const seedGuides = require('./seedGuides');
const seedMarketPrices = require('./seedMarketPrices');

async function runSeed() {
  try {
    console.log('Connecting to MongoDB...');
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/krishi-sahayak';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB successfully.');

    console.log('--- Starting Database Seeding ---');
    
    await seedAdmin();
    await seedCrops();
    await seedPests();
    await seedDiseases();
    await seedFertilizers();
    await seedGuides();
    await seedMarketPrices();

    console.log('--- Database Seeding Completed Successfully ---');
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
    process.exit(0);
  }
}

runSeed();
