const logger = require('../utils/logger');
const Scheme = require('../models/Scheme');

const DEFAULT_SCHEMES = [
  {
    title: 'PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)',
    shortCode: 'PM-KISAN',
    titleHi: 'प्रधानमंत्री किसान सम्मान निधि (PM-KISAN)',
    titleMr: 'प्रधानमंत्री किसान सन्मान निधी (PM-KISAN)',
    description: 'Income support scheme of ₹6,000 per year in three equal installments of ₹2,000 directly into the bank accounts of all landholding farmer families.',
    descriptionHi: 'सभी भूमिधारक किसान परिवारों के बैंक खातों में ₹2,000 की तीन समान किस्तों में प्रति वर्ष ₹6,000 की प्रत्यक्ष आय सहायता योजना।',
    descriptionMr: 'सर्व जमीनधारक शेतकरी कुटुंबांच्या बँक खात्यात थेट ₹२,००० च्या तीन समान हप्त्यांमध्ये दरवर्षी ₹६,००० चे उत्पन्न साहाय्य.',
    category: 'financial_support',
    level: 'central',
    state: 'All India',
    benefits: '₹6,000 per year direct benefit transfer (DBT) in 3 installments every 4 months.',
    benefitsHi: 'प्रत्येक 4 महीने में 3 किस्तों में प्रति वर्ष ₹6,000 प्रत्यक्ष लाभ अंतरण (DBT)।',
    benefitsMr: 'दर ४ महिन्यांनी ३ हप्त्यांमध्ये वर्षाला ₹६,००० थेट बँक खात्यात जमा (DBT).',
    eligibility: [
      'Small and marginal farmer families with cultivable landholding',
      'Valid Aadhaar card linked with bank account',
      'Land records updated in State Revenue Portal'
    ],
    documents: ['Aadhaar Card', 'Land 7/12 & 8A (or state land records)', 'Bank Passbook / Account details'],
    applicationUrl: 'https://pmkisan.gov.in',
    helpline: '155261 / 011-24300606',
    isActive: true
  },
  {
    title: 'PMFBY (Pradhan Mantri Fasal Bima Yojana)',
    shortCode: 'PMFBY',
    titleHi: 'प्रधानमंत्री फसल बीमा योजना (PMFBY)',
    titleMr: 'प्रधानमंत्री पीक विमा योजना (PMFBY)',
    description: 'Comprehensive risk insurance coverage from pre-sowing to post-harvest against non-preventable natural risks (drought, flood, unseasonal rain, pest attack).',
    descriptionHi: 'प्राकृतिक आपदाओं (सूखा, बाढ़, बेमौसम बारिश, कीट प्रकोप) के विरुद्ध बुवाई से लेकर कटाई के बाद तक व्यापक फसल बीमा सुरक्षा।',
    descriptionMr: 'नैसर्गिक आपत्ती (दुष्काळ, पूर, अवकाळी पाऊस, कीड-रोग) विरुद्ध पेरणीपूर्व ते काढणीपश्चात संपूर्ण पीक विमा संरक्षण. अवघ्या १ रुपयात विमा.',
    category: 'crop_insurance',
    level: 'central',
    state: 'All India',
    benefits: 'Uniform low premium (2% Kharif, 1.5% Rabi, 5% commercial/horticultural crops). Quick claim settlement into bank accounts.',
    benefitsHi: 'समान कम प्रीमियम (2% खरीफ, 1.5% रबी, 5% वाणिज्यिक फसलें)। बैंक खातों में त्वरित दावा भुगतान।',
    benefitsMr: 'अल्प हप्ता दर (खरीप २%, रब्बी १.५%, बागायती ५%). नुकसान भरपाई थेट बँक खात्यात जमा.',
    eligibility: [
      'All farmers growing notified crops in notified areas (loanee and non-loanee)',
      'Tenant farmers and sharecroppers eligible with cultivation agreement'
    ],
    documents: ['Aadhaar Card', 'Land Record (7/12, 8A)', 'Sowing Certificate / Self declaration', 'Bank Passbook'],
    applicationUrl: 'https://pmfby.gov.in',
    helpline: '1800-180-1551',
    isActive: true
  },
  {
    title: 'Kisan Credit Card (KCC) Scheme',
    shortCode: 'KCC',
    titleHi: 'किसान क्रेडिट कार्ड (KCC)',
    titleMr: 'किसान क्रेडिट कार्ड (KCC)',
    description: 'Timely and adequate institutional credit to farmers for cultivation expenses, post-harvest costs, produce marketing, and maintenance of farm assets.',
    descriptionHi: 'फसल उत्पादन, कटाई के बाद के खर्च, विपणन और कृषि संपत्तियों के रखरखाव के लिए किसानों को समय पर और पर्याप्त रियायती संस्थागत ऋण।',
    descriptionMr: 'पिकांच्या लागवडीचा खर्च, बी-बियाणे, खते, कीटकनाशके आणि शेती साहित्य खरेदीसाठी सुलभ व सवलतीच्या व्याजदरात कर्ज पुरवठा.',
    category: 'credit',
    level: 'central',
    state: 'All India',
    benefits: 'Credit up to ₹3,00,000 at an effective interest rate of 4% (with 3% prompt repayment subvention). No collateral required up to ₹1,60,000.',
    benefitsHi: 'त्वरित पुनर्भुगतान पर 4% की प्रभावी ब्याज दर पर ₹3,00,000 तक का ऋण। ₹1,60,000 तक कोई बंधक/जमानत आवश्यक नहीं।',
    benefitsMr: 'वेळेवर परतफेड केल्यास केवळ ४% व्याजदराने ₹३,००,००० पर्यंत कर्ज. ₹१,६०,००० पर्यंत विनातारण कर्ज.',
    eligibility: [
      'All individual farmers / joint borrowers who are owner cultivators',
      'Tenant farmers, oral lessees & sharecroppers',
      'Self Help Groups (SHGs) or Joint Liability Groups (JLGs)'
    ],
    documents: ['Duly filled KCC application', 'Identity & Address Proof (Aadhaar, Voter ID)', 'Land Revenue Documents', 'Passport photo'],
    applicationUrl: 'https://www.myscheme.gov.in/schemes/kcc',
    helpline: '1800-115-526',
    isActive: true
  },
  {
    title: 'Soil Health Card Scheme',
    shortCode: 'SHC',
    titleHi: 'मृदा स्वास्थ्य कार्ड योजना',
    titleMr: 'मृदा आरोग्य पत्रिका योजना (Soil Health Card)',
    description: 'Government issues soil cards to farmers containing nutrient status (12 parameters: N, P, K, S, Zn, Fe, Cu, Mn, Bo, pH, EC, OC) and customized fertilizer dosage recommendations.',
    descriptionHi: 'किसानों को 12 पोषक तत्वों की स्थिति और फसलवार उपयुक्त उर्वरक मात्रा की सिफारिशों वाला मृदा कार्ड प्रदान किया जाता है।',
    descriptionMr: 'शेतकऱ्यांना जमिनीतील १२ अन्नद्रव्यांची स्थिती आणि खतांच्या संतुलित वापराबाबत मार्गदर्शन करणारी आरोग्य पत्रिका दर २ वर्षांनी मिळते.',
    category: 'soil_health',
    level: 'central',
    state: 'All India',
    benefits: 'Customized NPK and micronutrient dosage recommendations to cut fertilizer costs by 20-30% and boost crop yield by 10-15%.',
    benefitsHi: 'संतुलित खाद सिफारिश से उर्वरक खर्च में 20-30% की कमी और पैदावार में 10-15% की वृद्धि।',
    benefitsMr: 'संतुलित रासायनिक व सेंद्रिय खतांच्या वापरामुळे खतांच्या खर्चात २०-३०% बचत आणि उत्पादनात १०-१५% वाढ.',
    eligibility: [
      'Every farmer across all States and Union Territories of India'
    ],
    documents: ['Land ownership details (Gut / Survey number)', 'Farmer Aadhaar & contact number'],
    applicationUrl: 'https://soilhealth.dac.gov.in',
    helpline: '011-24305591',
    isActive: true
  },
  {
    title: 'PM Krishi Sinchayee Yojana (PMKSY - Per Drop More Crop)',
    shortCode: 'PMKSY',
    titleHi: 'प्रधानमंत्री कृषि सिंचाई योजना (प्रति बूंद अधिक फसल)',
    titleMr: 'प्रधानमंत्री कृषी सिंचन योजना (प्रति थेंब अधिक पीक)',
    description: 'Promotes micro-irrigation technologies (drip and sprinkler systems) to maximize water use efficiency, reduce input costs, and enhance farmer incomes.',
    descriptionHi: 'जल उपयोग दक्षता बढ़ाने और कृषि लागत कम करने के लिए ड्रिप व स्प्रिंकलर सिंचाई तकनीकों पर भारी सब्सिडी।',
    descriptionMr: 'ठिबक आणि तुषार सिंचन पद्धतीचा अवलंब करण्यासाठी ५५% ते ७०% पर्यंत सरकारी अनुदान.',
    category: 'irrigation',
    level: 'central',
    state: 'All India',
    benefits: '55% subsidy for small and marginal farmers, 45% subsidy for other farmers on micro-irrigation equipment installation.',
    benefitsHi: 'छोटे व सीमांत किसानों को 55% और अन्य किसानों को 45% तक ड्रिप/स्प्रिंकलर संयंत्र सब्सिडी।',
    benefitsMr: 'लहान व अत्यल्प भूधारक शेतकऱ्यांना ५५% तर इतर शेतकऱ्यांना ४५% अनुदान उपलब्ध.',
    eligibility: [
      'Farmers of all categories having land with assured irrigation water source'
    ],
    documents: ['Land Record 7/12 & 8A', 'Electricity bill / Source of water proof', 'Aadhaar Card', 'Bank Passbook', 'Quotation from authorized dealer'],
    applicationUrl: 'https://pmksy.gov.in',
    helpline: '1800-180-1551',
    isActive: true
  },
  {
    title: 'MahaDBT Farmer Schemes / PoCRA (Maharashtra)',
    shortCode: 'MAHADBT-POCRA',
    titleHi: 'महाडीबीटी शेतकरी योजना / पोकरा (महाराष्ट्र)',
    titleMr: 'महाडीबीटी शेतकरी योजना / नानाजी देशमुख कृषी संजीवनी (पोकरा)',
    description: 'State government initiative for climate resilient agriculture, providing online DBT subsidies for tractors, rotavators, farm ponds, shade nets, horticulture, and solar pumps.',
    descriptionHi: 'महाराष्ट्र सरकार की एकीकृत डीबीटी सब्सिडी योजना - ट्रैक्टर, कृषि उपकरण, शेततळे, शेडनेट, बागवानी एवं सोलर पंप पर सीधी सब्सिडी।',
    descriptionMr: 'कृषी यांत्रिकीकरण, शेततळे, शेडनेट हाऊस, फळबाग लागवड, तुषार/ठिबक सिंचन आणि सौर कृषी पंपासाठी एकाच छताखाली थेट अनुदान.',
    category: 'subsidy',
    level: 'state',
    state: 'Maharashtra',
    benefits: 'Subsidies up to 50% - 75% on farm machinery, farm ponds with plastic lining, shade nets, and micro-irrigation.',
    benefitsHi: 'कृषि यंत्रों, शेततले, शेडनेट और सूक्ष्म सिंचाई पर 50% से 75% तक की सब्सिडी।',
    benefitsMr: 'कृषी औजारे, शेततळे अस्तरीकरण, हरितगृह आणि फलोत्पादनासाठी ५०% ते ७५% पर्यंत थेट अनुदान.',
    eligibility: [
      'Resident farmer of Maharashtra with Aadhaar-linked land record (7/12)'
    ],
    documents: ['Aadhaar Card', 'Digital 7/12 & 8A', 'Caste Certificate (if applicable)', 'Bank Passbook'],
    applicationUrl: 'https://mahadbt.maharashtra.gov.in/Farmer/Login/Login',
    helpline: '022-49150800',
    isActive: true
  }
];

