// backend/seed/guideDataBuilder.js
// Generates authentic, detailed, farmer-ready cultivation guides for 37 crops in English, Marathi, and Hindi.
// Every guide strictly starts at Step 1 (order: 1).

const { cropsData } = require('./seedCrops');

const STAGE_TITLES = {
  climate: {
    en: 'Climate & Weather Requirements',
    mr: 'हवामान व अनुकूल परिस्थिती',
    hi: 'जलवायु एवं मौसम की आवश्यकताएं'
  },
  soil: {
    en: 'Soil Requirements & Land Preparation',
    mr: 'जमीन व पूर्वमशागत',
    hi: 'मृदा आवश्यकता एवं खेत की तैयारी'
  },
  seed: {
    en: 'Seed Selection & Treatment',
    mr: 'वाण निवड आणि बीजप्रक्रिया',
    hi: 'उन्नत बीज चयन एवं बीज उपचार'
  },
  sowing: {
    en: 'Sowing & Spacing Techniques',
    mr: 'पेरणी व लागवड तंत्रज्ञान',
    hi: 'बुआई एवं रोपाई की तकनीक'
  },
  irrigation: {
    en: 'Irrigation & Water Management',
    mr: 'पाणी व सिंचन व्यवस्थापन',
    hi: 'सिंचाई एवं जल प्रबंधन'
  },
  fertilizer: {
    en: 'Fertilizer & Nutrient Management',
    mr: 'खत व पोषण व्यवस्थापन',
    hi: 'खाद एवं उर्वरक प्रबंधन'
  },
  pest: {
    en: 'Pest Management & IPM Practices',
    mr: 'कीड नियंत्रण व एकात्मिक व्यवस्थापन (IPM)',
    hi: 'कीट नियंत्रण एवं एकीकृत कीट प्रबंधन (IPM)'
  },
  disease: {
    en: 'Disease Management & Plant Health',
    mr: 'रोग नियंत्रण व उपाययोजना',
    hi: 'रोग नियंत्रण एवं फसल सुरक्षा'
  },
  harvest: {
    en: 'Harvesting Technique & Timing',
    mr: 'काढणी व कापणी तंत्र',
    hi: 'फसल कटाई एवं मड़ाई की तकनीक'
  },
  storage: {
    en: 'Post-Harvest Storage & Farmer Tips',
    mr: 'काढणीपश्चात व्यवस्थापन, साठवणूक व सल्ला',
    hi: 'सुरक्षित भंडारण एवं किसान उपयोगी सुझाव'
  }
};

