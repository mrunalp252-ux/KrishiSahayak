const mongoose = require('mongoose');
const Disease = require('../models/Disease');

const diseasesData = [
  {
    name: 'Rice Blast',
    scientificName: 'Magnaporthe oryzae',
    type: 'fungal',
    localNames: { hi: 'धान का ब्लास्ट', mr: 'भाताचा करपा' },
    affectedCrops: ['Rice'],
    symptoms: 'Diamond or spindle-shaped lesions with grey centers and brown margins on leaves. Neck rot leading to chaffy grains.',
    causes: 'High humidity, prolonged leaf wetness, excessive nitrogen application.',
    prevention: ['Use resistant varieties', 'Avoid excessive nitrogen fertilizers', 'Destroy diseased plant debris', 'Treat seeds before sowing'],
    management: ['Apply appropriate fungicides like Tricyclazole', 'Ensure balanced fertilization', 'Improve air circulation'],
    severity: 'critical',
    monitoring: 'Regularly inspect fields for spindle-shaped leaf spots, especially during high humidity periods.'
  },
  {
    name: 'Late Blight',
    scientificName: 'Phytophthora infestans',
    type: 'fungal',
    affectedCrops: ['Potato', 'Tomato'],
    symptoms: 'Large water-soaked lesions on leaves, white mold on the underside of leaves in humid conditions. Rapid blighting of entire plant.',
    causes: 'Cool, wet, and humid weather conditions.',
    prevention: ['Use certified disease-free seeds/tubers', 'Ensure good soil drainage', 'Avoid sprinkler irrigation if possible', 'Destroy cull piles'],
    management: ['Apply protective fungicides before symptoms appear', 'Use systemic fungicides once disease is spotted', 'Harvest tubers in dry weather'],
    severity: 'critical',
    monitoring: 'Monitor weather forecasts for cool, wet conditions. Check lower leaves for early symptoms.'
  },
  {
    name: 'Bacterial Wilt',
    scientificName: 'Ralstonia solanacearum',
    type: 'bacterial',
    affectedCrops: ['Tomato', 'Potato', 'Brinjal'],
    symptoms: 'Sudden wilting of foliage while still green, vascular browning in stems, milky bacterial ooze from cut stems.',
    causes: 'Soil-borne bacteria, spreads through water, infected tools, and root contact.',
    prevention: ['Crop rotation with non-host crops (cereals)', 'Use disease-free planting material', 'Ensure good field drainage', 'Sanitize farm tools'],
    management: ['Remove and destroy infected plants immediately', 'Solarize soil before planting', 'Use resistant or grafted varieties'],
    severity: 'high',
    monitoring: 'Look for sudden wilting of leaves during the hottest part of the day. Conduct the water glass test for bacterial ooze.'
  },
  {
    name: 'Yellow Mosaic Virus',
    scientificName: 'Mungbean yellow mosaic virus',
    type: 'viral',
    affectedCrops: ['Soybean', 'Moong', 'Urd'],
    symptoms: 'Scattered yellow spots on leaves that expand to form yellow patches, stunting of plants, reduced yield.',
    causes: 'Transmitted by the whitefly vector (Bemisia tabaci).',
    prevention: ['Control whitefly populations', 'Use resistant varieties', 'Rogue out infected plants early', 'Synchronized sowing'],
    management: ['Spray insecticides to manage whiteflies', 'Use yellow sticky traps', 'Apply Neem seed kernel extract'],
    severity: 'high',
    monitoring: 'Monitor whitefly populations using yellow sticky traps. Inspect plants for early yellowing symptoms.'
  },
  {
    name: 'Fusarium Wilt',
    scientificName: 'Fusarium oxysporum',
    type: 'fungal',
    affectedCrops: ['Banana', 'Tomato', 'Cotton'],
    symptoms: 'Yellowing of older leaves, wilting, vascular discoloration (brown/black streaks inside stem), plant death.',
    causes: 'Soil-borne fungus that enters through roots.',
    prevention: ['Crop rotation for several years', 'Plant resistant varieties', 'Ensure good drainage', 'Avoid nematode infestations which facilitate entry'],
    management: ['Soil solarization', 'Application of Trichoderma viride in soil', 'Drenching with appropriate fungicides'],
    severity: 'high',
    monitoring: 'Check for progressive yellowing of leaves starting from the bottom. Slice stem to check for vascular browning.'
  },
  {
    name: 'Powdery Mildew',
    scientificName: 'Erysiphales',
    type: 'fungal',
    affectedCrops: ['Grapes', 'Wheat', 'Peas'],
    symptoms: 'White powdery coating or spots on the upper surface of leaves, stems, and sometimes fruits. Leaves may curl and drop.',
    causes: 'Warm and dry days with cool, damp nights favor disease development.',
    prevention: ['Ensure adequate plant spacing for airflow', 'Avoid overhead watering', 'Prune to improve canopy ventilation', 'Plant resistant varieties'],
    management: ['Spray wettable sulfur or appropriate fungicides', 'Apply neem oil', 'Remove severely infected plant parts'],
    severity: 'moderate',
    monitoring: 'Check older leaves frequently for small white powdery spots, especially in shaded areas of the plant.'
  },
  {
    name: 'Downy Mildew',
    scientificName: 'Peronosporaceae',
    type: 'fungal',
    affectedCrops: ['Bajra', 'Grapes', 'Onion'],
    symptoms: 'Pale yellow spots on the upper leaf surface with corresponding purplish or grayish downy growth on the underside.',
    causes: 'Cool, wet weather with high relative humidity.',
    prevention: ['Improve air circulation through proper spacing', 'Ensure good soil drainage', 'Water at the base of plants', 'Use resistant varieties'],
    management: ['Apply copper-based fungicides', 'Remove and destroy infected plant debris', 'Use systemic fungicides for severe outbreaks'],
    severity: 'high',
    monitoring: 'Inspect the underside of leaves for fuzzy growth during cool, moist periods.'
  },
  {
    name: 'Rust',
    scientificName: 'Puccinia spp.',
    type: 'fungal',
    affectedCrops: ['Wheat', 'Soybean', 'Groundnut'],
    symptoms: 'Small, orange, brown, or reddish pustules primarily on leaves and stems. Powdery spores rub off on fingers.',
    causes: 'High humidity, frequent dews, and moderate temperatures.',
    prevention: ['Grow rust-resistant varieties', 'Adjust planting dates to avoid favorable weather', 'Destroy volunteer host plants', 'Crop rotation'],
    management: ['Apply timely foliar fungicides', 'Ensure proper plant nutrition', 'Remove infected crop residue'],
    severity: 'high',
    monitoring: 'Scout fields for characteristic rust-colored pustules on leaves, especially after prolonged leaf wetness.'
  },
  {
    name: 'Smut',
    scientificName: 'Ustilaginomycetes',
    type: 'fungal',
    affectedCrops: ['Wheat', 'Jowar', 'Sugarcane'],
    symptoms: 'Grains or plant parts replaced by black, sooty masses of fungal spores. Whip-like structures in sugarcane.',
    causes: 'Seed-borne or soil-borne fungi, infection often occurs at the seedling stage or flowering.',
    prevention: ['Treat seeds with systemic fungicides before sowing', 'Use certified disease-free seed', 'Crop rotation', 'Rogue out infected plants'],
    management: ['Solarize seeds', 'Remove smut whips carefully in bags to prevent spore dispersal', 'Deep ploughing'],
    severity: 'moderate',
    monitoring: 'Inspect plants during heading and flowering stages for abnormal blackened grains or whips.'
  },
  {
    name: 'Leaf Curl Virus',
    scientificName: 'Begomovirus',
    type: 'viral',
    affectedCrops: ['Tomato', 'Chilli', 'Cotton'],
    symptoms: 'Severe upward or downward curling of leaves, crinkling, stunting of the plant, reduced fruit set.',
    causes: 'Transmitted by the whitefly vector.',
    prevention: ['Control whiteflies', 'Use resistant hybrids', 'Use barrier crops like maize/sorghum around the field', 'Remove weed hosts'],
    management: ['Install yellow sticky traps', 'Spray botanical or chemical insecticides to manage the vector', 'Uproot and destroy infected plants'],
    severity: 'high',
    monitoring: 'Monitor for whiteflies. Look for early signs of leaf curling and puckering in young leaves.'
  },
  {
    name: 'Anthracnose',
    scientificName: 'Colletotrichum spp.',
    type: 'fungal',
    affectedCrops: ['Chilli', 'Mango', 'Grapes'],
    symptoms: 'Dark, sunken circular lesions on leaves, stems, and fruits. Pinkish spore masses may appear in the center of lesions.',
    causes: 'Warm, humid weather, frequent rainfall, overhead irrigation.',
    prevention: ['Use disease-free seeds', 'Ensure proper spacing for ventilation', 'Avoid overhead irrigation', 'Remove infected plant debris'],
    management: ['Apply copper-based or systemic fungicides', 'Harvest fruits promptly', 'Prune infected branches in tree crops'],
    severity: 'moderate',
    monitoring: 'Check leaves and ripening fruits for small, dark, sunken spots during wet weather.'
  },
  {
    name: 'Brown Spot',
    scientificName: 'Bipolaris oryzae',
    type: 'fungal',
    affectedCrops: ['Rice'],
    symptoms: 'Numerous brown, oval to circular spots on leaves with a grey center and yellow halo. Also affects glumes.',
    causes: 'Nutritional deficiency (especially nitrogen or silicon), water stress, infected seeds.',
    prevention: ['Ensure balanced fertilization', 'Avoid water stress', 'Treat seeds before sowing', 'Use resistant varieties'],
    management: ['Correct soil nutrient deficiencies', 'Apply appropriate fungicides if severity is high', 'Improve soil health'],
    severity: 'moderate',
    monitoring: 'Observe leaves for characteristic brown spots, particularly in areas of the field with poor soil fertility.'
  },
  {
    name: 'Citrus Canker',
    scientificName: 'Xanthomonas citri',
    type: 'bacterial',
    affectedCrops: ['Citrus fruits'],
    symptoms: 'Raised, corky, crater-like lesions with yellow halos on leaves, stems, and fruits. Premature leaf and fruit drop.',
    causes: 'Bacterial infection spread by wind-driven rain, infected tools, and movement of infected plants.',
    prevention: ['Use certified disease-free nursery stock', 'Implement windbreaks', 'Disinfect pruning tools', 'Control leaf miners which create entry wounds'],
    management: ['Apply copper-based bactericides prophylactically', 'Prune and burn infected twigs', 'Maintain good tree vigor'],
    severity: 'high',
    monitoring: 'Regularly inspect new flush and young fruits for rough, raised lesions.'
  },
  {
    name: 'Panama Disease',
    scientificName: 'Fusarium oxysporum f. sp. cubense',
    type: 'fungal',
    affectedCrops: ['Banana'],
    symptoms: 'Progressive yellowing of older leaves, wilting, collapse of leaves forming a skirt around the pseudostem, splitting of pseudostem.',
    causes: 'Soil-borne fungus that invades the vascular system.',
    prevention: ['Plant resistant tissue-cultured varieties', 'Strict quarantine measures', 'Disinfect farm tools and footwear', 'Ensure good drainage'],
    management: ['Eradicate infected plants entirely', 'Do not replant susceptible varieties in infected soil', 'Apply biological control agents like Trichoderma'],
    severity: 'critical',
    monitoring: 'Look for yellowing of the margins of older leaves. Check cross-sections of the pseudostem for dark vascular discoloration.'
  },
  {
    name: 'Ergot',
    scientificName: 'Claviceps spp.',
    type: 'fungal',
    affectedCrops: ['Bajra', 'Jowar'],
    symptoms: 'Pinkish or honeydew-like liquid oozing from infected florets, later replaced by hard, dark, horn-like sclerotia.',
    causes: 'High humidity and cloudy weather during the flowering stage.',
    prevention: ['Use certified seeds free from sclerotia', 'Adjust sowing dates to avoid flowering during heavy rains', 'Deep summer ploughing', 'Crop rotation'],
    management: ['Soak seeds in salt water to separate floating sclerotia', 'Spray appropriate fungicides during the flowering stage if conditions favor disease'],
    severity: 'moderate',
    monitoring: 'Inspect panicles during flowering for honeydew exudation.'
  }
];

async function seedDiseases() {
  try {
    for (const disease of diseasesData) {
      await Disease.findOneAndUpdate(
        { name: disease.name },
        disease,
        { upsert: true, new: true }
      );
    }
    console.log(`Seeded ${diseasesData.length} diseases successfully`);
  } catch (error) {
    console.error('Error seeding diseases:', error);
    throw error;
  }
}

module.exports = seedDiseases;
