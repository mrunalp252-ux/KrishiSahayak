const mongoose = require('mongoose');
const Pest = require('../models/Pest');

const pestsData = [
  {
    name: 'Stem Borer',
    scientificName: 'Scirpophaga incertulas',
    localNames: { hi: 'तना छेदक', mr: 'खोडकीड' },
    affectedCrops: ['Rice', 'Sugarcane', 'Maize'],
    symptoms: 'Dead heart in vegetative stage, white ear head in reproductive stage, visible bore holes in stem.',
    causes: 'Warm humid conditions, excessive nitrogen application, late planting, failure to destroy previous crop stubbles.',
    prevention: ['Early planting', 'Use light traps to catch adult moths', 'Remove and destroy crop stubble after harvest', 'Avoid excessive nitrogen'],
    management: ['Biological control with Trichogramma cards', 'Plant resistant varieties', 'Apply granular insecticides like Cartap hydrochloride in severe cases'],
    severity: 'high',
    monitoring: 'Monitor field regularly for egg masses near the tips of leaves. Install pheromone traps 20 days after transplanting.'
  },
  {
    name: 'Bollworm',
    scientificName: 'Helicoverpa armigera',
    localNames: { hi: 'बॉलवर्म', mr: 'बोंडअळी' },
    affectedCrops: ['Cotton', 'Tomato', 'Gram', 'Pigeon Pea'],
    symptoms: 'Bored bolls/fruits, significant fruit damage, presence of frass (excreta) on plant parts.',
    causes: 'Continuous cropping of host plants, lack of natural enemies, favorable weather conditions.',
    prevention: ['Crop rotation with non-host crops', 'Deep summer ploughing to expose pupae', 'Planting trap crops like marigold'],
    management: ['Spray HaNPV (Helicoverpa armigera Nucleopolyhedrovirus)', 'Release Trichogramma chilonis', 'Apply appropriate chemical insecticides when threshold is crossed'],
    severity: 'critical',
    monitoring: 'Use pheromone traps (5/ha) to monitor moth activity. Scout fields twice a week for eggs and larvae.'
  },
  {
    name: 'Aphids',
    scientificName: 'Aphidoidea',
    localNames: { hi: 'माहू/एफिड', mr: 'मावा' },
    affectedCrops: ['Wheat', 'Mustard', 'Vegetables'],
    symptoms: 'Curling leaves, honeydew secretion leading to sooty mold, overall stunted growth.',
    causes: 'Cool and humid weather, high nitrogen levels in plants.',
    prevention: ['Avoid excessive nitrogen fertilizers', 'Maintain weed-free fields', 'Conserve natural enemies like ladybird beetles'],
    management: ['Spray Neem Seed Kernel Extract (NSKE 5%)', 'Use yellow sticky traps', 'Spray systemic insecticides if infestation is heavy'],
    severity: 'moderate',
    monitoring: 'Check undersides of leaves and tender shoots regularly. Yellow sticky traps help in early detection.'
  },
  {
    name: 'Whitefly',
    scientificName: 'Bemisia tabaci',
    localNames: { hi: 'सफेद मक्खी', mr: 'पांढरी माशी' },
    affectedCrops: ['Cotton', 'Tomato', 'Soybean'],
    symptoms: 'Yellowing of leaves, leaf curl, presence of sooty mold on honeydew, transmission of viral diseases.',
    causes: 'Dry and hot weather conditions, indiscriminate use of broad-spectrum insecticides.',
    prevention: ['Use tolerant varieties', 'Install yellow sticky traps', 'Avoid water stress'],
    management: ['Spray Neem oil (1500 ppm)', 'Use specific insect growth regulators', 'Protect and encourage natural predators'],
    severity: 'high',
    monitoring: 'Shake plants gently to observe flying adults. Monitor yellow sticky traps weekly.'
  },
  {
    name: 'Thrips',
    scientificName: 'Thysanoptera',
    localNames: { hi: 'थ्रिप्स', mr: 'फुलकिडे' },
    affectedCrops: ['Onion', 'Chilli', 'Groundnut'],
    symptoms: 'Silver streaks or white patches on leaves, scarring on fruits, curling of leaf margins upward.',
    causes: 'Dry weather spells, high temperature.',
    prevention: ['Maintain proper soil moisture', 'Intercropping', 'Seed treatment'],
    management: ['Spray botanical insecticides like Neem oil', 'Use blue sticky traps', 'Apply selective insecticides when damage is visible'],
    severity: 'moderate',
    monitoring: 'Check for silvery patches on leaves. Tap flowers over a white sheet of paper to detect thrips.'
  },
  {
    name: 'Army Worm',
    scientificName: 'Spodoptera',
    localNames: { hi: 'सैनिक कीट', mr: 'लष्करी अळी' },
    affectedCrops: ['Maize', 'Rice', 'Jowar'],
    symptoms: 'Leaves skeletonized by young larvae, complete defoliation by older larvae, mass feeding behavior.',
    causes: 'Extended dry spells followed by heavy rains, availability of grassy weeds.',
    prevention: ['Clean cultivation', 'Trenching around fields to prevent migration', 'Deep ploughing'],
    management: ['Use poison bait (bran + jaggery + insecticide)', 'Spray Spodoptera NPV', 'Apply chemical insecticides during evening hours'],
    severity: 'high',
    monitoring: 'Look for egg masses covered with brown hairs. Monitor using pheromone traps.'
  },
  {
    name: 'Pod Borer',
    scientificName: 'Maruca vitrata',
    localNames: { hi: 'फली छेदक', mr: 'शेंग पोखरणारी अळी' },
    affectedCrops: ['Gram', 'Pigeon Pea', 'Soybean'],
    symptoms: 'Holes in pods, larvae feeding inside pods destroying seeds, webbing of flowers and pods.',
    causes: 'Favorable temperature and humidity during flowering and pod formation stages.',
    prevention: ['Synchronized sowing', 'Use of early maturing varieties', 'Intercropping with non-host plants'],
    management: ['Spray Neem formulations', 'Install bird perches', 'Need-based application of systemic insecticides'],
    severity: 'high',
    monitoring: 'Monitor during flowering and pod development stages. Look for webbed flowers and bored pods.'
  },
  {
    name: 'Fruit Borer',
    scientificName: 'Leucinodes orbonalis',
    localNames: { hi: 'फल छेदक', mr: 'फळ पोखरणारी अळी' },
    affectedCrops: ['Tomato', 'Brinjal', 'Chilli'],
    symptoms: 'Bore holes in fruits plugged with excreta, wilting of terminal shoots, rotting of fruits.',
    causes: 'Continuous cultivation of Solanaceous crops, poor field sanitation.',
    prevention: ['Remove and destroy wilted shoots regularly', 'Crop rotation', 'Use nylon net barriers for nurseries'],
    management: ['Release Trichogramma wasps', 'Regular harvesting of affected fruits', 'Apply recommended insecticides judiciously'],
    severity: 'moderate',
    monitoring: 'Look for drooping of terminal shoots. Check fruits for small entry holes.'
  },
  {
    name: 'Jassids',
    scientificName: 'Amrasca biguttula',
    localNames: { hi: 'हरा फुदका', mr: 'तुडतुडे' },
    affectedCrops: ['Cotton', 'Okra', 'Brinjal'],
    symptoms: 'Yellowing of leaf margins, downward curling of leaves, hopper burn (browning and drying of leaves).',
    causes: 'Humid weather conditions, close spacing, excessive nitrogen.',
    prevention: ['Use resistant/hairy leaf varieties', 'Maintain optimal spacing', 'Balanced fertilizer application'],
    management: ['Spray Neem seed extract', 'Use systemic insecticides if hopper burn is observed'],
    severity: 'moderate',
    monitoring: 'Observe the underside of leaves for fast-moving wedge-shaped greenish insects.'
  },
  {
    name: 'Root Grubs',
    scientificName: 'Holotrichia spp.',
    localNames: { hi: 'सफेद ग्रब', mr: 'पांढरी हुमणी' },
    affectedCrops: ['Sugarcane', 'Groundnut', 'Potato'],
    symptoms: 'Yellowing and wilting of plants in patches, root damage, plants can be easily pulled out.',
    causes: 'Application of un-decomposed farmyard manure, proximity to host trees (neem, babool) for adult beetles.',
    prevention: ['Use well-decomposed manure', 'Deep summer ploughing', 'Light traps for adult beetles during early monsoon'],
    management: ['Soil application of granular insecticides', 'Drenching with entomopathogenic nematodes or fungi'],
    severity: 'high',
    monitoring: 'Dig soil near wilted plants to find fleshy white grubs. Monitor adult beetle emergence after first monsoon showers.'
  },
  {
    name: 'Mealy Bug',
    scientificName: 'Pseudococcidae',
    localNames: { hi: 'मिली बग', mr: 'ढेकणी' },
    affectedCrops: ['Cotton', 'Grapes', 'Papaya'],
    symptoms: 'White waxy cottony coating on stems and leaves, stunted growth, presence of ants, sooty mold.',
    causes: 'Dry weather, spread through ants, wind, and farm implements.',
    prevention: ['Remove weed hosts', 'Destroy infested plant parts', 'Control ant populations'],
    management: ['Release predator ladybird beetle (Cryptolaemus montrouzieri)', 'Spray botanical oils or specific insecticides directed at colonies'],
    severity: 'moderate',
    monitoring: 'Look for white cottony masses on stems, leaf axils, and fruits. Presence of ants is a strong indicator.'
  },
  {
    name: 'Red Spider Mite',
    scientificName: 'Tetranychus urticae',
    localNames: { hi: 'लाल मकड़ी', mr: 'लाल कोळी' },
    affectedCrops: ['Cotton', 'Brinjal', 'Tea'],
    symptoms: 'Yellowing or stippling on leaves, fine silken webbing on the underside of leaves, defoliation.',
    causes: 'Dry and hot weather conditions, dusty environments.',
    prevention: ['Keep fields free from weeds', 'Sprinkler irrigation helps wash away mites', 'Avoid dust accumulation'],
    management: ['Apply specific acaricides/miticides', 'Spray botanical extracts', 'Release predatory mites'],
    severity: 'moderate',
    monitoring: 'Check undersides of leaves with a hand lens for tiny moving red/green specks and fine webs.'
  },
  {
    name: 'Brown Plant Hopper',
    scientificName: 'Nilaparvata lugens',
    localNames: { hi: 'भूरा फुदका', mr: 'तपकिरी तुडतुडे' },
    affectedCrops: ['Rice'],
    symptoms: 'Hopper burn (drying of plants in circular patches), presence of honeydew and sooty mold.',
    causes: 'Continuous standing water, high nitrogen fertilizer, dense planting, continuous rice cropping.',
    prevention: ['Alternate wetting and drying of field', 'Maintain alleyways (skip one row for every 2m)', 'Judicious nitrogen use'],
    management: ['Spray targeted insecticides at the base of plants', 'Use resistant varieties', 'Conserve natural enemies like spiders'],
    severity: 'critical',
    monitoring: 'Part the rice plants and look at the basal region near the water level for brown insects.'
  },
  {
    name: 'Diamondback Moth',
    scientificName: 'Plutella xylostella',
    localNames: { hi: 'डायमंड बैक मॉथ', mr: 'डायमंड बॅक मॉथ' },
    affectedCrops: ['Cabbage', 'Cauliflower'],
    symptoms: 'Windowing of leaves (larvae feed on the lower epidermis leaving upper epidermis intact), severe defoliation.',
    causes: 'Continuous cultivation of cruciferous crops, resistance to many insecticides.',
    prevention: ['Trap cropping with Indian mustard', 'Clean cultivation', 'Crop rotation'],
    management: ['Use Bt (Bacillus thuringiensis) formulations', 'Spray Neem seed extract', 'Rotate chemical classes to prevent resistance'],
    severity: 'moderate',
    monitoring: 'Look for small green larvae on the underside of leaves and small moths flying when plants are disturbed.'
  },
  {
    name: 'Shoot Fly',
    scientificName: 'Atherigona soccata',
    localNames: { hi: 'तना मक्खी', mr: 'खोड माशी' },
    affectedCrops: ['Jowar', 'Bajra'],
    symptoms: 'Dead heart in seedlings (central leaf dries up and can be pulled out easily), profuse tillering.',
    causes: 'Late sowing, high humidity.',
    prevention: ['Early and synchronized sowing', 'Use high seed rate and thin later', 'Seed treatment'],
    management: ['Soil application of granular insecticides at sowing', 'Foliar spray if damage exceeds threshold'],
    severity: 'high',
    monitoring: 'Monitor seedlings 1-4 weeks after emergence. Check for white cigar-shaped eggs on the underside of leaves.'
  }
];

async function seedPests() {
  try {
    for (const pest of pestsData) {
      await Pest.findOneAndUpdate(
        { name: pest.name },
        pest,
        { upsert: true, new: true }
      );
    }
    console.log(`Seeded ${pestsData.length} pests successfully`);
  } catch (error) {
    console.error('Error seeding pests:', error);
    throw error;
  }
}

module.exports = seedPests;