// Specialized detailed stage content for major crop categories
const CROP_GUIDE_DETAILS = {
  'Rice': {
    climate: {
      en: 'Requires warm, humid tropical climate with temperatures between 20°C and 35°C. Abundant sunshine is critical during the ripening phase.',
      mr: 'भात पिकासाठी २०°C ते ३५°C दरम्यान उष्ण व दमट हवामान अत्यंत अनुकूल असते. ओंब्या भरताना आणि दाणे भरताना भरपूर सूर्यप्रकाशाची गरज असते.',
      hi: 'धान की फसल के लिए 20°C से 35°C के बीच गर्म और आर्द्र जलवायु सर्वोत्तम है। दाना भरते समय प्रचुर धूप आवश्यक है।'
    },
    soil: {
      en: 'Clayey or alluvial loam with high water holding capacity and slightly acidic to neutral pH (5.5 - 6.5) is ideal. Deep ploughing followed by puddling is mandatory.',
      mr: 'पाणी धरून ठेवणारी चिकनमाती किंवा गाळाची जमीन (सामू ५.५ ते ६.५) उत्तम. उन्हाळ्यात खोल नांगरट करून रोवणीपूर्वी शेतात चिखलणी (पडलिंग) करावी.',
      hi: 'जलधारण क्षमता वाली मटियार या दोमट मिट्टी (pH 5.5 - 6.5) उत्तम है। खेत की 2-3 जुताई के बाद लेव (पडलिंग) अवश्य करें।'
    },
    seed: {
      en: 'Select certified seeds (Indrayani, PKV HMT, Karjat varieties). Treat with 3% salt solution to remove floating chaff, then treat with Trichoderma (5g/kg) or Thiram (3g/kg).',
      mr: 'इंद्रायणी, पीकेव्ही एचएमटी, कर्जत किंवा फुले समृद्धी या प्रमाणित वाणांची निवड करावी. ३% मिठाच्या द्रावणात बियाणे बुडवून पोचट बियाणे काढावे. ट्रायकोडर्मा ५ ग्रॅम/किलो चोळावे.',
      hi: 'प्रमाणित किस्में (इंद्रायणी, पीकेवी एचएमटी, पूसा बासमती) चुनें। नमक के घोल से हल्के बीज अलग करें और थीरम (3 ग्राम) या ट्राइकोडर्मा (5 ग्राम/किग्रा) से उपचारित करें।'
    },
    sowing: {
      en: 'Prepare raised nursery beds. Transplant 21-25 days old seedlings with 2-3 seedlings per hill at 20x15 cm spacing in the puddled field.',
      mr: 'रोपवाटिका गादीवाफ्यावर तयार करावी. २१ ते २५ दिवसांची निरोगी रोपे चिखलणी केलेल्या मुख्य शेतात २०x१५ सेमी अंतरावर प्रति चुड २-३ रोपे लावावीत.',
      hi: 'नर्सरी से 21-25 दिन पुराने पौधे तैयार करें। मुख्य खेत में 20x15 सेमी की दूरी पर प्रति हिल 2-3 पौधे रोपें।'
    },
    irrigation: {
      en: 'Maintain 2-3 cm standing water after transplanting. Critical stages are panicle initiation, flowering, and milk stage. Drain field 10-12 days before harvest.',
      mr: 'रोवणीनंतर सुरुवातीला २-३ सेमी पाणी ठेवावे. फुटवे फुटणे, ओंबी बाहेर पडणे आणि दाणे भरताना शेतात ओलावा आवश्यक. कापणीपूर्वी १०-१२ दिवस पाणी काढून घ्यावे.',
      hi: 'रोपाई के बाद 2-3 सेमी पानी बनाए रखें। कल्ले फूटते समय, फूल आने और दाना भरते समय नमी अनिवार्य है। कटाई से 10-12 दिन पूर्व पानी निकाल दें।'
    },
    fertilizer: {
      en: 'Apply NPK @ 100:50:50 kg/ha. Apply full P and K and 50% N at transplanting. Top dress remaining Nitrogen in two equal splits at tillering and panicle initiation.',
      mr: 'खतमात्रा १००:५०:५० किलो नत्र, स्फुरद, पालाश प्रति हेक्टरी द्यावी. संपूर्ण स्फुरद व पालाश आणि निम्मे नत्र रोवणीवेळी द्यावे. उर्वरित नत्र फुटवे व ओंबी भरताना द्यावे.',
      hi: 'उर्वरक 100:50:50 NPK किग्रा/हेक्टर दें। रोपाई के समय पूरा फास्फोरस, पोटाश और आधा नाइट्रोजन दें। शेष नाइट्रोजन दो भागों में कल्ले व बाली बनते समय दें।'
    },
    pest: {
      en: 'Control Yellow Stem Borer using pheromone traps (8/ha) and Cartap Hydrochloride 4G @ 25 kg/ha. For leaf folders, spray Chlorantraniliprole @ 0.3 ml/L.',
      mr: 'खोडकिडीसाठी एकरी ४ कामगंध सापळे लावावेत व दाणेदार कार्टाप हायड्रोक्लोराईड १० किलो टाकावे. पान गुंडाळणाऱ्या अळीसाठी क्लोरँट्रानिलीप्रोल ०.३ मिली/लिटर फवारावे.',
      hi: 'तना छेदक के लिए फेरोमोन ट्रैप (8/हेक्टेयर) लगाएं और कार्तप हाइड्रोक्लोराइड 4G डालें। पत्ता लपेटक के लिए क्लोरेंट्रानिलीप्रोल 0.3 मिली/लीटर का छिड़काव करें।'
    },
    disease: {
      en: 'Prevent Rice Blast and Bacterial Leaf Blight by avoiding excess urea. For Blast, spray Tricyclazole 75 WP @ 0.6 g/L upon observing spindle-shaped lesions.',
      mr: 'करपा आणि जीवाणूजन्य करपा टाळण्यासाठी युरियाचा अतिरेक टाळावा. पानांवर डोळ्याच्या आकाराचे ठिपके दिसताच ट्रायसायक्लॅझोल ७५ डब्ल्यूपी ०.६ ग्रॅम/लिटर फवारावे.',
      hi: 'ब्लास्ट और झुलसा से बचाव के लिए अधिक यूरिया न डालें। ब्लास्ट के लक्षण दिखते ही ट्राइसाइक्लाजोल 75 WP 0.6 ग्राम/लीटर पानी में घोलकर छिड़कें।'
    },
    harvest: {
      en: 'Harvest when 80-85% of panicles turn golden straw-yellow and grains at the base are in hard dough stage. Use sharp sickles or combine harvester.',
      mr: '८० ते ८५% ओंब्या पिवळसर सोनेरी झाल्यावर आणि खालचे दाणे कडक झाल्यावर कापणी करावी. जमिनीलगत कापणी करून वाळवावे.',
      hi: 'जब 80-85% बालियां सुनहरी पीली हो जाएं और दाने सख्त हो जाएं तब कटाई करें। फसल को जमीन के पास से काटें।'
    },
    storage: {
      en: 'Thresh promptly and sun-dry grains on clean tarpaulins until moisture reaches 12-13%. Store in clean, fumigated gunny bags placed on wooden pallets.',
      mr: 'मळणीनंतर धान स्वच्छ ताडपत्रीवर उन्हात वाळवून आर्द्रता १२% पर्यंत आणावी. पोती जमिनीवर न ठेवता लाकडी फळ्यांवर ठेवावीत व उंदरांपासून संरक्षण करावे.',
      hi: 'गहाई के बाद दानों को धूप में सुखाकर नमी 12% तक लाएं। साफ बोरियों में भरकर लकड़ी के तख्तों पर रखें और चूहों व नमी से सुरक्षित रखें।'
    }
  },
  'Wheat': {
    climate: {
      en: 'Requires cool winter climate (10°C - 15°C) during vegetative growth and warm sunny conditions (20°C - 25°C) during grain ripening and harvesting.',
      mr: 'गहू पिकाला फुटवे फुटताना १०°C ते १५°C थंड हवामान आणि दाणे भरताना व पक्व होताना २०°C ते २५°C उष्ण आणि कोरडे हवामान आवश्यक असते.',
      hi: 'गेहूं को कल्ले फूटते समय 10°C से 15°C ठंडी जलवायु और पकते समय 20°C से 25°C गर्म, शुष्क धूप की आवश्यकता होती है।'
    },
    soil: {
      en: 'Deep, well-drained loamy, clay-loam, or black cotton soil with pH 6.5 - 7.5. Field should be finely pulverized with good moisture conservation.',
      mr: 'पाण्याचा चांगला निचरा होणारी मध्यम ते भारी काळी कसदार जमीन (सामू ६.५ ते ७.५) योग्य ठरते. रोटाव्हेटरने ढेकळे फोडून जमीन भुसभुशीत करावी.',
      hi: 'अच्छी जल निकासी वाली दोमट या भारी काली मिट्टी (pH 6.5 - 7.5) उपयुक्त है। खेत को अच्छी तरह जोतकर पाटा लगाएं ताकि नमी बनी रहे।'
    },
    seed: {
      en: 'Recommended varieties: HD 2189, GW 496, Phule Samadhan, MACS 6222. Treat seed with Carboxin + Thiram (Vitavax) @ 2.5 g/kg seed to prevent smut.',
      mr: 'फुले समाधान, एचडी २१८९, जीडब्ल्यू ४९६, एमएसीएस ६२२२ हे वाण वापरावेत. काजळी रोग प्रतिबंधासाठी विटाव्हॅक्स २.५ ग्रॅम आणि ॲझोटोबॅक्टर २५ ग्रॅम प्रति किलो बियाण्याला चोळावे.',
      hi: 'उन्नत किस्में: एचडी 2189, जीडब्ल्यू 496, फुले समाधान। कंडुआ रोग से बचाव हेतु वीटावैक्स 2.5 ग्राम और एजोटोबैक्टर 25 ग्राम प्रति किग्रा बीज उपचारित करें।'
    },
    sowing: {
      en: 'Optimal sowing time is November 1 to 20. Sow in lines at 20-22.5 cm row spacing at 4-5 cm depth using a seed-cum-fertilizer drill.',
      mr: 'पेरणीची योग्य वेळ १ ते २० नोव्हेंबर आहे. दोन ओळींत २२.५ सेमी अंतर ठेवून ४ ते ५ सेमी खोलीवर बियाणे पेरावे. उशीर झाल्यास बियाणे दर २५% वाढवावा.',
      hi: 'बुआई का सर्वोत्तम समय 1 से 20 नवंबर है। सीड-कम-फर्टिलाइजर ड्रिल से 20-22.5 सेमी की दूरी पर 4-5 सेमी गहराई पर बुआई करें।'
    },
    irrigation: {
      en: 'Requires 4-6 irrigations. The Crown Root Initiation (CRI) stage at 21 days after sowing is critical; never miss this irrigation.',
      mr: 'पिकास ४ ते ६ पाण्याच्या पाळ्या लागतात. पेरणीनंतर २१ दिवसांनी येणारी मुकुटमुळे फुटण्याची (CRI) अवस्था सिंचनासाठी अतिशय महत्त्वाची असते.',
      hi: 'गेहूं को 4-6 सिंचाइयों की आवश्यकता होती है। बुआई के 21 दिन बाद मुकुट जड़ (CRI) अवस्था की सिंचाई सबसे महत्वपूर्ण है, इसे कभी न छोड़ें।'
    },
    fertilizer: {
      en: 'Apply NPK @ 120:60:40 kg/ha for timely sown irrigated wheat. Apply half N and full P & K at sowing, and top-dress remaining N at first irrigation.',
      mr: 'बागायती गव्हासाठी १२०:६०:४० किलो नत्र, स्फुरद, पालाश प्रति हेक्टरी द्यावे. अर्धे नत्र, पूर्ण स्फुरद व पालाश पेरणीवेळी आणि उरलेले नत्र पहिल्या पाण्याच्या वेळी द्यावे.',
      hi: 'समय पर बुआई हेतु 120:60:40 NPK किग्रा/हेक्टर दें। आधा नाइट्रोजन, पूरा फास्फोरस व पोटाश बुआई पर और आधा नाइट्रोजन पहली सिंचाई पर दें।'
    },
    pest: {
      en: 'Monitor Termites and Aphids. For termites, treat seed with Chlorpyriphos or apply in soil. For aphids during earhead stage, spray Neem oil 1500 ppm or Thiamethoxam.',
      mr: 'वाळवी व मावा किडींवर लक्ष ठेवावे. वाळवीसाठी बियाण्यावर क्लोरपायरीफॉस प्रक्रिया करावी. मावा किडीचा प्रादुर्भाव झाल्यास थायामेथॉक्झाम ०.२ ग्रॅम/लिटर फवारावे.',
      hi: 'दीमक और माहू पर नजर रखें। दीमक के लिए बीज उपचार करें। माहू का प्रकोप होने पर नीम का तेल 1500 ppm या थायामेथोक्सम का छिड़काव करें।'
    },
    disease: {
      en: 'Rusts (brown and yellow) and Loose Smut are major concerns. Spray Propiconazole 25 EC @ 1 ml/L immediately when rust pustules appear on leaves.',
      mr: 'तांबेरा आणि काजळी हे मुख्य रोग आहेत. पानांवर पिवळे किंवा तपकिरी ठिपके दिसताच प्रोपिकोनाझोल २५ ईसी १ मिली प्रति लिटर पाण्यात मिसळून फवारावे.',
      hi: 'गेरुआ (रतुआ) और कंडुआ मुख्य रोग हैं। पत्तियों पर जंग जैसे धब्बे दिखते ही प्रोपिकोनाजोल 25 EC 1 मिली प्रति लीटर का छिड़काव करें।'
    },
    harvest: {
      en: 'Harvest when the crop turns straw-yellow, leaves dry up, and grains become hard with less than 18% moisture. Use sickles or combine.',
      mr: 'झाडे पिवळी पडून पाने वाळल्यावर आणि दाणे नखाने दाबले असता फुटत नाहीत अशा वेळी कापणी करावी. सकाळी कापणी करावी जेणेकरून दाणे गळत नाहीत.',
      hi: 'जब पौधे सुनहरे पीले हो जाएं और दाना सख्त हो जाए तब कटाई करें। सुबह के समय कटाई करने से दाना झड़ने का नुकसान कम होता है।'
    },
    storage: {
      en: 'Dry grains to below 12% moisture. Mix with dry neem leaves or apply aluminum phosphide tablets in airtight metal bins.',
      mr: 'गहू कडक उन्हात वाळवून आर्द्रता १०-१२% वर आणावी. साठवणुकीसाठी लोखंडी कोठीत कोरडा कडुनिंब पाला किंवा कापूर घालावा.',
      hi: 'दानों को सुखाकर नमी 10-12% पर लाएं। हवादार लोहे की कोठियों में रखें और सूखी नीम की पत्तियां मिलाकर कीटों से सुरक्षित रखें।'
    }
  },
  'Cotton': {
    climate: {
      en: 'Requires warm tropical conditions (21°C - 35°C) with minimum 180-200 frost-free days and abundant sunshine during boll maturation.',
      mr: 'कापूस पिकाला २१°C ते ३५°C उष्ण व कोरडे हवामान लागते. बोंडे भरताना आणि फुटताना कडक स्वच्छ सूर्यप्रकाश आवश्यक असतो.',
      hi: 'कपास के लिए 21°C से 35°C तापमान और खिली हुई धूप आवश्यक है। गूलर खिलते समय मौसम शुष्क होना चाहिए।'
    },
    soil: {
      en: 'Deep, moisture-retentive black cotton soil (regur) with good drainage and pH 7.0 - 8.5 is ideal. Waterlogging must be strictly avoided.',
      mr: 'पाण्याचा निचरा होणारी खोल काळी कसदार जमीन (कापसाची काळी जमीन, सामू ७ ते ८.५) अत्यंत योग्य असते. शेतात पाणी साचणार नाही याची काळजी घ्यावी.',
      hi: 'गहरी काली मिट्टी (रेगुर) जिसमें जल निकास अच्छा हो (pH 7.0 - 8.5) सर्वोत्तम है। खेत में जलभराव बिल्कुल नहीं होना चाहिए।'
    },
    seed: {
      en: 'Select approved Bt cotton hybrids suitable for your region. Treat non-Bt seeds with Imidacloprid (5g/kg) and Trichoderma (10g/kg).',
      mr: 'अधिकृत बीटी कापूस संकरित वाणांची निवड करावी. रसशोषक किडींच्या प्रतिबंधासाठी इमिडाक्लोप्रिड ५ ग्रॅम व ट्रायकोडर्मा १० ग्रॅम प्रति किलो बियाण्यास चोळावे.',
      hi: 'प्रमाणित बीटी कपास संकर बीज चुनें। रसचूसक कीटों से बचाव हेतु इमिडाक्लोप्रिड 5 ग्राम और ट्राइकोडर्मा 10 ग्राम से बीज उपचारित करें।'
    },
    sowing: {
      en: 'Sow after at least 75-100 mm monsoon rainfall. Plant at 90x60 cm or 120x45 cm spacing on ridges and furrows to facilitate drainage.',
      mr: 'किमान ७५ ते १०० मिमी पाऊस पडल्यानंतर वाफशावर पेरणी करावी. ९०x६० सेमी किंवा १२०x४५ सेमी अंतरावर सरी-वरंब्यावर टोकण पद्धतीने लागवड करावी.',
      hi: 'मानसून की पहली 75-100 मिमी वर्षा के बाद 90x60 सेमी या 120x45 सेमी की दूरी पर मेड़ों (रिज-फरो) पर बीजों की चौपाई करें।'
    },
    irrigation: {
      en: 'Critical stages are square formation, flowering, and boll development. Drip irrigation saves 40% water and prevents waterlogging.',
      mr: 'पात्या लागणे, फुले येणे आणि बोंडे भरणे या सिंचनासाठी अत्यंत संवेदनशील अवस्था आहेत. ठिबक सिंचन पद्धतीचा वापर केल्यास उत्पादनात लक्षणीय वाढ होते.',
      hi: 'फूल आते समय और गूलर बनते समय खेत में नमी रहनी चाहिए। ड्रिप सिंचाई से 40% पानी की बचत और पैदावार में वृद्धि होती है।'
    },
    fertilizer: {
      en: 'Apply NPK @ 120:60:60 kg/ha for Bt cotton. Give full P and K at sowing, and apply Nitrogen in 3 splits (at sowing, squaring, and flowering).',
      mr: 'बीटी कापसासाठी १२०:६०:६० किलो नत्र, स्फुरद व पालाश प्रति हेक्टरी द्यावे. स्फुरद व पालाश पेरणीवेळी आणि नत्र ३ समान हप्त्यांमध्ये विभागून द्यावे.',
      hi: 'बीटी कपास हेतु 120:60:60 NPK किग्रा/हेक्टर दें। फास्फोरस व पोटाश बुआई पर और नाइट्रोजन तीन भागों में (बुआई, कली व फूल आते समय) दें।'
    },
    pest: {
      en: 'Implement IPM for Pink Bollworm: install pheromone traps (5/acre), release Trichogramma egg parasitoids, and spray Emamectin Benzoate if ETL crosses.',
      mr: 'गुलाबी बोंडअळीसाठी एकरी ५ कामगंध सापळे लावावेत. ट्रायकोग्रामा मित्रकीटक सोडावेत. प्रादुर्भाव वाढल्यास इमामेक्टिन बेन्झोएट ०.४ ग्रॅम/लिटर फवारावे.',
      hi: 'गुलाबी सुंडी नियंत्रण के लिए प्रति एकड़ 5 फेरोमोन ट्रैप लगाएं। ट्राइकोग्रामा छोड़ें। प्रकोप अधिक होने पर इमामेक्टिन बेंजोएट का छिड़काव करें।'
    },
    disease: {
      en: 'Manage Leaf Spot and Grey Mildew by avoiding dense planting and excessive urea. Spray Copper Oxychloride (2.5 g/L) + Streptocycline (0.1 g/L).',
      mr: 'दहिया आणि जिवाणू करपा नियंत्रणासाठी कॉपर ऑक्सिक्लोराईड २.५ ग्रॅम आणि स्ट्रेप्टोसायक्लिन १ ग्रॅम प्रति १० लिटर पाण्यात मिसळून फवारावे.',
      hi: 'दहिया और पत्ती धब्बा रोग के लिए कॉपर ऑक्सीक्लोराइड 2.5 ग्राम के साथ स्ट्रेप्टोसाइक्लिन 1 ग्राम/10 लीटर पानी में मिलाकर छिड़कें।'
    },
    harvest: {
      en: 'Pick cotton when bolls burst fully open and fluff dries. Pick in dry, sunny morning hours without picking dry leaves or bracts.',
      mr: 'बोंडे पूर्णपणे उमलल्यानंतर कोरड्या उन्हात वेचणी करावी. वेचणी करताना सुका पालापाचोळा आणि कचरा येणार नाही याची दक्षता घ्यावी.',
      hi: 'गूलर पूरी तरह खिल जाने पर खिली धूप में सुबह के समय चुनाई करें। सूखे पत्ते और कचरा कपास में न मिलने दें।'
    },
    storage: {
      en: 'Sun-dry picked seed cotton on clean ground to reduce moisture below 8%. Store in a clean, dry room free from moisture and fire hazards.',
      mr: 'वेचणी केलेला कापूस ताडपत्रीवर उन्हात वाळवून ओलावा ८% खाली आणावा. कोरड्या, हवेशीर गोदामात साठवावा आणि आगीपासून सुरक्षित ठेवावा.',
      hi: 'चुनाई के बाद कपास को धूप में सुखाकर नमी 8% से कम करें। सूखे, साफ कमरे में रखें और आग व नमी से पूरी सुरक्षा रखें।'
    }
  },
  'Soybean': {
    climate: {
      en: 'Thrives in warm, humid conditions with temperatures between 20°C and 30°C. Heavy rains during flowering or harvesting cause yield losses.',
      mr: 'सोयाबीन पिकाला २०°C ते ३०°C तापमान आणि मध्यम ते भरपूर पाऊस मानवतो. फुले लागताना आणि काढणीवेळी अतिवृष्टी नुकसानकारक ठरते.',
      hi: 'सोयाबीन के लिए 20°C से 30°C तापमान अनुकूल है। फूल आने और कटाई के समय अत्यधिक बारिश नुकसानदेह होती है।'
    },
    soil: {
      en: 'Deep black soil or well-drained loam with pH 6.0 - 7.5. Avoid saline soils and waterlogged fields.',
      mr: 'मध्यम ते भारी काळी निचऱ्याची जमीन (सामू ६.५ ते ७.५) उत्तम. शेतात पाण्याचा निचरा योग्य असावा, चोपण किंवा खारवट जमीन टाळावी.',
      hi: 'अच्छी जल निकास वाली मध्यम से भारी काली मिट्टी (pH 6.5 - 7.5) सर्वोत्तम है। जलभराव वाली जमीनों से बचें।'
    },
    seed: {
      en: 'Use certified varieties: JS 335, JS 93-05, DS 228 (Phule Kalyani), KDS 344 (Phule Agrani). Treat with Trichoderma (5g/kg) and Bradyrhizobium culture (250g/10kg).',
      mr: 'जेएस ३३५, जेएस ९३-०५, केडीएस ३४४ (फुले अग्रणी), फुले कल्याणी हे वाण वापरावेत. बियाण्यास थायरम २ ग्रॅम, ट्रायकोडर्मा ५ ग्रॅम व रायझोबियम जिवाणू खत चोळावे.',
      hi: 'प्रमाणित किस्में: जेएस 335, जेएस 93-05, केडीएस 344। थीरम (2 ग्राम), ट्राइकोडर्मा (5 ग्राम) और राइजोबियम कल्चर (25 ग्राम/किग्रा) से बीज उपचारित करें।'
    },
    sowing: {
      en: 'Sow only after minimum 75-100 mm rainfall. Sow in lines at 45x5 cm spacing and 3-4 cm depth. Avoid deep sowing.',
      mr: 'किमान ७५ ते १०० मिमी पाऊस झाल्यानंतरच वाफशावर पेरणी करावी. दोन ओळींत ४५ सेमी व दोन रोपांत ५ सेमी अंतर ठेवून ३-४ सेमीपेक्षा जास्त खोल पेरू नये.',
      hi: 'कम से कम 75-100 मिमी वर्षा के बाद ही बुआई करें। कतार से कतार 45 सेमी और पौधे से पौधा 5 सेमी की दूरी पर 3-4 सेमी गहराई पर बुआई करें।'
    },
    irrigation: {
      en: 'Generally rainfed during kharif. If dry spell occurs, protective irrigation at pod initiation and grain development significantly boosts yield.',
      mr: 'खरीप हंगामात हे पीक पावसावर येते. पावसाचा दीर्घ खंड पडल्यास शेंगा भरण्याच्या अत्यंत संवेदनशील अवस्थेत एक संरक्षित पाणी द्यावे.',
      hi: 'खरीफ में यह वर्षा आधारित फसल है। यदि सूखा पड़े तो फली बनते समय एक जीवनरक्षक सिंचाई अवश्य दें।'
    },
    fertilizer: {
      en: 'Apply NPK @ 20:60:40 kg/ha with 20 kg Sulphur per hectare as basal at the time of sowing. Being a legume, excess Nitrogen is harmful.',
      mr: 'पेरणीच्या वेळी २०:६०:४० किलो नत्र, स्फुरद व पालाश आणि २० किलो गंधक प्रति हेक्टरी द्यावे. नत्राचा अतिवापर टाळावा कारण पीक हवेतील नत्र शोषून घेते.',
      hi: 'बुआई के समय 20:60:40 NPK और 20 किग्रा सल्फर प्रति हेक्टेयर दें। दलहनी फसल होने के कारण अधिक यूरिया न दें।'
    },
    pest: {
      en: 'Manage Girdle Beetle and Spodoptera caterpillar. Install pheromone traps (5/acre). Spray Chlorantraniliprole 18.5 SC @ 0.3 ml/L or Emamectin Benzoate.',
      mr: 'चक्रीभुंगा व लष्करी अळीच्या नियंत्रणासाठी कामगंध सापळे लावावेत. प्रादुर्भाव दिसताच क्लोरँट्रानिलीप्रोल ०.३ मिली किंवा इमामेक्टिन बेन्झोएट ०.४ ग्रॅम/लिटर फवारावे.',
      hi: 'चक्र भृंग (गर्डल बीटल) और इल्ली के लिए फेरोमोन ट्रैप लगाएं। प्रकोप होने पर क्लोरेंट्रानिलीप्रोल 0.3 मिली या इमामेक्टिन बेंजोएट का छिड़काव करें।'
    },
    disease: {
      en: 'Control Rust and Charcoal Rot. Avoid monoculture and water stagnation. Spray Tebuconazole 25.9 EC @ 1 ml/L upon seeing rust pustules.',
      mr: 'तांबेरा आणि मूळकूज टाळण्यासाठी शेतात पाणी साचू देऊ नये. तांबेऱ्याचा प्रादुर्भाव दिसल्यास टेबुकोनाझोल २५.९ ईसी १ मिली प्रति लिटर पाण्यात मिसळून फवारावे.',
      hi: 'गेरुआ और जड़ सड़न से बचाव के लिए खेत में जलभराव न होने दें। गेरुआ दिखने पर टेबुकोनाजोल 25.9 EC 1 मिली/लीटर का छिड़काव करें।'
    },
    harvest: {
      en: 'Harvest when 85% of leaves turn yellow and drop off, and pods turn golden-brown. Delay causes pod shattering.',
      mr: 'पाने पिवळी पडून गळल्यावर आणि शेंगांचा रंग तपकिरी-तांबूस झाल्यावर त्वरित काढणी करावी. उशीर झाल्यास शेंगा फुटून दाणे शेतात गळतात.',
      hi: 'जब 85% पत्तियां पीली होकर झड़ जाएं और फलियां भूरी हो जाएं तब कटाई करें। देरी करने से फलियां चटकने लगती हैं।'
    },
    storage: {
      en: 'Thresh at cylinder speed of 350-400 RPM to avoid seed coat cracking. Dry grains to 10-12% moisture before bagging in dry gunny sacks.',
      mr: 'मळणी करताना थ्रेशरचा वेग कमी ठेवावा जेणेकरून बियाण्याचा वरचा पापुद्रा फुटणार नाही. आर्द्रता १०-१२% आणून कोरड्या पोत्यात साठवणूक करावी.',
      hi: 'मड़ाई के समय थ्रेशर की गति धीमी रखें ताकि बीज टूटे नहीं। दानों को सुखाकर नमी 10-12% तक लाकर बोरियों में सुरक्षित रखें।'
    }
  },
  'Sugarcane': {
    climate: {
      en: 'Requires warm tropical climate (20°C - 35°C) with high humidity for vegetative growth and dry sunny weather for sucrose accumulation.',
      mr: 'उसासाठी २०°C ते ३५°C उष्ण व दमट हवामान कांडीच्या वाढीसाठी आणि पक्वतेच्या काळात कोरडे स्वच्छ हवामान साखर उताऱ्यासाठी आवश्यक असते.',
      hi: 'गन्ने की बढ़वार के लिए 20°C से 35°C तापमान और आर्द्रता, तथा पकते समय मीठी धूप व शुष्क मौसम आवश्यक है।'
    },
    soil: {
      en: 'Deep, rich loamy or alluvial soil with good drainage, high organic content, and pH 6.5 - 8.0. Saline-alkaline soils severely reduce cane yield.',
      mr: 'किमान १ मीटर खोलीची उत्तम निचऱ्याची काळी कसदार गाळाची जमीन (सामू ६.५ ते ८) निवडावी. क्षारपड व चोपण जमिनीत उसाचे उत्पादन घटते.',
      hi: 'गहरी, उपजाऊ दोमट या काली मिट्टी (pH 6.5 - 8.0) जिसमें जल निकास अच्छा हो उपयुक्त है। क्षारीय भूमि में पैदावार कम होती है।'
    },
    seed: {
      en: 'Use certified healthy two-eye bud setts of Co 86032 (Nira), CoM 0265 (Phule 265), or Co 94012. Treat setts with Carbendazim (1g/L) + Chlorpyriphos (2ml/L).',
      mr: 'को ८६०३२ (नीरा), कोएम ०२६५ (फुले २६५) या वाणांचे दोन डोळ्यांचे निरोगी बेणे वापरावे. बेणेप्रक्रियेसाठी कार्बेन्डाझिम १ ग्रॅम आणि क्लोरपायरीफॉस २ मिली प्रति लिटर पाण्यात बेणे बुडवावे.',
      hi: 'को 86032, कोएम 0265 के दो आंख वाले स्वस्थ टुकड़े चुनें। कार्बेन्डाजिम (1 ग्राम/लीटर) और क्लोरपायरीफॉस के घोल में 15 मिनट डुबोकर उपचारित करें।'
    },
    sowing: {
      en: 'Plant in furrows at 4 to 5 feet row spacing for single row or 6 feet for paired row system. Place setts end-to-end and cover with 2 inches of soil.',
      mr: 'सरी पद्धतीत ४ ते ५ फूट अंतरावर किंवा जोडओळ पद्धतीत अडीच बाय ५ फूट अंतरावर डोळे बाजूला राहतील अशा बेण्याची डोळ्यास डोळा लावून लागवड करावी.',
      hi: '4 से 5 फीट की दूरी पर नालियां बनाकर 2 आंख वाले टुकड़ों को सटाकर रखें और 2 इंच मिट्टी से ढक दें। ट्रेंच विधि से पानी की बचत होती है।'
    },
    irrigation: {
      en: 'Water requirements are high (2000-2500 mm). Install drip irrigation to save 50% water and apply soluble fertilizers directly through fertigation.',
      mr: 'उसाला दर १० ते १२ दिवसांनी पाण्याची गरज असते. ठिबक सिंचनाचा वापर केल्यास पाण्याची ५०% बचत होते आणि खते थेट मुळाशी देता येतात.',
      hi: 'गन्ने को भरपूर पानी चाहिए। ड्रिप सिंचाई प्रणाली अपनाकर 50% पानी बचाया जा सकता है और फर्टिगेशन से खतों की दक्षता बढ़ती है।'
    },
    fertilizer: {
      en: 'Apply NPK @ 250:115:115 kg/ha for adsali or 400:170:170 for suru. Apply N in 4 splits: at planting, 6-8 weeks, 12-14 weeks, and earthing up.',
      mr: 'सुरू उसासाठी २५०:११५:११५ आणि आडसाली उसासाठी ४००:१७०:१७० किलो नत्र, स्फुरद, पालाश द्यावे. मोठ्या बांधणीच्या वेळी नत्राचा शेवटचा हप्ता द्यावा.',
      hi: 'शुरू गन्ने के लिए 250:115:115 NPK किग्रा/हेक्टर दें। नाइट्रोजन चार भागों में बुआई, कल्ले, बढ़वार और अंतिम मिट्टी चढ़ाते समय दें।'
    },
    pest: {
      en: 'Control Early Shoot Borer using Trichogramma egg cards and soil application of Fipronil granules. For White Grub, apply Metarhizium anisopliae.',
      mr: 'कांडी कीड व खोडकिडीसाठी ट्रायकोग्रामा मित्रकीटक सोडावेत. हुमणी नियंत्रणासाठी मेटारायझियम अ‍ॅनिमोसोप्ली ५ किलो शेणखतात मिसळून द्यावे.',
      hi: 'कंसुआ (सूट बोरर) के लिए ट्राइकोग्रामा कार्ड लगाएं। सफेद लट (व्हाइट ग्रब) के जैविक नियंत्रण हेतु मेटाराइजम जैव-कीटनाशक का प्रयोग करें।'
    },
    disease: {
      en: 'Watch for Red Rot, Smut, and Grassy Shoot Disease. Use disease-free seed setts, practice crop rotation, and rogue out infected clumps promptly.',
      mr: 'तांबोरा (रेड रॉट), काजळी आणि गवताळ वाढ हे मुख्य रोग आहेत. रोगट उसाचे बेणे वापरू नये. रोगट बेटे मुळासकट उपटून नष्ट करावीत.',
      hi: 'लाल सड़न (रेड रॉट) और कंडुआ से बचाव के लिए स्वस्थ बीज इस्तेमाल करें। ग्रसित पौधों को जड़ से उखाड़कर नष्ट करें।'
    },
    harvest: {
      en: 'Harvest when Brix reading reaches 18-20% and lower leaves dry completely (at 11-12 months for Suru, 14-16 months for Adsali). Cut flush with the ground.',
      mr: 'ब्रिक्स रिडिंग १८ ते २०% झाल्यावर आणि ऊस पक्व झाल्यावर जमिनीलगत कोयत्याने छाटणी करावी. जमिनीलगत कापल्याने पुढील खोडव्याचे उत्पादन चांगले येते.',
      hi: 'जब गन्ने में मिठास (ब्रिक्स 18-20%) आ जाए तब कटाई करें। कटाई हमेशा जमीन की सतह से सटाकर करें ताकि पेड़ी अच्छी फूटे।'
    },
    storage: {
      en: 'Transport cane to the sugar mill within 24-48 hours of cutting to prevent sucrose inversion and weight loss.',
      mr: 'कापणीनंतर २४ ते ३६ तासांच्या आत ऊस साखर कारखान्यात पोहोचवावा, अन्यथा वजनात घट होते आणि साखर उतारा कमी होतो.',
      hi: 'कटाई के बाद 24 से 48 घंटे के भीतर गन्ने की पेराई या चीनी मिल में आपूर्ति सुनिश्चित करें ताकि वजन और मिठास कम न हो।'
    }
  },
  'Onion': {
    climate: {
      en: 'Requires mild, cool climate (13°C - 24°C) for vegetative growth and warm dry conditions (25°C - 32°C) for bulb enlargement and maturity.',
      mr: 'कांदा पिकाला शाकीय वाढीच्या काळात १३°C ते २४°C थंड हवामान आणि कांदा पोसताना व पक्व होताना २५°C ते ३०°C उबदार व कोरडे हवामान मानवते.',
      hi: 'प्याज की वानस्पतिक बढ़वार के लिए 13°C से 24°C और कंद बनते समय 25°C से 30°C शुष्क मौसम सर्वोत्तम है।'
    },
    soil: {
      en: 'Rich, friable sandy loam or alluvial soil with pH 6.5 - 7.5. Avoid heavy clay soils that restrict bulb expansion.',
      mr: 'उत्तम निचरा होणारी भुसभुशीत गाळाची किंवा मध्यम काळी जमीन (सामू ६.५ ते ७.५) उत्तम. जड चिकणमातीत कांद्याचा आकार गोल न होता चपटा होतो.',
      hi: 'जीवांशयुक्त दोमट या बलुई दोमट मिट्टी (pH 6.5 - 7.5) सबसे अच्छी है। भारी मिट्टी में कंद का विकास रुकता है।'
    },
    seed: {
      en: 'Varieties: Bhima Super, Bhima Red, Bhima Kiran, Phule Samarth, Agrifound Dark Red. Treat seeds with Thiram (2g/kg) and Azospirillum.',
      mr: 'भीमा सुपर, भीमा किरण, फुले समर्थ, भीमा रेड हे सुधारित वाण निवडावेत. बियाण्यास थायरम २ ग्रॅम आणि ट्रायकोडर्मा ५ ग्रॅम प्रति किलो चोळावे.',
      hi: 'किस्में: भीमा सुपर, भीमा किरण, भीमा लाल, एग्रीफाउंड डार्क रेड। थीरम (2 ग्राम/किग्रा) और ट्राइकोडर्मा से बीज उपचारित करें।'
    },
    sowing: {
      en: 'Transplant 6-7 weeks old healthy nursery seedlings at 15x10 cm spacing on flat beds or broad bed furrows (BBF).',
      mr: 'गादीवाफ्यावरील ६ ते ७ आठवड्यांची रोपे उपटून १५x१० सेमी अंतरावर सपाट वाफ्यात किंवा रुंद वरंब्यावर (BBF) पुनर्लागवड करावी.',
      hi: 'नर्सरी में तैयार 6-7 सप्ताह पुराने पौधों को 15x10 सेमी की दूरी पर क्यारियों या ब्रॉड बेड फरो (BBF) पर लगाएं।'
    },
    irrigation: {
      en: 'Requires frequent light irrigations due to shallow root system. Withhold irrigation 10-15 days before harvest to enhance shelf life.',
      mr: 'कांद्याची मुळे उथळ असल्यामुळे हलक्या व नियमित पाण्याच्या पाळ्या द्याव्यात. काढणीपूर्वी १० ते १५ दिवस आधी पाणी बंद करावे.',
      hi: 'उथली जड़ों के कारण हल्की और बार-बार सिंचाई करें। कंद पकने पर कटाई से 10-15 दिन पहले पानी देना बंद कर दें।'
    },
    fertilizer: {
      en: 'Apply NPK @ 100:50:50 kg/ha + 30 kg Sulphur. Apply full P, K, and Sulphur and half N at transplanting; top-dress remaining N at 30 and 45 days.',
      mr: '१००:५०:५० किलो नत्र, स्फुरद, पालाश आणि ३० किलो गंधक प्रति हेक्टरी द्यावे. गंधकामुळे कांद्याचा तिखटपणा आणि टिकाऊपणा वाढतो.',
      hi: '100:50:50 NPK और 30 किग्रा सल्फर प्रति हेक्टेयर दें। सल्फर से प्याज में चमक, तीखापन और भंडारण क्षमता बढ़ती है।'
    },
    pest: {
      en: 'Thrips are the primary pest causing silvery white streaks. Install blue sticky traps (10/acre) and spray Fipronil 5 SC @ 1.5 ml/L or Spinosad.',
      mr: 'कांद्यावरील फुलकिडे (थ्रिप्स) पानांतील रस शोषतात. यासाठी एकरी १० निळे चिकट सापळे लावावेत व प्रादुर्भाव दिसताच फिप्रोनिल १.५ मिली/लिटर फवारावे.',
      hi: 'थ्रिप्स (माहू) से पत्तियों पर सफेद धारियां बनती हैं। नीले चिपचिपे कार्ड लगाएं और फिप्रोनिल 1.5 मिली/लीटर का छिड़काव करें।'
    },
    disease: {
      en: 'Purple Blotch and Stemphylium Blight are destructive fungal diseases. Spray Mancozeb 75 WP @ 2.5 g/L with a sticker upon seeing purple spots.',
      mr: 'जांभळा करपा रोगाच्या नियंत्रणासाठी मॅन्कोझेब २.५ ग्रॅम आणि स्टिकर १ मिली प्रति लिटर पाण्यात मिसळून फवारावे.',
      hi: 'बैंगनी धब्बा रोग (पर्पल ब्लॉच) के लिए मैंकोजेब 2.5 ग्राम प्रति लीटर पानी में चिपचिपे पदार्थ के साथ मिलाकर छिड़कें।'
    },
    harvest: {
      en: 'Harvest when 50% of plant tops fall over (neck break stage). Pull bulbs gently and leave them in field rows for 3-4 days for windrow curing.',
      mr: '५०% माना पडल्यावर (कांदे पक्व झाल्यावर) उपटणी करावी. शेतातच कांद्याच्या पानांनी कांदा झाकून ३-४ दिवस शेतात सुकवावा (फील्ड क्युरिंग).',
      hi: 'जब 50% पौधों की पत्तियां नीचे गिर जाएं तब कंद उखाड़ें। खेत में पत्तियों से ढककर 3-4 दिन धूप में सुखाएं (क्युरिंग)।'
    },
    storage: {
      en: 'Cut tops leaving 2.5 cm neck. Store dry, sorted bulbs in ventilated onion storage structures (chawls) on slatted bamboo racks.',
      mr: 'कांद्याची मान २.५ सेमी ठेवून पात कापावी. चाळीत हवेशीर लाकडी किंवा बांबूच्या रॅक्सवर पातळ थरात साठवण करावी जेणेकरून सड होणार नाही.',
      hi: 'गर्दन 2.5 सेमी छोड़कर पत्तियां काटें। हवादार प्याज भंडारण गृह (चाली) में बांस की जालीदार रैक पर 4-5 महीने तक सुरक्षित रखें।'
    }
  }
};

