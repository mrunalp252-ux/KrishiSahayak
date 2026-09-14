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
      'Valid Aadhaar card linked with active bank account',
      'Land records updated in State Revenue Portal'
    ],
    eligibilityHi: [
      'खेती योग्य भूमिधारक छोटे व सीमांत किसान परिवार',
      'बैंक खाते से लिंक वैध आधार कार्ड धारक',
      'राज्य भू-अभिलेख पोर्टल में अद्यतित भूमि रिकॉर्ड'
    ],
    eligibilityMr: [
      'लागवडयोग्य शेतजमीन असलेले लहान व अल्पभूधारक शेतकरी कुटुंब',
      'बँक खात्याशी आधार संलग्न असलेले सर्व शेतकरी',
      'राज्य महसूल अभिलेख (७/१२ व ८-अ) मध्ये नोंद असलेले शेतकरी'
    ],
    documents: ['Aadhaar Card', 'Land Records (7/12 & 8A)', 'Bank Passbook / Account details'],
    documentsHi: ['आधार कार्ड', 'जमीन का खसरा/खतौनी (7/12 व 8A)', 'बैंक पासबुक / खाता विवरण'],
    documentsMr: ['आधार कार्ड', 'डिजिटल ७/१२ व ८-अ उतारा', 'बँक पासबुक / खाते तपशील'],
    applicationInstructions: 'Apply online on pmkisan.gov.in or through local CSC centre / Talathi office.',
    applicationInstructionsHi: 'pmkisan.gov.in पर ऑनलाइन या नजदीकी सीएससी केंद्र के माध्यम से आवेदन करें।',
    applicationInstructionsMr: 'pmkisan.gov.in वर ऑनलाइन किंवा जवळच्या महा-ई-सेवा / सीएससी केंद्रावर अर्ज करा.',
    applicationUrl: 'https://pmkisan.gov.in',
    helpline: '155261 / 011-24300606',
    isActive: true
  },
  {
    title: 'PMFBY (Pradhan Mantri Fasal Bima Yojana)',
    shortCode: 'PMFBY',
    titleHi: 'प्रधानमंत्री फसल बीमा योजना (PMFBY)',
    titleMr: 'प्रधानमंत्री पीक विमा योजना (PMFBY)',
    description: 'Comprehensive risk insurance coverage from pre-sowing to post-harvest against non-preventable natural risks (drought, flood, unseasonal rain, pest attack). In Maharashtra, premium is only ₹1 for farmers.',
    descriptionHi: 'प्राकृतिक आपदाओं (सूखा, बाढ़, बेमौसम बारिश, कीट प्रकोप) के विरुद्ध बुवाई से लेकर कटाई के बाद तक व्यापक फसल बीमा सुरक्षा। महाराष्ट्र में मात्र ₹1 में बीमा।',
    descriptionMr: 'नैसर्गिक आपत्ती (दुष्काळ, पूर, अवकाळी पाऊस, कीड-रोग) विरुद्ध पेरणीपूर्व ते काढणीपश्चात संपूर्ण पीक विमा संरक्षण. महाराष्ट्रात अवघ्या १ रुपयात विमा.',
    category: 'crop_insurance',
    level: 'central',
    state: 'All India',
    benefits: 'Subsidized low premium (Farmers pay only ₹1 in Maharashtra). Full sum insured coverage for unseasonal rains and localized calamity.',
    benefitsHi: 'समान कम प्रीमियम (महाराष्ट्र में केवल ₹1)। बेमौसम बारिश और प्राकृतिक आपदा पर बैंक खाते में सीधा दावा भुगतान।',
    benefitsMr: 'शेतकऱ्यांना अवघ्या १ रुपयात विमा हप्ता. अवकाळी पाऊस, गारपीट किंवा दुष्काळामुळे नुकसान झाल्यास थेट भरपाई.',
    eligibility: [
      'All farmers growing notified crops in notified areas (loanee and non-loanee)',
      'Tenant farmers and sharecroppers eligible with cultivation certificate'
    ],
    eligibilityHi: [
      'अधिसूचित क्षेत्रों में अधिसूचित फसलें उगाने वाले सभी किसान (ऋणी व गैर-ऋणी)',
      'बटाईदार और पट्टेदार किसान वैध खेती प्रमाण पत्र के साथ पात्र'
    ],
    eligibilityMr: [
      'अधिसूचित क्षेत्रात अधिसूचित पिके घेणारे सर्व शेतकरी (कर्जदार व बिगर-कर्जदार)',
      'कुळ व भाडेतत्त्वावर शेती करणारे शेतकरी घोषणापत्रासह पात्र'
    ],
    documents: ['Aadhaar Card', 'Land Record (7/12, 8A)', 'Sowing Certificate / Self Declaration', 'Bank Passbook'],
    documentsHi: ['आधार कार्ड', 'भू-अभिलेख (7/12, 8A)', 'बुआई प्रमाण पत्र / स्व-घोषणा', 'बैंक पासबुक'],
    documentsMr: ['आधार कार्ड', 'डिजिटल ७/१२ व ८-अ', 'पीक पेरा स्वयंघोषणा पत्र', 'बँक पासबुक'],
    applicationInstructions: 'Apply on pmfby.gov.in or through bank/CSC within 72 hours of damage notification.',
    applicationInstructionsHi: 'pmfby.gov.in पर या बैंक/सीएससी के जरिए आवेदन करें। आपदा के 72 घंटे में सूचना दें।',
    applicationInstructionsMr: 'pmfby.gov.in किंवा आपले सरकार केंद्रावर अर्ज करा. आपत्ती घडल्यास ७२ तासांत ॲपवर तक्रार नोंदवा.',
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
    descriptionHi: 'फसल उत्पादन, कटाई के बाद के खर्च, विपणन और कृषि संपत्तियों के रखरखाव के लिए किसानों को समय पर और रियायती संस्थागत ऋण।',
    descriptionMr: 'पिकांच्या लागवडीचा खर्च, बी-बियाणे, खते, कीटकनाशके आणि शेती साहित्य खरेदीसाठी सुलभ व सवलतीच्या व्याजदरात कर्ज पुरवठा.',
    category: 'credit',
    level: 'central',
    state: 'All India',
    benefits: 'Credit up to ₹3,00,000 at effective interest rate of 4% (with 3% prompt repayment incentive). Collateral-free loan up to ₹1,60,000.',
    benefitsHi: 'समय पर पुनर्भुगतान पर 4% की प्रभावी ब्याज दर पर ₹3,00,000 तक का ऋण। ₹1,60,000 तक बिना किसी बंधक के ऋण।',
    benefitsMr: 'वेळेवर परतफेड केल्यास केवळ ४% व्याजदराने ₹३,००,००० पर्यंत कर्ज. ₹१,६०,००० पर्यंत विनातारण पीक कर्ज.',
    eligibility: [
      'All individual farmers / joint borrowers who are owner cultivators',
      'Tenant farmers, oral lessees & sharecroppers',
      'Self Help Groups (SHGs) or Joint Liability Groups (JLGs) of farmers'
    ],
    eligibilityHi: [
      'सभी व्यक्तिगत किसान / संयुक्त खातेदार जो भू-स्वामी हैं',
      'पट्टेदार किसान, मौखिक पट्टेदार और बटाईदार',
      'किसानों के स्वयं सहायता समूह (SHG) या संयुक्त देयता समूह (JLG)'
    ],
    eligibilityMr: [
      'स्वतःची शेती कसणारे सर्व शेतकरी किंवा संयुक्त खातेदार',
      'भाडेतत्त्वावर शेती करणारे कुळ शेतकरी व शेतमजूर',
      'शेतकरी महिला बचत गट (SHG) किंवा संयुक्त दायित्व गट (JLG)'
    ],
    documents: ['Duly filled KCC application', 'Identity & Address Proof (Aadhaar)', 'Land Revenue Documents (7/12)', 'Passport Photo'],
    documentsHi: ['केसीसी आवेदन पत्र', 'पहचान एवं निवास प्रमाण (आधार)', 'भूमि दस्तावेज (7/12)', 'पासपोर्ट फोटो'],
    documentsMr: ['भरलेला केसीसी अर्ज', 'आधार कार्ड व पॅन कार्ड', 'जमीन महसूल पुरावे (७/१२, ८-अ)', 'पासपोर्ट आकाराचे फोटो'],
    applicationInstructions: 'Submit application at any commercial, regional rural, or cooperative bank branch.',
    applicationInstructionsHi: 'अपने नजदीकी ग्रामीण, वाणिज्यिक या सहकारी बैंक शाखा में आवेदन जमा करें।',
    applicationInstructionsMr: 'आपल्या जवळच्या राष्ट्रीयीकृत, ग्रामीण किंवा जिल्हा मध्यवर्ती सहकारी बँकेत अर्ज सादर करा.',
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
    benefits: 'Customized NPK and micronutrient recommendations save 20-30% on chemical fertilizer bills and boost soil fertility and yield.',
    benefitsHi: 'संतुलित खाद सिफारिश से उर्वरक खर्च में 20-30% की कमी और पैदावार में 10-15% की वृद्धि।',
    benefitsMr: 'संतुलित खतांच्या वापरामुळे रासायनिक खतांच्या खर्चात २०-३०% बचत आणि जमिनीचा पोत सुधारून उत्पादनात वाढ.',
    eligibility: [
      'Every farmer across all States and Union Territories of India'
    ],
    eligibilityHi: [
      'भारत के सभी राज्यों और केंद्र शासित प्रदेशों के सभी भूमिधारक किसान'
    ],
    eligibilityMr: [
      'देशातील व महाराष्ट्रातील सर्व जमीनधारक शेतकरी'
    ],
    documents: ['Land ownership details (Gut / Survey number)', 'Farmer Aadhaar & contact number'],
    documentsHi: ['जमीन का खसरा/सर्वे नंबर', 'आधार कार्ड व मोबाइल नंबर'],
    documentsMr: ['जमिनीचा गट नंबर / सर्व्हे नंबर', 'आधार कार्ड व मोबाईल क्रमांक'],
    applicationInstructions: 'Visit nearest Agriculture Department office or Krishi Vigyan Kendra (KVK) for soil testing.',
    applicationInstructionsHi: 'मिट्टी परीक्षण के लिए नजदीकी कृषि विभाग कार्यालय या कृषि विज्ञान केंद्र (KVK) से संपर्क करें।',
    applicationInstructionsMr: 'माती नमुना तपासणीसाठी जवळच्या कृषी सहाय्यक, तालुका कृषी अधिकारी कार्यालय किंवा केव्हीकेशी संपर्क साधा.',
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
    descriptionMr: 'ठिबक आणि तुषार सिंचन पद्धतीचा अवलंब करण्यासाठी ५५% ते ७०% पर्यंत थेट सरकारी अनुदान.',
    category: 'irrigation',
    level: 'central',
    state: 'All India',
    benefits: '55% subsidy for small/marginal farmers and 45% for other farmers on drip/sprinkler micro-irrigation systems.',
    benefitsHi: 'छोटे व सीमांत किसानों को 55% और अन्य किसानों को 45% तक ड्रिप/स्प्रिंकलर संयंत्र सब्सिडी।',
    benefitsMr: 'लहान व अत्यल्प भूधारक शेतकऱ्यांना ५५% तर इतर शेतकऱ्यांना ४५% अनुदान उपलब्ध.',
    eligibility: [
      'Farmers of all categories having land with assured irrigation water source (well, borewell, canal, farm pond)'
    ],
    eligibilityHi: [
      'निश्चित सिंचाई स्रोत (कुआं, नलकूप, नहर, शेततले) वाले सभी किसान'
    ],
    eligibilityMr: [
      'जमिनीवर पाण्याचा खात्रीशीर स्रोत (विहीर, कूपनलिका, शेततळे किंवा कालवा) असणारे सर्व शेतकरी'
    ],
    documents: ['Land Record 7/12 & 8A', 'Electricity bill / Water source proof', 'Aadhaar Card', 'Bank Passbook', 'Quotation from authorized dealer'],
    documentsHi: ['भूमि रिकॉर्ड (7/12 व 8A)', 'बिजली बिल / जल स्रोत प्रमाण', 'आधार कार्ड', 'बैंक पासबुक', 'अधिकृत डीलर का कोटेशन'],
    documentsMr: ['डिजिटल ७/१२ व ८-अ उतारा', 'विजेचे बिल / विहीर-पाणी स्रोत नोंद', 'आधार कार्ड', 'बँक पासबुक', 'अधिकृत विक्रेत्याचे कोटेशन'],
    applicationInstructions: 'Apply online on State DBT portal (MahaDBT in Maharashtra).',
    applicationInstructionsHi: 'राज्य डीबीटी पोर्टल (महाराष्ट्र में महाडीबीटी) पर ऑनलाइन आवेदन करें।',
    applicationInstructionsMr: 'MahaDBT पोर्टलवर "सूक्ष्म सिंचन योजना" अंतर्गत ऑनलाइन अर्ज नोंदवा.',
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
      'Resident farmer of Maharashtra with Aadhaar-linked land record (7/12 & 8A)'
    ],
    eligibilityHi: [
      'महाराष्ट्र के निवासी किसान जिनका आधार भूमि रिकॉर्ड (7/12) से जुड़ा है'
    ],
    eligibilityMr: [
      'महाराष्ट्रातील रहिवासी शेतकरी ज्यांच्या नावावर स्वतःची शेतजमीन (७/१२) आहे'
    ],
    documents: ['Aadhaar Card', 'Digital 7/12 & 8A', 'Caste Certificate (if applicable)', 'Bank Passbook'],
    documentsHi: ['आधार कार्ड', 'डिजिटल 7/12 व 8A', 'जाति प्रमाण पत्र (यदि लागू हो)', 'बैंक पासबुक'],
    documentsMr: ['आधार कार्ड', 'डिजिटल स्वाक्षरीत ७/१२ व ८-अ', 'जातीचे प्रमाणपत्र (लागू असल्यास)', 'बँक पासबुक'],
    applicationInstructions: 'Register on mahadbt.maharashtra.gov.in under Farmer Schemes section.',
    applicationInstructionsHi: 'mahadbt.maharashtra.gov.in पर किसान योजना अनुभाग के तहत पंजीकरण करें।',
    applicationInstructionsMr: 'mahadbt.maharashtra.gov.in या अधिकृत संकेतस्थळावर शेतकरी लॉगिन करून अर्ज करा.',
    applicationUrl: 'https://mahadbt.maharashtra.gov.in/Farmer/Login/Login',
    helpline: '022-49150800',
    isActive: true
  },
  {
    title: 'Namo Shetkari Mahasanman Nidhi Yojana (Maharashtra)',
    shortCode: 'NAMO-SHETKARI',
    titleHi: 'नमो शेतकरी महासम्मान निधि योजना (महाराष्ट्र)',
    titleMr: 'नमो शेतकरी महासन्मान निधी योजना (महाराष्ट्र)',
    description: 'Maharashtra State Government top-up scheme providing additional ₹6,000 annually to all eligible PM-KISAN beneficiaries, taking total annual income support to ₹12,000.',
    descriptionHi: 'महाराष्ट्र सरकार की टॉप-अप योजना जिसके तहत पीएम-किसान के सभी पात्र किसानों को अतिरिक्त ₹6,000 वार्षिक दिए जाते हैं, कुल ₹12,000 सहायता।',
    descriptionMr: 'महाराष्ट्र शासनाची योजना. पीएम-किसान योजनेच्या सर्व पात्र लाभार्थ्यांना राज्य शासनाकडून अतिरिक्त ₹६,००० वार्षिक अनुदान. वर्षाला एकूण ₹१२,००० मदत.',
    category: 'financial_support',
    level: 'state',
    state: 'Maharashtra',
    benefits: 'Additional ₹6,000 per year in three installments of ₹2,000 each deposited directly via DBT.',
    benefitsHi: 'प्रत्येक 4 माह में ₹2,000 की 3 किस्तों में अतिरिक्त ₹6,000 प्रति वर्ष सीधा बैंक खाते में।',
    benefitsMr: 'दर चार महिन्यांनी ₹२,००० चे तीन समान हप्ते, वर्षाला अतिरिक्त ₹६,००० थेट बँक खात्यात जमा.',
    eligibility: [
      'All farmers approved under PM-KISAN scheme in Maharashtra',
      'Active Aadhaar authentication and e-KYC completed'
    ],
    eligibilityHi: [
      'महाराष्ट्र में पीएम-किसान योजना के तहत स्वीकृत सभी पात्र किसान',
      'सक्रिय आधार प्रमाणीकरण और ई-केवाईसी पूर्ण होना अनिवार्य'
    ],
    eligibilityMr: [
      'महाराष्ट्रातील पीएम-किसान योजनेसाठी पात्र असलेले सर्व शेतकरी',
      'आधार प्रमाणीकरण व ई-केवायसी (e-KYC) पूर्ण असलेले शेतकरी'
    ],
    documents: ['Aadhaar Card', 'PM-KISAN Registration ID', 'Linked Bank Account Passbook'],
    documentsHi: ['आधार कार्ड', 'पीएम-किसान पंजीकरण आईडी', 'आधार लिंक बैंक खाता पासबुक'],
    documentsMr: ['आधार कार्ड', 'पीएम-किसान नोंदणी क्रमांक', 'आधार संलग्न बँक खाते पासबुक'],
    applicationInstructions: 'Automatic enrollment for all verified PM-KISAN beneficiaries in Maharashtra. No separate application needed.',
    applicationInstructionsHi: 'पीएम-किसान के सत्यापित लाभार्थियों को स्वतः लाभ मिलता है। अलग से आवेदन की आवश्यकता नहीं है।',
    applicationInstructionsMr: 'पीएम-किसान योजनेतील पात्र लाभार्थ्यांना थेट लाभ मिळतो. स्वतंत्र अर्ज करण्याची आवश्यकता नाही.',
    applicationUrl: 'https://mahadbt.maharashtra.gov.in',
    helpline: '1800-120-8040',
    isActive: true
  },
  {
    title: 'Sub-Mission on Agricultural Mechanization (SMAM)',
    shortCode: 'SMAM',
    titleHi: 'कृषि यंत्रीकरण उप-अभियान (SMAM)',
    titleMr: 'कृषी यांत्रिकीकरण उप-अभियान (SMAM)',
    description: 'Financial assistance for procurement of modern agricultural machinery and implements (tractors, rotavators, power tillers, seed drills, harvesters, laser levellers).',
    descriptionHi: 'आधुनिक कृषि यंत्रों (ट्रैक्टर, रोटावेटर, पावर टिलर, सीड ड्रिल, हार्वेस्टर) की खरीद पर 40% से 50% तक सरकारी अनुदान।',
    descriptionMr: 'शेतकऱ्यांना शेतीची आधुनिक अवजारे (ट्रॅक्टर, रोटाव्हेटर, पॉवर टिलर, पेरणी यंत्र, मळणी यंत्र) खरेदीसाठी ४०% ते ५०% शासकीय अनुदान.',
    category: 'subsidy',
    level: 'central',
    state: 'All India',
    benefits: '40% to 50% subsidy on purchase of approved farm machinery. Special benefits for SC/ST and women farmers.',
    benefitsHi: 'अनुमोदित कृषि यंत्रों की खरीद पर 40% से 50% सब्सिडी। महिला व एससी/एसटी किसानों को विशेष प्राथमिकता।',
    benefitsMr: 'मान्यताप्राप्त कृषी अवजारांवर ४०% ते ५०% थेट अनुदान. महिला व अनुसूचित जाती/जमाती शेतकऱ्यांना विशेष प्राधान्य.',
    eligibility: [
      'Small and marginal farmers, women farmers, and rural youth',
      'Must own cultivable agricultural land'
    ],
    eligibilityHi: [
      'छोटे व सीमांत किसान, महिला किसान और ग्रामीण युवा',
      'आवेदक के नाम पर कृषि भूमि होना आवश्यक'
    ],
    eligibilityMr: [
      'लहान व अल्पभूधारक शेतकरी, महिला शेतकरी व शेतकरी उत्पादक संस्था (FPO)',
      'स्वतःच्या नावावर शेतजमीन असणे आवश्यक'
    ],
    documents: ['Aadhaar Card', 'Land 7/12 & 8A', 'Bank Account details', 'Quotation from authorized implement manufacturer'],
    documentsHi: ['आधार कार्ड', 'जमीन 7/12 व 8A', 'बैंक खाता विवरण', 'अधिकृत निर्माता का कोटेशन'],
    documentsMr: ['आधार कार्ड', '७/१२ व ८-अ उतारा', 'बँक पासबुक', 'अधिकृत अवजार विक्रेत्याचे दरपत्रक (कोटेशन)'],
    applicationInstructions: 'Apply through agrimachinery.nic.in or State MahaDBT portal.',
    applicationInstructionsHi: 'agrimachinery.nic.in या महाडीबीटी पोर्टल पर ऑनलाइन आवेदन करें।',
    applicationInstructionsMr: 'MahaDBT पोर्टलवर "कृषी यांत्रिकीकरण" घटकाखाली ऑनलाइन लॉटरीसाठी अर्ज करा.',
    applicationUrl: 'https://agrimachinery.nic.in',
    helpline: '1800-180-1551',
    isActive: true
  },
  {
    title: 'PM-KUSUM Solar Agri Pump Scheme',
    shortCode: 'PM-KUSUM',
    titleHi: 'पीएम-कुसुम सौर कृषि पंप योजना',
    titleMr: 'पीएम-कुसुम सौर कृषी पंप योजना',
    description: 'Installation of standalone off-grid and grid-connected solar agricultural water pumps to provide daytime reliable irrigation energy to farmers.',
    descriptionHi: 'किसानों को दिन के समय विश्वसनीय सिंचाई उपलब्ध कराने हेतु सोलर पंप लगाने पर 90% तक की भारी सब्सिडी।',
    descriptionMr: 'शेतकऱ्यांना दिवसा खात्रीशीर सिंचनासाठी सौर कृषी पंप बसवून देण्यासाठी केंद्र व राज्य शासनाकडून ९०% पर्यंत अनुदान. शेतकऱ्याला केवळ १०% हिस्सा भरावा लागतो.',
    category: 'irrigation',
    level: 'central',
    state: 'All India',
    benefits: 'Up to 90% subsidy on 3 HP, 5 HP, and 7.5 HP solar water pumps. Only 10% farmer contribution.',
    benefitsHi: '3, 5 और 7.5 एचपी सोलर पंपों पर 90% तक सब्सिडी। किसान को केवल 10% अंशदान देना होता है।',
    benefitsMr: '३, ५ आणि ७.५ एचपी क्षमतेच्या सौर पंपांवर ९०% पर्यंत अनुदान. केवळ १०% स्वहिस्सा भरून सौर पंप उपलब्ध.',
    eligibility: [
      'Farmers with assured water source having no conventional grid electricity connection for irrigation',
      'Small and marginal farmers given priority'
    ],
    eligibilityHi: [
      'निश्चित जल स्रोत वाले किसान जिनके पास सिंचाई हेतु पारंपरिक बिजली कनेक्शन नहीं है'
    ],
    eligibilityMr: [
      'शेतात पाण्याची खात्रीशीर उपलब्धता असलेले आणि पारंपारिक वीज जोडणी नसलेले सर्व शेतकरी'
    ],
    documents: ['Aadhaar Card', 'Land Record 7/12 & 8A with water source entry', 'Bank Passbook', 'Passport Photo'],
    documentsHi: ['आधार कार्ड', 'भूमि रिकॉर्ड (7/12 व 8A जल स्रोत प्रविष्टि सहित)', 'बैंक पासबुक', 'पासपोर्ट फोटो'],
    documentsMr: ['आधार कार्ड', '७/१२ उतारा (विहीर किंवा पाणी स्रोत नोंद असलेला)', 'बँक पासबुक', 'पासपोर्ट फोटो'],
    applicationInstructions: 'Apply on pmkusum.mnre.gov.in or Maharashtra MahaUrja (MEDA) portal.',
    applicationInstructionsHi: 'pmkusum.mnre.gov.in या महाऊर्जा (MEDA) पोर्टल पर ऑनलाइन आवेदन करें।',
    applicationInstructionsMr: 'महाऊर्जा (MEDA) किंवा महावितरणच्या अधिकृत पोर्टलवर ऑनलाइन अर्ज नोंदवा.',
    applicationUrl: 'https://pmkusum.mnre.gov.in',
    helpline: '1800-180-3333',
    isActive: true
  },
  {
    title: 'Gopinath Munde Shetkari Apghat Vima Yojana (Maharashtra)',
    shortCode: 'GMS-APGHAT',
    titleHi: 'गोपीनाथ मुंडे शेतकरी अपघात सुरक्षा सानुग्रह योजना (महाराष्ट्र)',
    titleMr: 'गोपीनाथ मुंडे शेतकरी अपघात सुरक्षा सानुग्रह योजना (महाराष्ट्र)',
    description: 'Financial assistance of up to ₹2,00,000 to family members of farmers in case of accidental death or permanent disability due to snake bite, road accident, electric shock, farm machinery accident, or lightning.',
    descriptionHi: 'दुर्घटना, सर्पदंश, बिजली का झटका या कृषि कार्य के दौरान मृत्यु अथवा दिव्यांगता होने पर किसान परिवार को ₹2,00,000 तक की सहायता।',
    descriptionMr: 'शेती करताना सर्पदंश, विजेचा धक्का, वीज पडणे, वाहन अपघात किंवा अवजारांमुळे अपघात होऊन मृत्यू किंवा अपंगत्व आल्यास वारसदारास ₹२,००,००० पर्यंत सानुग्रह साहाय्य.',
    category: 'financial_support',
    level: 'state',
    state: 'Maharashtra',
    benefits: '₹2,00,000 compensation for accidental death or loss of two limbs/eyes; ₹1,00,000 for loss of one limb/eye.',
    benefitsHi: 'आकस्मिक मृत्यु या दोनों अंग/आंखें खोने पर ₹2,00,000 तथा एक अंग/आंख खोने पर ₹1,00,000 की अनुग्रह सहायता।',
    benefitsMr: 'अपघाती मृत्यू किंवा दोन्ही डोळे/हात-पाय निकामी झाल्यास ₹२,००,००० आणि एक अवयव निकामी झाल्यास ₹१,००,००० भरपाई.',
    eligibility: [
      'Any registered landholding farmer in Maharashtra aged between 10 and 75 years, or their family members'
    ],
    eligibilityHi: [
      'महाराष्ट्र के 10 से 75 वर्ष आयु वर्ग के सभी भू-धारक किसान अथवा उनके परिवार के सदस्य'
    ],
    eligibilityMr: [
      'महाराष्ट्रातील १० ते ७५ वयोगटातील सर्व ७/१२ वर नोंद असलेले शेतकरी व त्यांच्या कुटुंबातील सदस्य'
    ],
    documents: ['First Information Report (FIR) / Police Panchnama', 'Post-Mortem Report / Disability Certificate', '7/12 & 8A of deceased', 'Legal Heir / Succession Certificate', 'Bank details'],
    documentsHi: ['पुलिस एफआईआर / पंचनामा', 'पोस्टमार्टम रिपोर्ट / दिव्यांगता प्रमाण पत्र', 'मृतक का 7/12 व 8A', 'वारिस प्रमाण पत्र', 'बैंक विवरण'],
    documentsMr: ['पोलीस प्रथम माहिती अहवाल (FIR) / पंचनामा', 'शवविच्छेदन (PM) अहवाल किंवा वैद्यकीय अपंगत्व दाखला', '७/१२ व ८-अ', 'वारसदार प्रमाणपत्र', 'बँक पासबुक'],
    applicationInstructions: 'Submit claim with documents to Taluka Agriculture Officer within 30 days of incident.',
    applicationInstructionsHi: 'घटना के 30 दिनों के भीतर तालुका कृषि अधिकारी कार्यालय में दस्तावेज जमा करें।',
    applicationInstructionsMr: 'अपघात घडल्यापासून ३० दिवसांच्या आत तालुका कृषी अधिकारी कार्यालयात सर्व कागदपत्रांसह दावा दाखल करा.',
    applicationUrl: 'https://krishi.maharashtra.gov.in',
    helpline: '1800-233-4000',
    isActive: true
  }
];

