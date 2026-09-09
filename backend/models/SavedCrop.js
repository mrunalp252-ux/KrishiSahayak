const mongoose = require('mongoose');

const savedCropSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    crop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Crop',
      required: true,
    },
    notes: String,
    savedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

savedCropSchema.index({ user: 1, crop: 1 }, { unique: true });

const SavedCrop = mongoose.model('SavedCrop', savedCropSchema);
module.exports = SavedCrop;
