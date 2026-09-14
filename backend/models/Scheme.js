const mongoose = require('mongoose');

const schemeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    shortCode: {
      type: String,
      trim: true,
      index: true
    },
    titleHi: {
      type: String,
      trim: true
    },
    titleMr: {
      type: String,
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    descriptionHi: String,
    descriptionMr: String,
    category: {
      type: String,
      enum: ['financial_support', 'crop_insurance', 'credit', 'irrigation', 'soil_health', 'subsidy', 'general'],
      default: 'financial_support'
    },
    level: {
      type: String,
      enum: ['central', 'state'],
      default: 'central'
    },
    state: {
      type: String,
      default: 'All India'
    },
    benefits: {
      type: String,
      required: true
    },
    benefitsHi: String,
    benefitsMr: String,
    eligibility: [{
      type: String
    }],
    eligibilityHi: [{
      type: String
    }],
    eligibilityMr: [{
      type: String
    }],
    documents: [{
      type: String
    }],
    documentsHi: [{
      type: String
    }],
    documentsMr: [{
      type: String
    }],
    applicationInstructions: String,
    applicationInstructionsHi: String,
    applicationInstructionsMr: String,
    applicationUrl: String,
    helpline: String,
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

schemeSchema.index({ category: 1, level: 1, state: 1 });

module.exports = mongoose.model('Scheme', schemeSchema);
