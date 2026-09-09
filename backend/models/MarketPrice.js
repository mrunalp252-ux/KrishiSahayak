const mongoose = require('mongoose');

const marketPriceSchema = new mongoose.Schema(
  {
    crop: {
      type: String,
      required: true,
      index: true,
    },
    market: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
      index: true,
    },
    district: String,
    price: {
      type: Number,
      required: true,
    },
    minPrice: Number,
    maxPrice: Number,
    unit: {
      type: String,
      default: 'quintal',
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    source: {
      type: String,
      required: true,
    },
    trend: {
      type: String,
      enum: ['rising', 'falling', 'stable', 'unknown'],
      default: 'unknown',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

marketPriceSchema.virtual('cropName')
  .get(function() { return this.crop; })
  .set(function(v) { this.crop = v; });
marketPriceSchema.virtual('marketName')
  .get(function() { return this.market; })
  .set(function(v) { this.market = v; });
marketPriceSchema.virtual('modalPrice')
  .get(function() { return this.price; })
  .set(function(v) { this.price = v; });

marketPriceSchema.index({ crop: 1, market: 1, date: -1 });

const MarketPrice = mongoose.model('MarketPrice', marketPriceSchema);
module.exports = MarketPrice;
