const mongoose = require('mongoose');

const fertilizerGuideSchema = new mongoose.Schema(
  {
    crop: {
      type: String,
      required: true,
      index: true,
    },
    soilType: {
      type: String,
      required: true,
    },
    growthStage: {
      type: String,
      required: true,
    },
    fertilizerType: {
      type: String,
      default: 'NPK Balanced',
    },
    purpose: {
      type: String,
      default: 'Growth and yield enhancement',
    },
    fertilizers: [
      {
        name: String,
        amount: String,
        purpose: String
      }
    ],
    applicationStage: String,
    guidance: {
      type: String,
      required: true,
    },
    safetyNotes: String,
    localContent: {
      type: Object, // e.g., { hi: { guidance: '', safetyNotes: '' }, mr: { ... } }
      default: {},
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

fertilizerGuideSchema.index({ crop: 1, soilType: 1 });

const FertilizerGuide = mongoose.model('FertilizerGuide', fertilizerGuideSchema);
module.exports = FertilizerGuide;
