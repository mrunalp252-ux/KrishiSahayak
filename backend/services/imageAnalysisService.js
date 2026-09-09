const aiService = require('./aiService');
const logger = require('../utils/logger');

class ImageAnalysisService {
  async analyze(filePath, mimeType) {
    try {
      this.validateImageType(mimeType);
      return await aiService.analyzeImage(filePath, mimeType);
    } catch (err) {
      logger.error('Image analysis error:', err.message);
      throw err;
    }
  }

  validateImageType(mimeType) {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(mimeType)) {
      throw new Error('Invalid file type. Only JPEG, PNG, and WebP images are supported.');
    }
    return true;
  }

  validateImage(file) {
    this.validateImageType(file.mimetype);
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('File too large. Maximum size is 5MB.');
    }
    return true;
  }
}

module.exports = new ImageAnalysisService();
