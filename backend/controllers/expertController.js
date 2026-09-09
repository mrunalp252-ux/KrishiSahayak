const logger = require('../utils/logger');
const AIConversation = require('../models/AIConversation');
const Advisory = require('../models/Advisory');
const CultivationGuide = require('../models/CultivationGuide');
const Notification = require('../models/Notification');
const notificationService = require('../services/notificationService');

exports.getStats = async (req, res) => {
  try {
    const [pendingQueries, totalQueries, answeredQueries] = await Promise.all([
      AIConversation.countDocuments({ 'metadata.expertReviewed': { $ne: true } }),
      AIConversation.countDocuments(),
      AIConversation.countDocuments({ 'metadata.expertReviewed': true })
    ]);

    return res.json({
      success: true,
      message: 'Expert stats',
      pendingQueries,
      totalQueries,
      answeredQueries,
      data: { pendingQueries, totalQueries, answeredQueries }
    });
  } catch (err) {
    logger.error('Expert stats error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.getQueries = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status === 'unreviewed' || req.query.status === 'pending') {
      filter['metadata.expertReviewed'] = { $ne: true };
    }

    const [conversations, total] = await Promise.all([
      AIConversation.find(filter)
        .populate('user', 'name email state district')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      AIConversation.countDocuments(filter)
    ]);

    const formatted = conversations.map(c => {
      const userMessages = (c.messages || []).filter(m => m.role === 'user');
      const lastUserMsg = userMessages.length ? userMessages[userMessages.length - 1] : null;
      return {
        _id: c._id,
        conversationId: c._id,
        farmerName: c.user ? c.user.name : 'Farmer',
        farmerEmail: c.user ? c.user.email : '',
        farmerLocation: c.user ? `${c.user.district || ''}, ${c.user.state || ''}` : '',
        question: lastUserMsg ? lastUserMsg.content : (c.title || 'Inquiry'),
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
        messages: c.messages,
        status: c.metadata && c.metadata.expertReviewed ? 'resolved' : 'pending'
      };
    });

    const totalPages = Math.ceil(total / limit) || 1;
    return res.json({
      success: true,
      message: 'Queries retrieved',
      data: formatted,
      items: formatted,
      queries: formatted,
      totalPages,
      pagination: { page, limit, total, totalPages }
    });
  } catch (err) {
    logger.error('Get queries error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.respondToQuery = async (req, res) => {
  try {
    const conversationId = req.params.id || req.body.conversationId;
    const responseText = req.body.answer || req.body.response;

    if (!conversationId || !responseText) {
      return res.status(400).json({ success: false, message: 'conversationId and response/answer are required' });
    }

    const conversation = await AIConversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    // Add expert response
    conversation.messages.push({
      role: 'assistant',
      content: `[Expert Response from ${req.user.name || 'Agricultural Expert'}]: ${responseText}`,
      timestamp: new Date()
    });

    if (!conversation.metadata) conversation.metadata = {};
    conversation.metadata.expertReviewed = true;
    conversation.metadata.expertId = req.user._id;
    conversation.markModified('metadata');
    await conversation.save();

    // Notify the farmer
    if (conversation.user) {
      await notificationService.create(conversation.user, {
        type: 'expert',
        title: 'Expert Response Received',
        message: `An agricultural expert has responded to your query.`,
        data: { conversationId: conversation._id },
        link: '/pages/ai-assistant.html'
      }).catch(err => logger.error('Notification error:', err));
    }

    return res.json({ success: true, message: 'Response sent to farmer', data: conversation });
  } catch (err) {
    logger.error('Respond to query error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.publishGuidance = async (req, res) => {
  try {
    const { type } = req.body;

    if (type === 'advisory') {
      const advisory = await Advisory.create({
        ...req.body,
        publishedBy: req.user._id,
        publishedDate: new Date()
      });
      return res.status(201).json({ success: true, message: 'Advisory published', data: advisory });
    }

    if (type === 'guide') {
      const guide = await CultivationGuide.create({
        ...req.body,
        author: req.user._id
      });
      return res.status(201).json({ success: true, message: 'Guide published', data: guide });
    }

    return res.status(400).json({ success: false, message: 'type must be "advisory" or "guide"' });
  } catch (err) {
    logger.error('Publish guidance error:', err);
    return res.status(400).json({ success: false, message: err.message });
  }
};
