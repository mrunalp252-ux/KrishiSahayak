const mongoose = require('mongoose');

const cropRecommendationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    farm: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Farm',
    },
    inputs: {
      soilType: String,
      season: String,
      temperature: Number,
      waterAvailability: String,
      landSize: Number,
      state: String,
      district: String,
      previousCrop: String,
      irrigationType: String,
    },
    recommendations: [
      {
        crop: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Crop',
        },
        cropName: String,
        score: {
          type: Number,
          min: 0,
          max: 100,
        },
        reasons: [String],
        waterRequirement: String,
        expectedDuration: String,
        guidance: String,
        considerations: [String],
      },
    ],
  },
  {
    timestamps: true,
  }
);

const CropRecommendation = mongoose.model('CropRecommendation', cropRecommendationSchema);
module.exports = CropRecommendation;
