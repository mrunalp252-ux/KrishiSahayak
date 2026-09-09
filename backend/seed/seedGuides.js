const CultivationGuide = require('../models/CultivationGuide');
const Crop = require('../models/Crop');

const guidesData = [
  {
    cropName: 'Rice',
    language: 'en',
    sections: [
      {
        order: 1,
        title: 'Land Preparation',
        content: 'Plough the land 2-3 times during the summer to expose pests and weed roots to the sun. Puddling of the field is crucial before transplanting. It reduces water percolation losses, controls weeds, and makes transplanting easier. Level the field perfectly to ensure uniform water depth.'
      },
      {
        order: 2,
        title: 'Seed Selection',
        content: 'Select high-yielding and disease-resistant varieties suitable for your agro-climatic zone. Certified seeds should be preferred for higher germination rates. Treat seeds with fungicides (like Thiram or Carbendazim) or bio-agents (like Trichoderma) to prevent seed-borne diseases.'
      },
      {
        order: 3,
        title: 'Sowing',
        content: 'For transplanted rice, sow seeds in a well-prepared nursery bed. Transplant 21-25 days old seedlings into the puddled main field. Maintain a spacing of 20x15 cm or 15x15 cm depending on the variety, planting 2-3 seedlings per hill.'
      },
      {
        order: 4,
        title: 'Irrigation',
        content: 'Maintain a shallow water depth of 2-5 cm during the initial stages to facilitate rooting and tillering. Critical stages for irrigation are panicle initiation, flowering, and grain filling. Drain water from the field 10-15 days before harvest to hasten maturity.'
      },
      {
        order: 5,
        title: 'Nutrient Management',
        content: 'Apply a balanced dose of NPK. Give half the dose of Nitrogen and the full dose of Phosphorus and Potassium as basal at the time of transplanting. Top dress the remaining Nitrogen in two equal splits during tillering and panicle initiation stages.'
      },
      {
        order: 6,
        title: 'Pest Management',
        content: 'Common pests include Stem Borer, Brown Plant Hopper, and Leaf Folder. Adopt Integrated Pest Management (IPM) practices like using light traps, pheromone traps, and releasing Trichogramma egg parasitoids. Apply chemical pesticides only when the economic threshold level is crossed.'
      },
      {
        order: 7,
        title: 'Disease Management',
        content: 'Major diseases are Rice Blast, Bacterial Leaf Blight, and Sheath Blight. Avoid excessive use of nitrogenous fertilizers. Use resistant varieties and spray appropriate fungicides (like Tricyclazole for Blast) at early symptom manifestation.'
      },
      {
        order: 8,
        title: 'Harvesting',
        content: 'Harvest when 80% of the panicles turn golden yellow and the grains at the base of the panicle are in the hard dough stage. Delaying harvest can lead to grain shattering and reduced milling quality. Cut the crop close to the ground.'
      },
      {
        order: 9,
        title: 'Post-Harvest',
        content: 'Thresh the harvested crop promptly. Dry the paddy grains under the sun to reduce moisture content to about 12-14% for safe storage. Store in clean, dry gunny bags or modern silos protected from rodents and moisture.'
      }
    ]
  },
  {
    cropName: 'Wheat',
    language: 'en',
    sections: [
      {
        order: 1,
        title: 'Land Preparation',
        content: 'Wheat requires a well-pulverized but compact seedbed for good and uniform germination. Give one deep ploughing followed by 2-3 harrowings. Planking should be done after each ploughing to conserve moisture.'
      },
      {
        order: 2,
        title: 'Seed Selection',
        content: 'Choose improved rust-resistant varieties suitable for timely or late sowing. Ensure the seed is free from weed seeds and diseases. Treat the seed with Vitavax or Bavistin @ 2.5 g/kg seed to prevent loose smut.'
      },
      {
        order: 3,
        title: 'Sowing',
        content: 'Optimum sowing time is November. Sow in lines at a spacing of 20-22.5 cm. Sowing depth should be 4-5 cm. Use a seed-cum-fertilizer drill for uniform depth and better fertilizer placement.'
      },
      {
        order: 4,
        title: 'Irrigation',
        content: 'Wheat generally requires 4-6 irrigations depending on soil type. The most critical stage is Crown Root Initiation (CRI) which occurs 21 days after sowing. Other important stages are tillering, late jointing, flowering, and dough stages.'
      },
      {
        order: 5,
        title: 'Nutrient Management',
        content: 'Apply NPK as per soil test recommendations. Generally, half of the Nitrogen and full Phosphorus and Potash are applied as basal. The remaining Nitrogen is top-dressed with the first irrigation (CRI stage).'
      },
      {
        order: 6,
        title: 'Pest Management',
        content: 'Termites and Aphids are common pests. For termites, treat the seed with Chlorpyriphos or apply it in the soil before sowing. For aphids, spray appropriate systemic insecticides if the population is high.'
      },
      {
        order: 7,
        title: 'Disease Management',
        content: 'Rusts (yellow, brown, black) and loose smut are major diseases. Growing resistant varieties is the best defense. Spray Propiconazole or Tebuconazole if rust symptoms appear on the foliage.'
      },
      {
        order: 8,
        title: 'Harvesting',
        content: 'Harvest when the grains become hard and contain about 15-20% moisture. The straw turns dry and brittle. Use sickles or combine harvesters for quick and efficient harvesting.'
      },
      {
        order: 9,
        title: 'Post-Harvest',
        content: 'Dry the harvested grain thoroughly to bring the moisture down to 10-12% for safe storage. Clean the grain and store in fumigated bins or silos to protect from stored grain pests.'
      }
    ]
  },
  {
    cropName: 'Cotton',
    language: 'en',
    sections: [
      {
        order: 1,
        title: 'Land Preparation',
        content: 'Deep summer ploughing is recommended to destroy the resting stages of pests and diseases. Follow up with 2-3 harrowings to prepare a fine seedbed. Ensure good drainage as cotton is sensitive to waterlogging.'
      },
      {
        order: 2,
        title: 'Seed Selection',
        content: 'Select high-yielding Bt cotton hybrids suitable for your region to protect against bollworms. Acid delint the seeds if using non-delinted seeds. Treat with imidacloprid to protect against early sucking pests.'
      },
      {
        order: 3,
        title: 'Sowing',
        content: 'Sow pre-monsoon with irrigation or immediately after the onset of the monsoon. Plant seeds at a depth of 3-5 cm. Maintain spacing based on the soil type and hybrid used (e.g., 90x60 cm or 120x60 cm).'
      },
      {
        order: 4,
        title: 'Irrigation',
        content: 'Irrigate immediately after sowing if soil moisture is low. Subsequent irrigations should be given at 15-20 day intervals. Flowering and boll development are the most critical stages for moisture stress.'
      },
      {
        order: 5,
        title: 'Nutrient Management',
        content: 'Apply organic manure during land preparation. Apply NPK in split doses. Basal dose at sowing, followed by top dressing of Nitrogen at squaring and flowering stages. Foliar sprays of micronutrients like Magnesium and Zinc are beneficial.'
      },
      {
        order: 6,
        title: 'Pest Management',
        content: 'Cotton is highly prone to pests. Sucking pests (Whitefly, Jassids, Aphids) attack early, while bollworms attack later. Use Bt varieties for bollworm management. For sucking pests, use yellow sticky traps and spray neem-based or systemic insecticides.'
      },
      {
        order: 7,
        title: 'Disease Management',
        content: 'Common diseases include Bacterial Blight, Leaf Spots, and Wilt. Seed treatment is the first line of defense. Spray Copper oxychloride for bacterial blight. Improve drainage to manage wilt.'
      },
      {
        order: 8,
        title: 'Harvesting',
        content: 'Harvesting is done in multiple pickings as bolls mature sequentially. Pick fully opened bolls in the morning hours to avoid dry leaf bits sticking to the lint. Keep the picked cotton free from moisture and dust.'
      },
      {
        order: 9,
        title: 'Post-Harvest',
        content: 'Dry the seed cotton in the shade before storage. Store in a dry, clean place. Avoid mixing different varieties to maintain lint quality for better market prices.'
      }
    ]
  },
  {
    cropName: 'Soybean',
    language: 'en',
    sections: [
      {
        order: 1,
        title: 'Land Preparation',
        content: 'Requires a well-prepared seedbed with good drainage. Plough the field followed by cross harrowing. Broad bed furrow (BBF) or ridge and furrow methods are highly recommended to manage excess moisture during heavy rains.'
      },
      {
        order: 2,
        title: 'Seed Selection',
        content: 'Use fresh seeds every year as soybean seed loses viability quickly. Ensure a minimum germination percentage of 70%. Seed treatment with Bradyrhizobium culture is essential for nodulation and nitrogen fixation.'
      },
      {
        order: 3,
        title: 'Sowing',
        content: 'Sow when there is sufficient moisture in the soil, typically with the onset of the monsoon. The ideal depth of sowing is 3-4 cm. Row-to-row spacing of 45 cm and plant-to-plant spacing of 5-10 cm is standard.'
      },
      {
        order: 4,
        title: 'Irrigation',
        content: 'Grown mainly as a rainfed crop during Kharif. If dry spells occur, protective irrigation is necessary during pod formation and seed filling stages, which are highly sensitive to moisture stress.'
      },
      {
        order: 5,
        title: 'Nutrient Management',
        content: 'Apply well-rotted FYM. Being a legume, it fixes atmospheric nitrogen, so only a starter dose of Nitrogen is needed. Phosphorus and Sulphur are critical for higher yields and oil content. Apply full dose of fertilizers at sowing.'
      },
      {
        order: 6,
        title: 'Pest Management',
        content: 'Girdle beetle, Stem fly, and Defoliators (like Spodoptera) are major pests. Maintain a clean field. Use pheromone traps for monitoring. Spray selective insecticides when pest populations cross the threshold limit.'
      },
      {
        order: 7,
        title: 'Disease Management',
        content: 'Yellow Mosaic Virus (YMV) and Charcoal rot are significant threats. Use YMV resistant varieties and control the whitefly vector. Ensure proper crop rotation and avoid moisture stress to reduce charcoal rot.'
      },
      {
        order: 8,
        title: 'Harvesting',
        content: 'Harvest when leaves turn yellow and drop off, and pods turn brown or black. The seed moisture should be around 15% at harvest. Do not delay harvesting to prevent pod shattering.'
      },
      {
        order: 9,
        title: 'Post-Harvest',
        content: 'Thresh carefully at optimal speed to avoid seed damage. Dry the seeds to bring moisture content down to 10-12% for safe storage. Store in cool, dry conditions.'
      }
    ]
  },
  {
    cropName: 'Onion',
    language: 'en',
    sections: [
      {
        order: 1,
        title: 'Land Preparation',
        content: 'Onion requires a fine, friable soil for good bulb development. Plough the land deep followed by multiple harrowings to break clods. Prepare raised beds or flat beds depending on the soil type and season.'
      },
      {
        order: 2,
        title: 'Seed Selection',
        content: 'Select varieties suitable for the specific season (Rabi or Kharif). Prepare a raised nursery bed and treat seeds with Trichoderma viride or Thiram before sowing to prevent damping-off disease.'
      },
      {
        order: 3,
        title: 'Sowing',
        content: 'Transplant 6-8 weeks old healthy seedlings. Plant them at a shallow depth with a spacing of 15x10 cm. Irrigate lightly immediately after transplanting.'
      },
      {
        order: 4,
        title: 'Irrigation',
        content: 'Onions have a shallow root system and require frequent, light irrigations. Moisture stress during the bulb formation and enlargement stages severely reduces yield. Stop irrigation 10-15 days before harvest.'
      },
      {
        order: 5,
        title: 'Nutrient Management',
        content: 'Apply well-decomposed FYM during land preparation. Apply half Nitrogen and full doses of Phosphorus and Potash as basal. Top dress the remaining Nitrogen 30 and 45 days after transplanting. Sulphur application improves pungency and storage life.'
      },
      {
        order: 6,
        title: 'Pest Management',
        content: 'Thrips are the most damaging pest, causing silvery patches on leaves. Install blue sticky traps. Spray appropriate insecticides like Imidacloprid or Fipronil when infestation is noticed.'
      },
      {
        order: 7,
        title: 'Disease Management',
        content: 'Purple Blotch and Stemphylium Blight are major fungal diseases favored by high humidity. Apply preventive sprays of Mancozeb or Chlorothalonil. Ensure proper drainage to avoid root rot.'
      },
      {
        order: 8,
        title: 'Harvesting',
        content: 'Harvest when 50% of the plant tops (neck) fall over. Uproot the bulbs and leave them in the field for windrow drying (curing) for a few days to harden the outer scales and improve storage quality.'
      },
      {
        order: 9,
        title: 'Post-Harvest',
        content: 'Cut the tops leaving 2-2.5 cm of the neck. Sort and grade the bulbs, removing injured or thick-necked ones. Store in well-ventilated structures (chawls) with dry conditions to prevent rotting and sprouting.'
      }
    ]
  }
];

async function seedGuides() {
  try {
    for (const guide of guidesData) {
      const cropDoc = await Crop.findOne({ name: new RegExp('^' + guide.cropName + '$', 'i') });
      const formattedGuide = {
        ...guide,
        crop: cropDoc ? cropDoc._id : undefined,
        isActive: true
      };

      await CultivationGuide.findOneAndUpdate(
        { cropName: guide.cropName, language: guide.language },
        formattedGuide,
        { upsert: true, new: true }
      );
    }
    console.log(`Seeded ${guidesData.length} cultivation guides successfully`);
  } catch (error) {
    console.error('Error seeding guides:', error);
    throw error;
  }
}

module.exports = seedGuides;
