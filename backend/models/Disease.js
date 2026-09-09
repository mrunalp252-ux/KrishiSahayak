const mongoose = require('mongoose');

const diseaseSchema = new mongoose.Schema(
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
    type: {
      type: String,
      enum: ['fungal', 'bacterial', 'viral', 'nematode', 'nutritional', 'other'],
    },
    affectedCrops: {
      type: [String],
      index: true,
    },
    symptoms: [String],
    causes: [String],
    prevention: [String],
    management: [String],
    severity: {
      type: String,
      enum: ['low', 'moderate', 'high', 'critical'],
      default: 'moderate',
    },
    monitoring: String,
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

diseaseSchema.virtual('diseaseName')
  .get(function() { return this.name; })
  .set(function(v) { this.name = v; });
diseaseSchema.virtual('cropsAffected')
  .get(function() { return this.affectedCrops; })
  .set(function(v) { this.affectedCrops = v; });

const Disease = mongoose.model('Disease', diseaseSchema);
module.exports = Disease;
