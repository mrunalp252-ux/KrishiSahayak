const mongoose = require('mongoose');

const cropSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    localNames: {
      type: Object,
      default: {},
    },
    scientificName: String,
    category: {
      type: String,
      enum: ['cereal', 'pulse', 'oilseed', 'cash_crop', 'vegetable', 'fruit', 'spice', 'fiber', 'other'],
      index: true,
    },
    suitableSoils: [String],
    suitableSeasons: [String], // kharif, rabi, zaid, annual
    tempRange: {
      min: Number,
      max: Number,
    },
    waterRequirement: {
      type: String,
      enum: ['low', 'moderate', 'high'],
    },
    duration: {
      min: Number,
      max: Number,
    },
    sowingPeriod: String,
    harvestPeriod: String,
    cultivationPractices: String,
    imageUrl: String,
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

cropSchema.virtual('cropName')
  .get(function() { return this.name; })
  .set(function(v) { this.name = v; });

const Crop = mongoose.model('Crop', cropSchema);
module.exports = Crop;
