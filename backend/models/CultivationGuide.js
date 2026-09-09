const mongoose = require('mongoose');

const cultivationGuideSchema = new mongoose.Schema(
  {
    crop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Crop',
      required: false,
      index: true,
    },
    cropName: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      default: 'en',
    },
    sections: [
      {
        title: {
          type: String,
          required: true,
        },
        content: {
          type: String,
          required: true,
        },
        order: Number,
      },
    ],
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
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

cultivationGuideSchema.index({ crop: 1, language: 1 }, { unique: true });

const CultivationGuide = mongoose.model('CultivationGuide', cultivationGuideSchema);
module.exports = CultivationGuide;
