const { success, error } = require('../utils/apiResponse');
const logger = require('../utils/logger');
const aiService = require('../services/aiService');
const imageAnalysisService = require('../services/imageAnalysisService');
const AIConversation = require('../models/AIConversation');

exports.chat = async (req, res) => {
  try {
    const { message, conversationId, language } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json(error('Message is required'));
    }

    if (message.trim().length > 2000) {
      return res.status(400).json(error('Message must not exceed 2000 characters'));
    }

    if (!aiService.isConfigured()) {
      return res.status(503).json(error('AI service is not configured. Please set AI_API_KEY in environment variables.'));
    }

    let conversation;
    if (conversationId) {
      conversation = await AIConversation.findOne({ _id: conversationId, user: req.user._id });
    }
    if (!conversation) {
      conversation = await AIConversation.create({ user: req.user._id, messages: [] });
    }

    conversation.messages.push({ role: 'user', content: message.trim() });
    
    const userLang = language || req.user?.preferredLanguage || 'en';
    const recentMessages = conversation.messages.slice(-10);
    const responseText = await aiService.chat(recentMessages, { language: userLang });
    
    conversation.messages.push({ role: 'assistant', content: responseText });
    await conversation.save();

    return res.json({
      success: true,
      message: 'Response',
      response: responseText,
      reply: responseText,
      conversationId: conversation._id,
      data: {
        response: responseText,
        reply: responseText,
        conversationId: conversation._id 
      }
    });
  } catch (err) {
    logger.error('AI chat controller error:', err.message);
    const isUnconfigured = err.message.includes('not configured');
    const isBusy = err.message.includes('busy');
    const status = isUnconfigured ? 503 : (isBusy ? 429 : 500);
    return res.status(status).json(error(err.message));
  }
};

exports.getConversations = async (req, res) => {
  try {
    const docs = await AIConversation.find({ user: req.user._id }).select('-messages').sort({ updatedAt: -1 });
    return res.json(success('Conversations', { data: docs }));
  } catch (err) {
    return res.status(500).json(error(err.message));
  }
};

exports.getConversation = async (req, res) => {
  try {
    const doc = await AIConversation.findOne({ _id: req.params.id, user: req.user._id });
    if (!doc) return res.status(404).json(error('Conversation not found'));
    return res.json(success('Conversation', { data: doc }));
  } catch (err) {
    return res.status(500).json(error(err.message));
  }
};

exports.analyzeImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json(error('No image file provided'));
    }
    if (!aiService.isConfigured()) {
      return res.status(503).json(error('AI service is not configured for image analysis. Please set AI_API_KEY in environment variables.'));
    }
    const analysis = await imageAnalysisService.analyze(req.file.path, req.file.mimetype);
    return res.json(success('Analysis completed', { 
      data: analysis,
      analysis,
      diagnosis: analysis.possibleIssue || 'Visual analysis completed'
    }));
  } catch (err) {
    logger.error('AI image analysis controller error:', err.message);
    const isUnconfigured = err.message.includes('not configured');
    const status = isUnconfigured ? 503 : 500;
    return res.status(status).json(error(err.message));
  }
};
