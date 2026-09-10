const Advisory = require('../models/Advisory');

const advisoriesData = [
  {
    title: 'Monsoon Sowing & Drainage Advisory',
    message: 'Ensure proper drainage channels in black cotton and alluvial soils to prevent waterlogging during heavy rainfall. Complete kharif sowings when soil moisture is optimal.',
    category: 'weather',
    language: 'en',
    region: { state: 'Maharashtra', district: 'Pune' },
    crop: 'Soybean',
    severity: 'warning',
    isActive: true
  },
  {
    title: 'Fall Armyworm Vigilance in Maize',
    message: 'Monitor maize fields weekly for whorl damage and pinhole leaf feeding. Install pheromone traps at 5 traps/acre for timely detection.',
    category: 'pest',
    language: 'en',
    region: { state: 'Maharashtra', district: 'Nashik' },
    crop: 'Maize',
    severity: 'critical',
    isActive: true
  },
  {
    title: 'Optimal NPK Split Application in Sugarcane',
    message: 'Apply third split dose of nitrogen alongside earthing-up operations. Maintain soil moisture for efficient nutrient uptake.',
    category: 'general',
    language: 'en',
    region: { state: 'Maharashtra', district: 'Kolhapur' },
    crop: 'Sugarcane',
    severity: 'info',
    isActive: true
  },
  {
    title: 'Cotton Pink Bollworm Monitoring',
    message: 'Scout 20 random bolls per acre for pink bollworm entry holes. Apply neem-based formulation if flower rosetting exceeds 5%.',
    category: 'pest',
    language: 'en',
    region: { state: 'Maharashtra', district: 'Nagpur' },
    crop: 'Cotton',
    severity: 'warning',
    isActive: true
  },
  {
    title: 'PM-Kisan & Soil Health Scheme Enrollment',
    message: 'Farmers are advised to complete e-KYC on the PM-Kisan portal and get soil health cards updated before the upcoming season.',
    category: 'scheme',
    language: 'en',
    region: { state: 'Maharashtra', district: 'Pune' },
    crop: 'General',
    severity: 'info',
    isActive: true
  }
];

async function seedAdvisories() {
  try {
    for (const adv of advisoriesData) {
      await Advisory.findOneAndUpdate(
        { title: adv.title },
        adv,
        { upsert: true, new: true }
      );
    }
    console.log(`Seeded ${advisoriesData.length} advisories successfully`);
  } catch (error) {
    console.error('Error seeding advisories:', error);
    throw error;
  }
}

module.exports = seedAdvisories;