async function ensureDefaultSchemes() {
  const count = await Scheme.countDocuments();
  if (count === 0) {
    logger.info('Seeding default agricultural government schemes...');
    await Scheme.insertMany(DEFAULT_SCHEMES);
    logger.info('Default schemes seeded successfully');
  }
}

exports.getAll = async (req, res) => {
  try {
    await ensureDefaultSchemes();

    const filter = { isActive: true };
    if (req.query.category) filter.category = req.query.category;
    if (req.query.level) filter.level = req.query.level;
    if (req.query.state && req.query.state !== 'all') {
      filter.$or = [{ state: req.query.state }, { state: 'All India' }];
    }
    if (req.query.search) {
      const q = req.query.search;
      filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { shortCode: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { titleHi: { $regex: q, $options: 'i' } },
        { titleMr: { $regex: q, $options: 'i' } }
      ];
    }

    const schemes = await Scheme.find(filter).sort({ level: 1, createdAt: 1 });

    const lang = req.query.lang || 'en';
    const localized = schemes.map(s => {
      const obj = s.toObject();
      if (lang === 'mr') {
        obj.displayTitle = s.titleMr || s.title;
        obj.displayDescription = s.descriptionMr || s.description;
        obj.displayBenefits = s.benefitsMr || s.benefits;
      } else if (lang === 'hi') {
        obj.displayTitle = s.titleHi || s.title;
        obj.displayDescription = s.descriptionHi || s.description;
        obj.displayBenefits = s.benefitsHi || s.benefits;
      } else {
        obj.displayTitle = s.title;
        obj.displayDescription = s.description;
        obj.displayBenefits = s.benefits;
      }
      return obj;
    });

    return res.json({
      success: true,
      message: 'Government schemes retrieved',
      count: localized.length,
      data: localized,
      schemes: localized
    });
  } catch (err) {
    logger.error('Get schemes error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    await ensureDefaultSchemes();
    let scheme;
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      scheme = await Scheme.findById(req.params.id);
    } else {
      scheme = await Scheme.findOne({ shortCode: req.params.id.toUpperCase() });
    }

    if (!scheme) {
      return res.status(404).json({ success: false, message: 'Scheme not found' });
    }

    return res.json({
      success: true,
      message: 'Scheme retrieved',
      data: scheme,
      scheme
    });
  } catch (err) {
    logger.error('Get scheme by id error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.seed = async (req, res) => {
  try {
    await Scheme.deleteMany({});
    const inserted = await Scheme.insertMany(DEFAULT_SCHEMES);
    return res.json({
      success: true,
      message: `Seeded ${inserted.length} schemes successfully`,
      count: inserted.length
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
