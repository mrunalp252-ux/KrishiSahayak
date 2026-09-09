const mongoose = require('mongoose');

const farmSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    farmName: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: mongoose.Schema.Types.Mixed,
    },
    state: {
      type: String,
      required: true,
    },
    district: {
      type: String,
      required: true,
    },
    village: String,
    landSize: {
      type: Number,
      required: true,
      min: 0,
    },
    landUnit: {
      type: String,
      enum: ['acres', 'hectares', 'bigha', 'guntha'],
      default: 'acres',
    },
    soilType: {
      type: String,
      enum: ['alluvial', 'black', 'red', 'laterite', 'desert', 'mountain', 'clay', 'sandy', 'loamy', 'silt'],
      required: true,
    },
    irrigationType: {
      type: String,
      enum: ['rainfed', 'canal', 'borewell', 'well', 'drip', 'sprinkler', 'flood', 'other'],
      default: 'rainfed',
    },
    waterAvailability: {
      type: String,
      enum: ['abundant', 'moderate', 'scarce'],
      default: 'moderate',
    },
    currentCrop: String,
    cropVariety: String,
    sowingDate: Date,
    harvestDate: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

farmSchema.virtual('name').get(function () {
  return this.farmName;
});

farmSchema.virtual('size').get(function () {
  return this.landSize;
});

farmSchema.virtual('unit').get(function () {
  return this.landUnit;
});

const Farm = mongoose.model('Farm', farmSchema);
module.exports = Farm;
