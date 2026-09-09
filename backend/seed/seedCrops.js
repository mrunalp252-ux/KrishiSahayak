const mongoose = require('mongoose');
const Crop = require('../models/Crop');

const cropsData = [
  {
    name: 'Rice',
    scientificName: 'Oryza sativa',
    localNames: { hi: 'चावल/धान', mr: 'तांदूळ/भात' },
    category: 'cereal',
    suitableSoils: ['alluvial', 'clay', 'loamy'],
    seasons: ['kharif'],
    temperature: { min: 20, max: 35 },
    waterRequirement: 'high',
    durationDays: { min: 120, max: 150 },
    sowingMonths: ['June', 'July'],
    harvestMonths: ['October', 'November'],
    cultivationPractices: 'Rice requires submerged conditions for early growth. Puddling of field is recommended before transplanting. Maintain 2-5 cm water level during vegetative stage.'
  },
  {
    name: 'Wheat',
    scientificName: 'Triticum aestivum',
    localNames: { hi: 'गेहूं', mr: 'गहू' },
    category: 'cereal',
    suitableSoils: ['loamy', 'clay', 'alluvial'],
    seasons: ['rabi'],
    temperature: { min: 10, max: 25 },
    waterRequirement: 'moderate',
    durationDays: { min: 120, max: 150 },
    sowingMonths: ['October', 'November'],
    harvestMonths: ['March', 'April'],
    cultivationPractices: 'Wheat needs a well-pulverized seedbed. Pre-sowing irrigation ensures good germination. Critical irrigation stages are crown root initiation, tillering, and flowering.'
  },
  {
    name: 'Maize',
    scientificName: 'Zea mays',
    localNames: { hi: 'मक्का', mr: 'मका' },
    category: 'cereal',
    suitableSoils: ['loamy', 'sandy', 'alluvial'],
    seasons: ['kharif', 'rabi'],
    temperature: { min: 21, max: 30 },
    waterRequirement: 'moderate',
    durationDays: { min: 90, max: 120 },
    sowingMonths: ['June', 'July', 'October'],
    harvestMonths: ['September', 'October', 'February'],
    cultivationPractices: 'Maize is sensitive to waterlogging, requiring good drainage. Ridge and furrow planting is ideal. Weed control is essential during the first 30-45 days.'
  },
  {
    name: 'Cotton',
    scientificName: 'Gossypium',
    localNames: { hi: 'कपास', mr: 'कापूस' },
    category: 'fiber',
    suitableSoils: ['black', 'alluvial'],
    seasons: ['kharif'],
    temperature: { min: 21, max: 35 },
    waterRequirement: 'moderate',
    durationDays: { min: 150, max: 180 },
    sowingMonths: ['May', 'June'],
    harvestMonths: ['November', 'December'],
    cultivationPractices: 'Cotton thrives in deep black soils. Requires frost-free days and abundant sunshine. Picking should be done when bolls burst fully open.'
  },
  {
    name: 'Sugarcane',
    scientificName: 'Saccharum officinarum',
    localNames: { hi: 'गन्ना', mr: 'ऊस' },
    category: 'cash_crop',
    suitableSoils: ['loamy', 'alluvial', 'black'],
    seasons: ['annual'],
    temperature: { min: 20, max: 35 },
    waterRequirement: 'high',
    durationDays: { min: 300, max: 365 },
    sowingMonths: ['January', 'February', 'October'],
    harvestMonths: ['December', 'January', 'February'],
    cultivationPractices: 'Deep ploughing is essential for deep root systems. Setts should be treated with fungicides before planting. Frequent irrigation is crucial during the formative stage.'
  },
  {
    name: 'Soybean',
    scientificName: 'Glycine max',
    localNames: { hi: 'सोयाबीन', mr: 'सोयाबीन' },
    category: 'oilseed',
    suitableSoils: ['black', 'loamy'],
    seasons: ['kharif'],
    temperature: { min: 20, max: 30 },
    waterRequirement: 'moderate',
    durationDays: { min: 90, max: 120 },
    sowingMonths: ['June', 'July'],
    harvestMonths: ['September', 'October'],
    cultivationPractices: 'Seed inoculation with Rhizobium improves nitrogen fixation. Ensure good drainage as plants cannot tolerate water stagnation. Harvest when pods turn completely brown.'
  },
  {
    name: 'Groundnut',
    scientificName: 'Arachis hypogaea',
    localNames: { hi: 'मूंगफली', mr: 'भुईमूग' },
    category: 'oilseed',
    suitableSoils: ['sandy', 'loamy', 'red'],
    seasons: ['kharif', 'rabi'],
    temperature: { min: 20, max: 30 },
    waterRequirement: 'low',
    durationDays: { min: 100, max: 130 },
    sowingMonths: ['June', 'July', 'January'],
    harvestMonths: ['October', 'November', 'May'],
    cultivationPractices: 'Prefers loose sandy loam for easy peg penetration. Calcium is crucial for pod development. Avoid moisture stress during pegging and pod formation stages.'
  },
  {
    name: 'Jowar',
    scientificName: 'Sorghum bicolor',
    localNames: { hi: 'ज्वार', mr: 'ज्वारी' },
    category: 'cereal',
    suitableSoils: ['black', 'red', 'loamy'],
    seasons: ['kharif', 'rabi'],
    temperature: { min: 25, max: 35 },
    waterRequirement: 'low',
    durationDays: { min: 100, max: 120 },
    sowingMonths: ['June', 'July', 'September'],
    harvestMonths: ['October', 'November', 'January'],
    cultivationPractices: 'Highly drought tolerant crop. Deep summer ploughing helps control soil-borne pests. Thinning operations are required 2-3 weeks after sowing to maintain spacing.'
  },
  {
    name: 'Bajra',
    scientificName: 'Pennisetum glaucum',
    localNames: { hi: 'बाजरा', mr: 'बाजरी' },
    category: 'cereal',
    suitableSoils: ['sandy', 'loamy', 'alluvial'],
    seasons: ['kharif'],
    temperature: { min: 25, max: 35 },
    waterRequirement: 'low',
    durationDays: { min: 70, max: 90 },
    sowingMonths: ['June', 'July'],
    harvestMonths: ['September', 'October'],
    cultivationPractices: 'Requires minimal water and can grow in marginal soils. Shallow sowing is recommended. Needs protection from birds during grain filling and maturity.'
  },
  {
    name: 'Tur',
    scientificName: 'Cajanus cajan',
    localNames: { hi: 'अरहर/तूर', mr: 'तूर' },
    category: 'pulse',
    suitableSoils: ['black', 'red', 'loamy'],
    seasons: ['kharif'],
    temperature: { min: 20, max: 35 },
    waterRequirement: 'low',
    durationDays: { min: 150, max: 180 },
    sowingMonths: ['June', 'July'],
    harvestMonths: ['December', 'January'],
    cultivationPractices: 'Deep rooted crop, requires well-drained soil. Often grown as an intercrop. Susceptible to waterlogging in early stages.'
  },
  {
    name: 'Gram',
    scientificName: 'Cicer arietinum',
    localNames: { hi: 'चना', mr: 'हरभरा' },
    category: 'pulse',
    suitableSoils: ['loamy', 'black', 'sandy'],
    seasons: ['rabi'],
    temperature: { min: 10, max: 25 },
    waterRequirement: 'low',
    durationDays: { min: 90, max: 120 },
    sowingMonths: ['October', 'November'],
    harvestMonths: ['February', 'March'],
    cultivationPractices: 'Nipping (plucking apical buds) encourages branching. Requires pre-sowing irrigation. Susceptible to pod borer attack during flowering.'
  },
  {
    name: 'Onion',
    scientificName: 'Allium cepa',
    localNames: { hi: 'प्याज', mr: 'कांदा' },
    category: 'vegetable',
    suitableSoils: ['loamy', 'alluvial', 'sandy'],
    seasons: ['rabi', 'kharif'],
    temperature: { min: 13, max: 24 },
    waterRequirement: 'moderate',
    durationDays: { min: 120, max: 150 },
    sowingMonths: ['July', 'October'],
    harvestMonths: ['December', 'April'],
    cultivationPractices: 'Requires fine seedbed for nursery. Bulbs develop well in mild temperatures. Withhold irrigation 10-15 days before harvesting for better keeping quality.'
  },
  {
    name: 'Tomato',
    scientificName: 'Solanum lycopersicum',
    localNames: { hi: 'टमाटर', mr: 'टोमॅटो' },
    category: 'vegetable',
    suitableSoils: ['loamy', 'sandy', 'red'],
    seasons: ['rabi', 'kharif'],
    temperature: { min: 20, max: 27 },
    waterRequirement: 'moderate',
    durationDays: { min: 90, max: 120 },
    sowingMonths: ['July', 'October', 'January'],
    harvestMonths: ['October', 'February', 'April'],
    cultivationPractices: 'Needs staking for tall varieties. Maintain uniform soil moisture to prevent blossom end rot. Regular application of micronutrients improves fruit quality.'
  },
  {
    name: 'Potato',
    scientificName: 'Solanum tuberosum',
    localNames: { hi: 'आलू', mr: 'बटाटा' },
    category: 'vegetable',
    suitableSoils: ['loamy', 'sandy', 'alluvial'],
    seasons: ['rabi'],
    temperature: { min: 15, max: 22 },
    waterRequirement: 'moderate',
    durationDays: { min: 80, max: 120 },
    sowingMonths: ['October', 'November'],
    harvestMonths: ['January', 'February'],
    cultivationPractices: 'Earthing up is essential to cover developing tubers and prevent greening. Requires loose friable soil. Cool night temperatures are crucial for good tuberization.'
  },
  {
    name: 'Turmeric',
    scientificName: 'Curcuma longa',
    localNames: { hi: 'हल्दी', mr: 'हळद' },
    category: 'spice',
    suitableSoils: ['loamy', 'alluvial', 'clay'],
    seasons: ['kharif'],
    temperature: { min: 20, max: 30 },
    waterRequirement: 'moderate',
    durationDays: { min: 240, max: 270 },
    sowingMonths: ['May', 'June'],
    harvestMonths: ['January', 'February'],
    cultivationPractices: 'Requires warm and humid climate. Provide partial shade if possible. Mulching immediately after planting conserves moisture and controls weeds.'
  },
  {
    name: 'Ginger',
    scientificName: 'Zingiber officinale',
    localNames: { hi: 'अदरक', mr: 'आले' },
    category: 'spice',
    suitableSoils: ['loamy', 'sandy', 'alluvial'],
    seasons: ['kharif'],
    temperature: { min: 20, max: 30 },
    waterRequirement: 'moderate',
    durationDays: { min: 210, max: 240 },
    sowingMonths: ['April', 'May'],
    harvestMonths: ['December', 'January'],
    cultivationPractices: 'Very sensitive to waterlogging, plant on raised beds. Mulching is mandatory. Regular earthing up prevents rhizome exposure to sun.'
  },
  {
    name: 'Banana',
    scientificName: 'Musa',
    localNames: { hi: 'केला', mr: 'केळी' },
    category: 'fruit',
    suitableSoils: ['loamy', 'alluvial', 'clay'],
    seasons: ['annual'],
    temperature: { min: 20, max: 35 },
    waterRequirement: 'high',
    durationDays: { min: 300, max: 365 },
    sowingMonths: ['June', 'July', 'September'],
    harvestMonths: ['May', 'June', 'August'],
    cultivationPractices: 'Requires heavy feeding of nutrients. Regular desuckering is needed to maintain single pseudostem. Propping prevents lodging during strong winds.'
  },
  {
    name: 'Grapes',
    scientificName: 'Vitis vinifera',
    localNames: { hi: 'अंगूर', mr: 'द्राक्ष' },
    category: 'fruit',
    suitableSoils: ['sandy', 'loamy', 'red'],
    seasons: ['annual'],
    temperature: { min: 15, max: 35 },
    waterRequirement: 'moderate',
    durationDays: { min: 365, max: 365 },
    sowingMonths: ['January', 'February'],
    harvestMonths: ['March', 'April'],
    cultivationPractices: 'Requires sturdy trellis system for support. Precise pruning (foundation and fruit pruning) is vital. Highly susceptible to fungal diseases during rains.'
  },
  {
    name: 'Pomegranate',
    scientificName: 'Punica granatum',
    localNames: { hi: 'अनार', mr: 'डाळिंब' },
    category: 'fruit',
    suitableSoils: ['sandy', 'loamy', 'red'],
    seasons: ['annual'],
    temperature: { min: 25, max: 35 },
    waterRequirement: 'low',
    durationDays: { min: 180, max: 180 },
    sowingMonths: ['July', 'August'],
    harvestMonths: ['January', 'February'],
    cultivationPractices: 'Bahar treatment regulates flowering. Pruning maintains tree architecture and fruit size. Bagging of fruits protects against sunscald and fruit borers.'
  },
  {
    name: 'Sunflower',
    scientificName: 'Helianthus annuus',
    localNames: { hi: 'सूरजमुखी', mr: 'सूर्यफूल' },
    category: 'oilseed',
    suitableSoils: ['loamy', 'black', 'alluvial'],
    seasons: ['rabi', 'kharif'],
    temperature: { min: 20, max: 25 },
    waterRequirement: 'moderate',
    durationDays: { min: 80, max: 100 },
    sowingMonths: ['June', 'July', 'January'],
    harvestMonths: ['September', 'October', 'April'],
    cultivationPractices: 'Photo-insensitive crop. Honeybee pollination significantly improves seed set and yield. Bird damage is common during seed maturity.'
  },
  {
    name: 'Chilli',
    scientificName: 'Capsicum annuum',
    localNames: { hi: 'मिर्च', mr: 'मिरची' },
    category: 'spice',
    suitableSoils: ['loamy', 'sandy', 'black'],
    seasons: ['kharif', 'rabi'],
    temperature: { min: 20, max: 30 },
    waterRequirement: 'moderate',
    durationDays: { min: 120, max: 150 },
    sowingMonths: ['June', 'July', 'September'],
    harvestMonths: ['October', 'November', 'January'],
    cultivationPractices: 'Requires well-drained soil, sensitive to waterlogging. Seedlings need protection from damping-off. Regular picking encourages more fruiting.'
  },
  {
    name: 'Moong',
    scientificName: 'Vigna radiata',
    localNames: { hi: 'मूंग', mr: 'मूग' },
    category: 'pulse',
    suitableSoils: ['loamy', 'sandy', 'alluvial'],
    seasons: ['kharif', 'zaid'],
    temperature: { min: 25, max: 35 },
    waterRequirement: 'low',
    durationDays: { min: 60, max: 75 },
    sowingMonths: ['June', 'March'],
    harvestMonths: ['August', 'May'],
    cultivationPractices: 'Short duration crop excellent for crop rotation. Does well in warm climates. Seed treatment with Rhizobium is recommended.'
  }
];

async function seedCrops() {
  try {
    for (const crop of cropsData) {
      const formattedCrop = {
        name: crop.name,
        scientificName: crop.scientificName,
        localNames: crop.localNames || {},
        category: crop.category,
        suitableSoils: crop.suitableSoils || [],
        suitableSeasons: crop.suitableSeasons || crop.seasons || [],
        tempRange: crop.tempRange || crop.temperature || { min: 20, max: 35 },
        waterRequirement: crop.waterRequirement,
        duration: crop.duration || crop.durationDays || { min: 90, max: 120 },
        sowingPeriod: crop.sowingPeriod || (Array.isArray(crop.sowingMonths) ? crop.sowingMonths.join(', ') : ''),
        harvestPeriod: crop.harvestPeriod || (Array.isArray(crop.harvestMonths) ? crop.harvestMonths.join(', ') : ''),
        cultivationPractices: crop.cultivationPractices,
        isActive: true
      };

      await Crop.findOneAndUpdate(
        { name: crop.name },
        formattedCrop,
        { upsert: true, new: true }
      );
    }
    console.log(`Seeded ${cropsData.length} crops successfully`);
  } catch (error) {
    console.error('Error seeding crops:', error);
    throw error;
  }
}

module.exports = seedCrops;