// Generic template builder for crops without explicit custom overrides
function generateGenericStage(crop, stageKey, lang) {
  const cropName = crop.name;
  const localName = (crop.localNames && crop.localNames[lang]) ? crop.localNames[lang] : cropName;
  const tempMin = (crop.temperature && crop.temperature.min) || (crop.tempRange && crop.tempRange.min) || 20;
  const tempMax = (crop.temperature && crop.temperature.max) || (crop.tempRange && crop.tempRange.max) || 35;
  const seasons = (crop.seasons || crop.suitableSeasons || ['kharif']).join(', ');
  const soilsEn = (crop.suitableSoils || ['loamy', 'alluvial']).join(' or ');
  const soilsMr = (crop.suitableSoils || ['काळी', 'गाळाची']).join(' किंवा ');
  const soilsHi = (crop.suitableSoils || ['दोमट', 'काली']).join(' या ');

  const templates = {
    climate: {
      en: `${cropName} requires suitable agro-climatic conditions with temperatures between ${tempMin}°C and ${tempMax}°C. Adequate sunshine and humidity during ${seasons} seasons ensure healthy vegetative growth.`,
      mr: `${localName} पिकासाठी ${tempMin}°C ते ${tempMax}°C दरम्यानचे तापमान अत्यंत अनुकूल असते. ${seasons} हंगामातील हवामानात पिकाची वाढ जोमदार होते.`,
      hi: `${localName} की खेती के लिए ${tempMin}°C से ${tempMax}°C का तापमान सर्वोत्तम है। ${seasons} मौसम में फसल की बढ़वार बहुत अच्छी होती है।`
    },
    soil: {
      en: `Prefers well-drained ${soilsEn} soil with good organic matter and a pH range of 6.0 to 7.5. Deep summer ploughing followed by 2 harrowings creates an optimal tilth.`,
      mr: `पाण्याचा उत्तम निचरा होणारी ${soilsMr} जमीन (सामू ६.० ते ७.५) या पिकास उत्तम ठरते. उन्हाळ्यात खोल नांगरट करून ढेकळे फोडून जमीन भुसभुशीत करावी.`,
      hi: `अच्छे जल निकास वाली ${soilsHi} मिट्टी (pH 6.0 - 7.5) उपयुक्त है। 2-3 गहरी जुताई करके खेत को भुरभुरा और समतल बनाएं।`
    },
    seed: {
      en: `Select certified, high-yielding varieties recommended by agricultural universities. Treat seeds with Trichoderma viride @ 5-10 g/kg seed or suitable bio-fungicide to prevent seed-borne pathogens.`,
      mr: `कृषी विद्यापीठाने शिफारस केलेले प्रमाणित व कीड-रोग प्रतिकारक्षम वाण निवडावेत. बियाण्यास ट्रायकोडर्मा ५ ते १० ग्रॅम प्रति किलो चोळून सावलीत वाळवावे.`,
      hi: `कृषि विश्वविद्यालय द्वारा अनुशंसित प्रमाणित उन्नत किस्मों का चयन करें। बीज जनित रोगों से सुरक्षा हेतु ट्राइकोडर्मा 5-10 ग्राम प्रति किग्रा से बीज उपचारित करें।`
    },
    sowing: {
      en: `Sowing should be carried out during ${crop.sowingPeriod || 'the recommended seasonal window'}. Maintain recommended line and plant spacing to ensure proper aeration and sunlight penetration.`,
      mr: `पेरणी ${crop.sowingPeriod || 'हंगामाच्या सुरुवातीला'} करावी. शिफारस केलेले दोन ओळींतील व रोपांतील अंतर काटेकोरपणे राखावे जेणेकरून पिकास पुरेसा सूर्यप्रकाश मिळेल.`,
      hi: `बुआई ${crop.sowingPeriod || 'उचित मौसमी समय'} पर करें। कतार और पौधों की उचित दूरी रखें ताकि पौधों को पर्याप्त धूप और हवा मिल सके।`
    },
    irrigation: {
      en: `Water requirement is ${crop.waterRequirement}. Critical irrigation stages include germination/establishment, flowering, and fruit/grain filling stages. Drip or sprinkler irrigation is recommended.`,
      mr: `पिकाची पाण्याची गरज ${crop.waterRequirement === 'high' ? 'जास्त' : (crop.waterRequirement === 'low' ? 'कमी' : 'मध्यम')} आहे. फुले येणे आणि दाणे/फळे भरण्याच्या संवेदनशील अवस्थेत वेळेवर पाणी द्यावे. ठिबक सिंचनाचा वापर फायदेशीर ठरतो.`,
      hi: `पानी की आवश्यकता ${crop.waterRequirement === 'high' ? 'अधिक' : (crop.waterRequirement === 'low' ? 'कम' : 'मध्यम')} है। फूल आने और फल/दाना बनते समय खेत में नमी बनाए रखें। ड्रिप सिंचाई सर्वोत्तम है।`
    },
    fertilizer: {
      en: `Apply farmyard manure (FYM) @ 10-15 tonnes/ha during land preparation. Use balanced NPK as per soil health card recommendations, splitting nitrogen for optimal uptake.`,
      mr: `पूर्वमशागतीच्या वेळी हेक्टरी १० ते १५ टन चांगले कुजलेले शेणखत मिसळावे. माती परीक्षणानुसार संतुलित नत्र, स्फुरद व पालाश खतमात्रा द्यावी.`,
      hi: `खेत की तैयारी में 10-15 टन सड़ी गोबर की खाद मिलाएं। मृदा स्वास्थ्य कार्ड के अनुसार संतुलित एनपीके और सूक्ष्म पोषक तत्वों का प्रयोग करें।`
    },
    pest: {
      en: `Adopt Integrated Pest Management (IPM): install yellow/blue sticky traps and pheromone traps. Spray neem oil (1500 ppm) at early pest incidence; use targeted insecticides only if ETL is breached.`,
      mr: `एकात्मिक कीड व्यवस्थापनाचा (IPM) अवलंब करावा. शेतात चिकट व कामगंध सापळे लावावेत. प्रादुर्भावाच्या सुरुवातीस निंबोळी अर्क किंवा ५% निंबोळी तेल फवारावे.`,
      hi: `एकीकृत कीट प्रबंधन (IPM) अपनाएं। पीले/नीले स्टिकी कार्ड लगाएं। प्रारंभिक अवस्था में नीम का तेल (1500 ppm) छिड़कें, अत्यधिक प्रकोप पर ही अनुशंसित कीटनाशक दें।`
    },
    disease: {
      en: `Prevent fungal and bacterial diseases with clean sanitation, proper drainage, and crop rotation. Apply copper-based or bio-fungicides at the earliest appearance of spots or blights.`,
      mr: `रोग नियंत्रणासाठी शेताची स्वच्छता राखावी व पाण्याचा निचरा व्यवस्थित ठेवावा. बुरशीजन्य रोगाची लक्षणे दिसताच बोर्डो मिश्रण किंवा जैविक बुरशीनाशकाची फवारणी करावी.`,
      hi: `रोगों से बचाव के लिए खेत साफ रखें और फसल चक्र अपनाएं। फफूंद के लक्षण दिखते ही कॉपर आधारित या जैविक कवकनाशी का छिड़काव करें।`
    },
    harvest: {
      en: `Harvest during ${crop.harvestPeriod || 'maturity'} when the crop displays distinctive maturity signs. Harvest in dry morning hours to minimize shattering and spoilage.`,
      mr: `पीक पक्वतेची लक्षणे दिसताच ${crop.harvestPeriod || 'योग्य वेळी'} काढणी करावी. काढणी कोरड्या हवामानात सकाळच्या वेळी करावी जेणेकरून नुकसान टळेल.`,
      hi: `फसल पूरी तरह पकने पर ${crop.harvestPeriod || 'उपयुक्त समय'} पर कटाई करें। कटाई हमेशा शुष्क मौसम में सुबह के समय करें।`
    },
    storage: {
      en: `Clean and dry harvested produce to recommended safe moisture levels. Store in well-aerated, rodent-proof structures or clean bags on raised wooden pallets.`,
      mr: `काढणीपश्चात शेतमाल चांगला स्वच्छ करून योग्य आर्द्रतेपर्यंत वाळवावा. हवेशीर, ओलावामुक्त आणि उंदरांपासून सुरक्षित गोदामात साठवणूक करावी.`,
      hi: `उत्पाद को अच्छी तरह साफ कर सुरक्षित नमी स्तर तक सुखाएं। हवादार गोदामों में लकड़ी के पटलों पर रखकर सुरक्षित भंडारण करें।`
    }
  };

  return templates[stageKey][lang] || templates[stageKey]['en'];
}

function buildCultivationGuides() {
  const allGuides = [];
  const stages = ['climate', 'soil', 'seed', 'sowing', 'irrigation', 'fertilizer', 'pest', 'disease', 'harvest', 'storage'];
  const languages = ['en', 'mr', 'hi'];

  cropsData.forEach(crop => {
    languages.forEach(lang => {
      const sections = stages.map((stageKey, idx) => {
        const order = idx + 1; // Strict 1 to 10 sequential order
        const title = STAGE_TITLES[stageKey][lang];
        
        let content = '';
        if (CROP_GUIDE_DETAILS[crop.name] && CROP_GUIDE_DETAILS[crop.name][stageKey]) {
          content = CROP_GUIDE_DETAILS[crop.name][stageKey][lang] || CROP_GUIDE_DETAILS[crop.name][stageKey]['en'];
        } else {
          content = generateGenericStage(crop, stageKey, lang);
        }

        return {
          order,
          title,
          content
        };
      });

      allGuides.push({
        cropName: crop.name,
        language: lang,
        sections,
        isActive: true
      });
    });
  });

  return allGuides;
}

module.exports = {
  buildCultivationGuides,
  STAGE_TITLES
};
