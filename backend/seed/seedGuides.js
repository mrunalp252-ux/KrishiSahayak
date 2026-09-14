const CultivationGuide = require('../models/CultivationGuide');
const Crop = require('../models/Crop');
const { buildCultivationGuides } = require('./guideDataBuilder');

async function seedGuides() {
  try {
    const allGuides = buildCultivationGuides();
    let seededCount = 0;

    for (const guide of allGuides) {
      const cropDoc = await Crop.findOne({ name: new RegExp('^' + guide.cropName + '$', 'i') });
      const formattedGuide = {
        crop: cropDoc ? cropDoc._id : undefined,
        cropName: guide.cropName,
        language: guide.language,
        sections: guide.sections,
        isActive: true
      };

      await CultivationGuide.findOneAndUpdate(
        { cropName: guide.cropName, language: guide.language },
        formattedGuide,
        { upsert: true, new: true }
      );
      seededCount++;
    }

    console.log(`Seeded ${seededCount} cultivation guides successfully across English, Marathi, and Hindi`);
    return seededCount;
  } catch (error) {
    console.error('Error seeding guides:', error);
    throw error;
  }
}

module.exports = seedGuides;
