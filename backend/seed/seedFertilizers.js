const FertilizerGuide = require('../models/FertilizerGuide');

const fertilizersData = [
  // Rice
  {
    crop: 'Rice',
    soilType: 'clay',
    growthStage: 'Basal/Transplanting',
    fertilizers: [
      { name: 'DAP', amount: '50 kg/acre', purpose: 'Root establishment' },
      { name: 'NPK 20:20:0', amount: '50 kg/acre', purpose: 'Early vegetative growth' }
    ],
    guidance: 'Apply during last puddling before transplanting for even distribution in the root zone.',
    safetyNotes: 'Do not apply urea directly with seeds. Ensure even distribution.',
    localContent: {
      hi: { guidance: 'रोपाई से पहले अंतिम पडलिंग के दौरान प्रयोग करें।', safetyNotes: 'बीजों के साथ सीधे यूरिया न डालें।' },
      mr: { guidance: 'पुनर्लागवडीपूर्वी शेवटच्या चिखलणीच्या वेळी द्यावे.', safetyNotes: 'बियाण्यांसोबत थेट युरिया देऊ नका.' }
    }
  },
  {
    crop: 'Rice',
    soilType: 'alluvial',
    growthStage: 'Tillering stage',
    fertilizers: [
      { name: 'Urea', amount: '25 kg/acre', purpose: 'Vegetative growth and tillering' }
    ],
    guidance: 'Top dress 30 days after transplanting when field has slight moisture but no standing water.',
    safetyNotes: 'Avoid broadcasting urea when wind is high.',
    localContent: {
      hi: { guidance: 'रोपाई के 30 दिन बाद टॉप ड्रेसिंग करें।', safetyNotes: 'तेज हवा में यूरिया का छिड़काव न करें।' },
      mr: { guidance: 'लागवडीनंतर 30 दिवसांनी युरिया द्यावा.', safetyNotes: 'वारा असताना युरिया फेकू नका.' }
    }
  },
  {
    crop: 'Rice',
    soilType: 'clay',
    growthStage: 'Panicle initiation',
    fertilizers: [
      { name: 'MOP (Muriate of Potash)', amount: '20 kg/acre', purpose: 'Grain filling and weight' },
      { name: 'Urea', amount: '25 kg/acre', purpose: 'Panicle development' }
    ],
    guidance: 'Apply at Panicle Initiation (PI) stage, roughly 45-50 days after transplanting.',
    safetyNotes: 'Ensure field is weed-free before application.',
    localContent: {
      hi: { guidance: 'पैनिकल निकलने के समय प्रयोग करें।', safetyNotes: 'प्रयोग से पहले खेत को खरपतवार मुक्त रखें।' },
      mr: { guidance: 'लोंबी बाहेर पडताना खत द्यावे.', safetyNotes: 'खत देण्यापूर्वी शेत तणमुक्त असावे.' }
    }
  },

  // Wheat
  {
    crop: 'Wheat',
    soilType: 'loamy',
    growthStage: 'Basal',
    fertilizers: [
      { name: 'DAP', amount: '50 kg/acre', purpose: 'Early root and shoot growth' },
      { name: 'Urea', amount: '20 kg/acre', purpose: 'Initial nitrogen boost' }
    ],
    guidance: 'Apply at the time of sowing. Seed-cum-fertilizer drill is recommended.',
    safetyNotes: 'Keep a safe distance between seed and fertilizer to avoid seed burning.',
    localContent: {
      hi: { guidance: 'बुवाई के समय डालें। सीड-कम-फर्टिलाइजर ड्रिल का उपयोग करें।', safetyNotes: 'बीज जलने से बचाने के लिए दूरी रखें।' },
      mr: { guidance: 'पेरणीच्या वेळी द्यावे. सीड-कम-फर्टिलायझर ड्रिल वापरा.', safetyNotes: 'बियाणे जळू नये म्हणून खत आणि बियाणे यात अंतर ठेवा.' }
    }
  },
  {
    crop: 'Wheat',
    soilType: 'loamy',
    growthStage: 'First irrigation',
    fertilizers: [
      { name: 'Urea', amount: '35 kg/acre', purpose: 'Promote tillering' }
    ],
    guidance: 'Apply urea top dress 21 days after sowing (CRI stage) followed by irrigation.',
    safetyNotes: 'Do not apply urea heavily in one spot.',
    localContent: {
      hi: { guidance: 'बुवाई के 21 दिन बाद यूरिया दें।', safetyNotes: 'एक ही जगह पर ज्यादा यूरिया न डालें।' },
      mr: { guidance: 'पेरणीनंतर 21 दिवसांनी युरिया द्यावा.', safetyNotes: 'एकाच ठिकाणी जास्त युरिया टाकू नका.' }
    }
  },
  {
    crop: 'Wheat',
    soilType: 'alluvial',
    growthStage: 'Second irrigation',
    fertilizers: [
      { name: 'Urea', amount: '35 kg/acre', purpose: 'Ear formation and grain setting' }
    ],
    guidance: 'Apply before the second irrigation, around 45-50 days after sowing.',
    safetyNotes: 'Apply evenly across the field.',
    localContent: {
      hi: { guidance: 'दूसरी सिंचाई से पहले डालें।', safetyNotes: 'खेत में समान रूप से डालें।' },
      mr: { guidance: 'दुसऱ्या पाण्याच्या वेळी द्यावे.', safetyNotes: 'शेतात समान रीतीने द्यावे.' }
    }
  },

  // Cotton
  {
    crop: 'Cotton',
    soilType: 'black',
    growthStage: 'Basal',
    fertilizers: [
      { name: 'NPK 10:26:26', amount: '50 kg/acre', purpose: 'Root development and early vigor' }
    ],
    guidance: 'Apply as a basal dose before or at the time of sowing.',
    safetyNotes: 'Mix well with soil.',
    localContent: {
      hi: { guidance: 'बुवाई के समय या उससे पहले डालें।', safetyNotes: 'मिट्टी में अच्छी तरह मिलाएं।' },
      mr: { guidance: 'पेरणीच्या वेळी किंवा त्यापूर्वी द्यावे.', safetyNotes: 'मातीत चांगले मिसळा.' }
    }
  },
  {
    crop: 'Cotton',
    soilType: 'black',
    growthStage: 'Square formation',
    fertilizers: [
      { name: 'Urea', amount: '30 kg/acre', purpose: 'Vegetative growth and flowering' },
      { name: 'MOP', amount: '20 kg/acre', purpose: 'Stress tolerance and boll size' }
    ],
    guidance: 'Apply 45-50 days after sowing in ring method around the plant.',
    safetyNotes: 'Do not let fertilizer touch the plant stem.',
    localContent: {
      hi: { guidance: 'पौधे के चारों ओर रिंग बनाकर डालें।', safetyNotes: 'खाद को तने से न छूने दें।' },
      mr: { guidance: 'रोपाच्या आजूबाजूला गोल रिंगण करून द्यावे.', safetyNotes: 'खत खोडाला लागू देऊ नका.' }
    }
  },
  {
    crop: 'Cotton',
    soilType: 'black',
    growthStage: 'Boll development',
    fertilizers: [
      { name: 'Micronutrients', amount: 'Foliar spray', purpose: 'Prevent boll drop and improve size' }
    ],
    guidance: 'Foliar spray of micronutrients (Zn, Mg, B) along with 2% DAP.',
    safetyNotes: 'Spray during cool hours of morning or evening.',
    localContent: {
      hi: { guidance: 'सूक्ष्म पोषक तत्वों का छिड़काव करें।', safetyNotes: 'सुबह या शाम के समय छिड़काव करें।' },
      mr: { guidance: 'सूक्ष्म अन्नद्रव्यांची फवारणी करा.', safetyNotes: 'सकाळी किंवा संध्याकाळी फवारणी करावी.' }
    }
  },

  // Soybean
  {
    crop: 'Soybean',
    soilType: 'loamy',
    growthStage: 'Basal',
    fertilizers: [
      { name: 'DAP', amount: '40 kg/acre', purpose: 'Early growth and nodulation' },
      { name: 'Sulphur', amount: '10 kg/acre', purpose: 'Improve oil content' }
    ],
    guidance: 'Apply at sowing. Seed treatment with Rhizobium is highly recommended.',
    safetyNotes: 'Sulphur is crucial for oilseed crops.',
    localContent: {
      hi: { guidance: 'बुवाई के समय डालें। राइजोबियम से बीज उपचार करें।', safetyNotes: 'तिलहन के लिए सल्फर आवश्यक है।' },
      mr: { guidance: 'पेरणीच्या वेळी द्यावे. रायझोबियमची बीजप्रक्रिया करावी.', safetyNotes: 'गळीत धान्यासाठी सल्फर आवश्यक आहे.' }
    }
  },
  {
    crop: 'Soybean',
    soilType: 'black',
    growthStage: 'Flowering stage',
    fertilizers: [
      { name: 'Urea', amount: '20 kg/acre', purpose: 'Support pod formation' }
    ],
    guidance: 'Apply if growth is poor, otherwise Soybean fixes its own nitrogen.',
    safetyNotes: 'Only apply if symptoms of nitrogen deficiency are observed.',
    localContent: {
      hi: { guidance: 'फूल आने पर डालें यदि वृद्धि कम हो।', safetyNotes: 'केवल कमी दिखने पर ही डालें।' },
      mr: { guidance: 'वाढ कमी असल्यास फुलांच्या अवस्थेत द्यावे.', safetyNotes: 'कमतरता दिसल्यासच द्यावे.' }
    }
  },

  // Sugarcane
  {
    crop: 'Sugarcane',
    soilType: 'alluvial',
    growthStage: 'Planting',
    fertilizers: [
      { name: 'NPK 12:32:16', amount: '100 kg/acre', purpose: 'Initial sett establishment' }
    ],
    guidance: 'Apply in furrows before placing setts.',
    safetyNotes: 'Ensure adequate moisture before planting.',
    localContent: {
      hi: { guidance: 'गन्ने की बुवाई से पहले खाइयों में डालें।', safetyNotes: 'बुवाई से पहले पर्याप्त नमी सुनिश्चित करें।' },
      mr: { guidance: 'ऊस लागवडीपूर्वी सरीत द्यावे.', safetyNotes: 'लागवडीपूर्वी जमिनीत पुरेसा ओलावा असावा.' }
    }
  },
  {
    crop: 'Sugarcane',
    soilType: 'alluvial',
    growthStage: 'Earthing up',
    fertilizers: [
      { name: 'Urea', amount: '50 kg/acre', purpose: 'Cane elongation' },
      { name: 'MOP', amount: '30 kg/acre', purpose: 'Sugar accumulation' }
    ],
    guidance: 'Apply along the rows just before earthing up operation (around 90-120 days).',
    safetyNotes: 'Irrigate immediately after earthing up.',
    localContent: {
      hi: { guidance: 'मिट्टी चढ़ाते समय डालें।', safetyNotes: 'मिट्टी चढ़ाने के तुरंत बाद सिंचाई करें।' },
      mr: { guidance: 'भरणीच्या वेळी द्यावे.', safetyNotes: 'भरणीनंतर लगेच पाणी द्यावे.' }
    }
  },

  // Onion
  {
    crop: 'Onion',
    soilType: 'sandy',
    growthStage: 'Transplanting',
    fertilizers: [
      { name: 'SSP (Single Super Phosphate)', amount: '100 kg/acre', purpose: 'Root development' },
      { name: 'MOP', amount: '20 kg/acre', purpose: 'Disease resistance' }
    ],
    guidance: 'Mix well in the soil before transplanting seedlings.',
    safetyNotes: 'Avoid excess nitrogen at basal.',
    localContent: {
      hi: { guidance: 'रोपाई से पहले मिट्टी में अच्छी तरह मिला लें।', safetyNotes: 'शुरुआत में अधिक यूरिया न दें।' },
      mr: { guidance: 'पुनर्लागवडीपूर्वी जमिनीत चांगले मिसळून घ्यावे.', safetyNotes: 'सुरुवातीला जास्त नत्र देऊ नये.' }
    }
  },
  {
    crop: 'Onion',
    soilType: 'sandy',
    growthStage: 'Bulb formation',
    fertilizers: [
      { name: 'Urea', amount: '30 kg/acre', purpose: 'Vegetative growth before bulb swelling' },
      { name: 'Sulphur', amount: '15 kg/acre', purpose: 'Pungency and keeping quality' }
    ],
    guidance: 'Apply 30 and 45 days after transplanting in split doses.',
    safetyNotes: 'Stop nitrogen application 45 days before harvest to prevent thick necks.',
    localContent: {
      hi: { guidance: 'रोपाई के 30 और 45 दिन बाद दें।', safetyNotes: 'कटाई से 45 दिन पहले नाइट्रोजन देना बंद कर दें।' },
      mr: { guidance: 'लागवडीनंतर 30 व 45 दिवसांनी द्यावे.', safetyNotes: 'काढणीच्या 45 दिवस अगोदर नत्र देणे थांबवावे.' }
    }
  },

  // Tomato
  {
    crop: 'Tomato',
    soilType: 'loamy',
    growthStage: 'Transplanting',
    fertilizers: [
      { name: 'DAP', amount: '50 kg/acre', purpose: 'Establishment' },
      { name: 'MOP', amount: '25 kg/acre', purpose: 'Overall vigor' }
    ],
    guidance: 'Apply as basal dose. Farmyard manure (FYM) addition is highly recommended.',
    safetyNotes: 'Mix thoroughly with soil.',
    localContent: {
      hi: { guidance: 'रोपाई के समय डालें। गोबर की खाद भी मिलाएँ।', safetyNotes: 'मिट्टी में अच्छे से मिलाएँ।' },
      mr: { guidance: 'लागवडीच्या वेळी द्यावे. शेणखत वापरणे फायदेशीर ठरते.', safetyNotes: 'मातीत चांगले मिसळा.' }
    }
  },
  {
    crop: 'Tomato',
    soilType: 'loamy',
    growthStage: 'Flowering & Fruiting',
    fertilizers: [
      { name: 'Urea', amount: '25 kg/acre', purpose: 'Canopy maintenance' },
      { name: 'Calcium Nitrate', amount: '10 kg/acre', purpose: 'Prevent blossom end rot' }
    ],
    guidance: 'Apply in splits at 30, 45, and 60 days. Calcium spray helps prevent fruit rotting.',
    safetyNotes: 'Maintain uniform irrigation to maximize fertilizer uptake.',
    localContent: {
      hi: { guidance: '30, 45 और 60 दिन पर बाँट कर दें।', safetyNotes: 'सिंचाई समान रूप से करते रहें।' },
      mr: { guidance: '30, 45 आणि 60 दिवसांनी विभागून द्यावे.', safetyNotes: 'पाण्याचे नियोजन समान ठेवावे.' }
    }
  },

  // Maize
  {
    crop: 'Maize',
    soilType: 'alluvial',
    growthStage: 'Sowing',
    fertilizers: [
      { name: 'NPK 12:32:16', amount: '50 kg/acre', purpose: 'Early vigor' },
      { name: 'Zinc Sulphate', amount: '10 kg/acre', purpose: 'Prevent white bud disease' }
    ],
    guidance: 'Apply basal dose 5 cm below and 5 cm away from seed.',
    safetyNotes: 'Zinc deficiency is common in maize, do not skip.',
    localContent: {
      hi: { guidance: 'बीज से 5 सेमी दूर और नीचे डालें। जिंक सल्फेट अवश्य डालें।', safetyNotes: 'जिंक की कमी से बचें।' },
      mr: { guidance: 'बियाण्यापासून 5 सेमी दूर आणि खाली द्यावे. झिंक सल्फेट नक्की वापरा.', safetyNotes: 'झिंकची कमतरता टाळा.' }
    }
  },
  {
    crop: 'Maize',
    soilType: 'alluvial',
    growthStage: 'Knee-high stage',
    fertilizers: [
      { name: 'Urea', amount: '35 kg/acre', purpose: 'Rapid vegetative growth' }
    ],
    guidance: 'Top dress when plants are knee-high (around 30 days).',
    safetyNotes: 'Apply when soil is moist.',
    localContent: {
      hi: { guidance: 'पौधे घुटने की ऊंचाई तक आने पर डालें।', safetyNotes: 'मिट्टी में नमी होने पर ही डालें।' },
      mr: { guidance: 'रोपे गुडघ्याइतकी झाल्यावर युरिया द्यावा.', safetyNotes: 'जमिनीत ओलावा असताना खत द्यावे.' }
    }
  }
];

