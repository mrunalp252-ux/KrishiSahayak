const mongoose = require('mongoose');

const advisorySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['weather', 'pest', 'disease', 'market', 'general', 'government', 'scheme'],
      default: 'general',
    },
    language: {
      type: String,
      default: 'en',
    },
    region: {
      state: String,
      district: String,
    },
    crop: String,
    severity: {
      type: String,
      enum: ['info', 'warning', 'critical', 'urgent'],
      default: 'info',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    publishedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    publishedDate: {
      type: Date,
      default: Date.now,
    },
    expiryDate: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

advisorySchema.virtual('targetState')
  .get(function() {
    return this.region ? this.region.state : '';
  })
  .set(function(v) {
    if (!this.region) this.region = {};
    this.region.state = v;
  });

advisorySchema.index({ isActive: 1, category: 1 });
advisorySchema.index({ expiryDate: 1 });

const Advisory = mongoose.model('Advisory', advisorySchema);
module.exports = Advisory;
