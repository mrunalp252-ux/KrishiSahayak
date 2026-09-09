const logger = require('../utils/logger');
const Advisory = require('../models/Advisory');
const auditService = require('../services/auditService');

exports.getAll = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const skip = (page - 1) * limit;
    const filter = {};

    if (req.query.isActive !== undefined) {
      filter.isActive = req.query.isActive === 'true' || req.query.isActive === true;
    } else {
      filter.isActive = true;
    }

    if (req.query.search) {
      filter.$or = [
        { title: new RegExp(req.query.search, 'i') },
        { message: new RegExp(req.query.search, 'i') },
        { 'localContent.hi.title': new RegExp(req.query.search, 'i') },
        { 'localContent.mr.title': new RegExp(req.query.search, 'i') }
      ];
    }
    if (req.query.category) filter.category = req.query.category;
    if (req.query.severity) filter.severity = req.query.severity;
    if (req.query.region) filter.region = new RegExp(req.query.region, 'i');

    const [data, total] = await Promise.all([
      Advisory.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Advisory.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(total / limit) || 1;
    return res.json({
      success: true,
      message: 'Advisories retrieved',
      data,
      items: data,
      advisories: data,
      totalPages,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    });
  } catch (err) {
    logger.error('Get advisories error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const doc = await Advisory.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Not found' });
    const obj = doc.toObject();
    return res.json({ success: true, message: 'Advisory fetched', data: doc, advisory: doc, ...obj });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.targetState && !data.region) {
      data.region = { state: data.targetState };
    }
    if (!data.category) data.category = 'general';
    if (req.user) data.publishedBy = req.user._id;
    const doc = await Advisory.create(data);
    if (req.user) await auditService.log({ user: req.user._id, action: 'CREATE', resource: 'Advisory', resourceId: doc._id, ip: req.ip });
    return res.status(201).json({ success: true, message: 'Advisory created', data: doc, advisory: doc });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const doc = await Advisory.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!doc) return res.status(404).json({ success: false, message: 'Not found' });
    if (req.user) await auditService.log({ user: req.user._id, action: 'UPDATE', resource: 'Advisory', resourceId: doc._id, ip: req.ip });
    return res.json({ success: true, message: 'Advisory updated', data: doc, advisory: doc });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const doc = await Advisory.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Not found' });
    if (req.user) await auditService.log({ user: req.user._id, action: 'DELETE', resource: 'Advisory', resourceId: doc._id, ip: req.ip });
    return res.json({ success: true, message: 'Advisory deleted' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
