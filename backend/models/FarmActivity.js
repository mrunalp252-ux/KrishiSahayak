const mongoose = require('mongoose');

const farmActivitySchema = new mongoose.Schema(
  {
    farm: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Farm',
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: String,
    type: {
      type: String,
      enum: [
        'land_preparation',
        'seed_selection',
        'sowing',
        'irrigation',
        'fertilizing',
        'pest_monitoring',
        'disease_monitoring',
        'weeding',
        'pruning',
        'harvesting',
        'post_harvest',
        'other',
      ],
      required: true,
    },
    scheduledDate: {
      type: Date,
      required: true,
      index: true,
    },
    completedDate: Date,
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed', 'skipped', 'overdue'],
      default: 'pending',
    },
    crop: String,
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    notes: String,
    // Farm Diary fields
    fertilizerUsed: mongoose.Schema.Types.Mixed,
    sprayTreatment: mongoose.Schema.Types.Mixed,
    irrigationDetails: mongoose.Schema.Types.Mixed,
    // Expense tracking
    expenses: {
      seedCost: { type: Number, default: 0 },
      fertilizerCost: { type: Number, default: 0 },
      sprayCost: { type: Number, default: 0 },
      labourCost: { type: Number, default: 0 },
      otherCost: { type: Number, default: 0 },
      totalCost: { type: Number, default: 0 }
    },
    // Simple profit estimation
    income: {
      estimatedIncome: { type: Number, default: 0 },
      actualIncome: { type: Number, default: 0 }
    },
    reminderDate: Date
  },
  {
    timestamps: true,
  }
);

const FarmActivity = mongoose.model('FarmActivity', farmActivitySchema);
module.exports = FarmActivity;
