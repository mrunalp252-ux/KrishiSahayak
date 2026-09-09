const logger = require('../utils/logger');
const FertilizerGuide = require('../models/FertilizerGuide');
const auditService = require('../services/auditService');

exports.getAll = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const skip = (page - 1) * limit;
    const filter = { isActive: true };

    if (req.query.search) {
      filter.$or = [
        { crop: new RegExp(req.query.search, 'i') },
        { fertilizerType: new RegExp(req.query.search, 'i') },
        { guidance: new RegExp(req.query.search, 'i') }
      ];
    }
    if (req.query.crop) filter.crop = new RegExp(req.query.crop, 'i');
    if (req.query.soil) filter.soilType = new RegExp(req.query.soil, 'i');
    if (req.query.stage) filter.growthStage = new RegExp(req.query.stage, 'i');

    const [data, total] = await Promise.all([
      FertilizerGuide.find(filter).skip(skip).limit(limit),
      FertilizerGuide.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(total / limit) || 1;
    return res.json({
      success: true,
      message: 'Fertilizer guides retrieved',
      data,
      items: data,
      guides: data,
      totalPages,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    });
  } catch (err) {
    logger.error('Get fertilizers error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.getForCrop = async (req, res) => {
  try {
    const docs = await FertilizerGuide.find({
      crop: new RegExp(req.params.crop, 'i'),
      isActive: true
    });
    return res.json({ success: true, message: 'Guides', data: docs, guides: docs, items: docs });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const doc = await FertilizerGuide.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Not found' });
    const obj = doc.toObject();
    return res.json({ success: true, message: 'FertilizerGuide fetched', data: doc, guide: doc, ...obj });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const doc = await FertilizerGuide.create(req.body);
    if (req.user) await auditService.log({ user: req.user._id, action: 'CREATE', resource: 'FertilizerGuide', resourceId: doc._id, ip: req.ip });
    return res.status(201).json({ success: true, message: 'FertilizerGuide created', data: doc, guide: doc });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const doc = await FertilizerGuide.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!doc) return res.status(404).json({ success: false, message: 'Not found' });
    if (req.user) await auditService.log({ user: req.user._id, action: 'UPDATE', resource: 'FertilizerGuide', resourceId: doc._id, ip: req.ip });
    return res.json({ success: true, message: 'FertilizerGuide updated', data: doc, guide: doc });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const doc = await FertilizerGuide.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Not found' });
    if (req.user) await auditService.log({ user: req.user._id, action: 'DELETE', resource: 'FertilizerGuide', resourceId: doc._id, ip: req.ip });
    return res.json({ success: true, message: 'FertilizerGuide deleted' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