async function seedFertilizers() {
  try {
    for (const fert of fertilizersData) {
      const fertType = fert.fertilizers && fert.fertilizers.length
        ? fert.fertilizers.map(f => `${f.name} (${f.amount})`).join(', ')
        : 'NPK Balanced Fertilizer';

      const fertPurpose = fert.fertilizers && fert.fertilizers.length
        ? fert.fertilizers.map(f => `${f.name}: ${f.purpose}`).join('; ')
        : 'Promotes crop growth and yield';

      const formatted = {
        crop: fert.crop,
        soilType: fert.soilType,
        growthStage: fert.growthStage,
        applicationStage: fert.growthStage,
        fertilizerType: fertType,
        purpose: fertPurpose,
        fertilizers: fert.fertilizers || [],
        guidance: fert.guidance,
        safetyNotes: fert.safetyNotes,
        localContent: fert.localContent || {},
        isActive: true
      };

      await FertilizerGuide.findOneAndUpdate(
        { crop: fert.crop, soilType: fert.soilType, growthStage: fert.growthStage },
        formatted,
        { upsert: true, new: true }
      );
    }
    console.log(`Seeded ${fertilizersData.length} fertilizer guides successfully`);
  } catch (error) {
    console.error('Error seeding fertilizers:', error);
    throw error;
  }
}

module.exports = seedFertilizers;
