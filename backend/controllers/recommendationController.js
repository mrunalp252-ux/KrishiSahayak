const logger = require('../utils/logger');
const recommendationService = require('../services/recommendationService');
const CropRecommendation = require('../models/CropRecommendation');

exports.getRecommendation = async (req, res) => {
  try {
    const recs = await recommendationService.getRecommendations(req.body);
    let saved = null;
    if (req.user) {
      saved = await CropRecommendation.create({
        user: req.user._id,
        inputs: req.body,
        recommendations: recs
      }).catch(err => {
        logger.error('Failed to save recommendation history:', err);
      });
    }

    return res.json({
      success: true,
      message: 'Recommendations generated',
      data: saved || { recommendations: recs },
      recommendations: recs
    });
  } catch (err) {
    logger.error('Recommendation error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const docs = await CropRecommendation.find({ user: req.user._id }).sort({ createdAt: -1 });
    return res.json({ success: true, message: 'History retrieved', data: docs });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
