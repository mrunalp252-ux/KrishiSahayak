const logger = require('../utils/logger');
const Pest = require('../models/Pest');
const auditService = require('../services/auditService');

exports.getAll = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const skip = (page - 1) * limit;
    const filter = { isActive: true };

    const search = req.query.search || req.query.q;
    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { 'localNames.hi': new RegExp(search, 'i') },
        { 'localNames.mr': new RegExp(search, 'i') },
        { scientificName: new RegExp(search, 'i') }
      ];
    }
    if (req.query.crop) {
      filter.affectedCrops = new RegExp(req.query.crop, 'i');
    }
    if (req.query.severity) {
      filter.severity = req.query.severity;
    }

    const [data, total] = await Promise.all([
      Pest.find(filter).skip(skip).limit(limit),
      Pest.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(total / limit) || 1;
    return res.json({
      success: true,
      message: 'Pests retrieved',
      data,
      items: data,
      totalPages,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    });
  } catch (err) {
    logger.error('Get pests error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.search = async (req, res) => {
  try {
    const q = req.query.q || '';
    const docs = await Pest.find({
      isActive: true,
      $or: [
        { name: new RegExp(q, 'i') },
        { 'localNames.hi': new RegExp(q, 'i') },
        { 'localNames.mr': new RegExp(q, 'i') }
      ]
    });
    return res.json({ success: true, message: 'Found', data: docs, items: docs });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const doc = await Pest.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Not found' });
    const obj = doc.toObject();
    return res.json({ success: true, message: 'Pest fetched', data: doc, item: doc, ...obj });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const normalizePestData = (body) => {
  if (body.pestName && !body.name) body.name = body.pestName;
  if (body.cropsAffected && !body.affectedCrops) body.affectedCrops = body.cropsAffected;
  if (typeof body.symptoms === 'string') body.symptoms = [body.symptoms];
  if (body.severity === 'medium') body.severity = 'moderate';
  return body;
};

exports.create = async (req, res) => {
  try {
    const payload = normalizePestData({ ...req.body });
    const doc = await Pest.create(payload);
    if (req.user) await auditService.log({ user: req.user._id, action: 'CREATE', resource: 'Pest', resourceId: doc._id, ip: req.ip });
    return res.status(201).json({ success: true, message: 'Pest created', data: doc, item: doc, pest: doc });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const payload = normalizePestData({ ...req.body });
    const doc = await Pest.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });
    if (!doc) return res.status(404).json({ success: false, message: 'Not found' });
    if (req.user) await auditService.log({ user: req.user._id, action: 'UPDATE', resource: 'Pest', resourceId: doc._id, ip: req.ip });
    return res.json({ success: true, message: 'Pest updated', data: doc, item: doc, pest: doc });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const doc = await Pest.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Not found' });
    if (req.user) await auditService.log({ user: req.user._id, action: 'DELETE', resource: 'Pest', resourceId: doc._id, ip: req.ip });
    return res.json({ success: true, message: 'Pest deleted' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
