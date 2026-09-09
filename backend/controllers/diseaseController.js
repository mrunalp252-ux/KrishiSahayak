const logger = require('../utils/logger');
const Disease = require('../models/Disease');
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
      Disease.find(filter).skip(skip).limit(limit),
      Disease.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(total / limit) || 1;
    return res.json({
      success: true,
      message: 'Diseases retrieved',
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
    logger.error('Get diseases error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const doc = await Disease.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Not found' });
    const obj = doc.toObject();
    return res.json({ success: true, message: 'Disease fetched', data: doc, item: doc, ...obj });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const normalizeDiseaseData = (body) => {
  if (body.diseaseName && !body.name) body.name = body.diseaseName;
  if (body.cropsAffected && !body.affectedCrops) body.affectedCrops = body.cropsAffected;
  if (typeof body.symptoms === 'string') body.symptoms = [body.symptoms];
  if (body.severity === 'medium') body.severity = 'moderate';
  return body;
};

exports.create = async (req, res) => {
  try {
    const payload = normalizeDiseaseData({ ...req.body });
    const doc = await Disease.create(payload);
    if (req.user) await auditService.log({ user: req.user._id, action: 'CREATE', resource: 'Disease', resourceId: doc._id, ip: req.ip });
    return res.status(201).json({ success: true, message: 'Disease created', data: doc, item: doc, disease: doc });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const payload = normalizeDiseaseData({ ...req.body });
    const doc = await Disease.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });
    if (!doc) return res.status(404).json({ success: false, message: 'Not found' });
    if (req.user) await auditService.log({ user: req.user._id, action: 'UPDATE', resource: 'Disease', resourceId: doc._id, ip: req.ip });
    return res.json({ success: true, message: 'Disease updated', data: doc, item: doc, disease: doc });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const doc = await Disease.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Not found' });
    if (req.user) await auditService.log({ user: req.user._id, action: 'DELETE', resource: 'Disease', resourceId: doc._id, ip: req.ip });
    return res.json({ success: true, message: 'Disease deleted' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.search = async (req, res) => {
  try {
    const { q, crop, severity } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const filter = { isActive: true };

    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { 'localNames.hi': { $regex: q, $options: 'i' } },
        { 'localNames.mr': { $regex: q, $options: 'i' } },
        { symptoms: { $regex: q, $options: 'i' } }
      ];
    }
    if (crop) filter.affectedCrops = { $regex: crop, $options: 'i' };
    if (severity) filter.severity = severity;

    const [data, total] = await Promise.all([
      Disease.find(filter).skip(skip).limit(limit).lean(),
      Disease.countDocuments(filter)
    ]);
    const totalPages = Math.ceil(total / limit) || 1;
    return res.json({ success: true, message: 'Search results', data, items: data, totalPages, pagination: { page, limit, total, totalPages } });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