async function ensureDefaultSchemes() {
  const count = await Scheme.countDocuments();
  if (count < DEFAULT_SCHEMES.length) {
    logger.info('Updating agricultural government schemes with multilingual content...');
    for (const scheme of DEFAULT_SCHEMES) {
      await Scheme.findOneAndUpdate(
        { shortCode: scheme.shortCode },
        scheme,
        { upsert: true, new: true }
      );
    }
    logger.info('Default government schemes synchronized successfully');
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

    const lang = req.query.lang || req.query.language || 'en';
    const localized = schemes.map(s => {
      const obj = s.toObject();
      if (lang === 'mr') {
        obj.displayTitle = s.titleMr || s.title;
        obj.displayDescription = s.descriptionMr || s.description;
        obj.displayBenefits = s.benefitsMr || s.benefits;
        obj.displayEligibility = (s.eligibilityMr && s.eligibilityMr.length) ? s.eligibilityMr : s.eligibility;
        obj.displayDocuments = (s.documentsMr && s.documentsMr.length) ? s.documentsMr : s.documents;
        obj.displayInstructions = s.applicationInstructionsMr || s.applicationInstructions || '';
      } else if (lang === 'hi') {
        obj.displayTitle = s.titleHi || s.title;
        obj.displayDescription = s.descriptionHi || s.description;
        obj.displayBenefits = s.benefitsHi || s.benefits;
        obj.displayEligibility = (s.eligibilityHi && s.eligibilityHi.length) ? s.eligibilityHi : s.eligibility;
        obj.displayDocuments = (s.documentsHi && s.documentsHi.length) ? s.documentsHi : s.documents;
        obj.displayInstructions = s.applicationInstructionsHi || s.applicationInstructions || '';
      } else {
        obj.displayTitle = s.title;
        obj.displayDescription = s.description;
        obj.displayBenefits = s.benefits;
        obj.displayEligibility = s.eligibility || [];
        obj.displayDocuments = s.documents || [];
        obj.displayInstructions = s.applicationInstructions || '';
      }

      // Parity aliases as requested in Phase 6
      obj.name_en = s.title;
      obj.name_mr = s.titleMr || s.title;
      obj.name_hi = s.titleHi || s.title;
      obj.description_en = s.description;
      obj.description_mr = s.descriptionMr || s.description;
      obj.description_hi = s.descriptionHi || s.description;
      obj.benefits_en = s.benefits;
      obj.benefits_mr = s.benefitsMr || s.benefits;
      obj.benefits_hi = s.benefitsHi || s.benefits;
      obj.eligibility_en = s.eligibility;
      obj.eligibility_mr = s.eligibilityMr;
      obj.eligibility_hi = s.eligibilityHi;
      obj.documents_en = s.documents;
      obj.documents_mr = s.documentsMr;
      obj.documents_hi = s.documentsHi;

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

    const lang = req.query.lang || req.query.language || 'en';
    const obj = scheme.toObject();
    if (lang === 'mr') {
      obj.displayTitle = scheme.titleMr || scheme.title;
      obj.displayDescription = scheme.descriptionMr || scheme.description;
      obj.displayBenefits = scheme.benefitsMr || scheme.benefits;
      obj.displayEligibility = (scheme.eligibilityMr && scheme.eligibilityMr.length) ? scheme.eligibilityMr : scheme.eligibility;
      obj.displayDocuments = (scheme.documentsMr && scheme.documentsMr.length) ? scheme.documentsMr : scheme.documents;
      obj.displayInstructions = scheme.applicationInstructionsMr || scheme.applicationInstructions || '';
    } else if (lang === 'hi') {
      obj.displayTitle = scheme.titleHi || scheme.title;
      obj.displayDescription = scheme.descriptionHi || scheme.description;
      obj.displayBenefits = scheme.benefitsHi || scheme.benefits;
      obj.displayEligibility = (scheme.eligibilityHi && scheme.eligibilityHi.length) ? scheme.eligibilityHi : scheme.eligibility;
      obj.displayDocuments = (scheme.documentsHi && scheme.documentsHi.length) ? scheme.documentsHi : scheme.documents;
      obj.displayInstructions = scheme.applicationInstructionsHi || scheme.applicationInstructions || '';
    } else {
      obj.displayTitle = scheme.title;
      obj.displayDescription = scheme.description;
      obj.displayBenefits = scheme.benefits;
      obj.displayEligibility = scheme.eligibility || [];
      obj.displayDocuments = scheme.documents || [];
      obj.displayInstructions = scheme.applicationInstructions || '';
    }

    return res.json({
      success: true,
      message: 'Scheme retrieved',
      data: obj,
      scheme: obj
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
