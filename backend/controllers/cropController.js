const { success, error, paginated } = require('../utils/apiResponse');
const logger = require('../utils/logger');
const Crop = require('../models/Crop');
const auditService = require('../services/auditService');

exports.getAll = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);
    const skip = (page - 1) * limit;
    const filter = {};

    if (req.query.search) {
      filter.$or = [
        { name: new RegExp(req.query.search, 'i') },
        { 'localNames.hi': new RegExp(req.query.search, 'i') },
        { 'localNames.mr': new RegExp(req.query.search, 'i') }
      ];
    }
    if (req.query.category) filter.category = req.query.category;
    if (req.query.season) filter.suitableSeasons = req.query.season;

    const [data, total] = await Promise.all([
      Crop.find(filter).skip(skip).limit(limit),
      Crop.countDocuments(filter)
    ]);

    return res.json({
      success: true,
      message: 'Crops retrieved',
      data,
      crops: data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    return res.status(500).json(error(err.message));
  }
};

exports.getOne = async (req, res) => {
  try {
    const doc = await Crop.findById(req.params.id);
    if (!doc) return res.status(404).json(error('Not found'));
    return res.json({ success: true, message: 'Crop fetched', data: doc, crop: doc });
  } catch (err) {
    return res.status(500).json(error(err.message));
  }
};

const normalizeCropData = (body) => {
  if (body.cropName && !body.name) body.name = body.cropName;
  if (typeof body.duration === 'number') {
    body.duration = { min: body.duration, max: body.duration };
  }
  if (body.waterRequirement === 'medium') body.waterRequirement = 'moderate';
  const categoryMap = {
    cereals: 'cereal',
    pulses: 'pulse',
    oilseeds: 'oilseed',
    vegetables: 'vegetable',
    fruits: 'fruit',
    spices: 'spice',
    commercial: 'cash_crop'
  };
  if (body.category && categoryMap[body.category]) {
    body.category = categoryMap[body.category];
  }
  return body;
};

exports.create = async (req, res) => {
  try {
    const payload = normalizeCropData({ ...req.body });
    const doc = await Crop.create(payload);
    if (req.user) await auditService.log({ user: req.user._id, action: 'CREATE', resource: 'Crop', resourceId: doc._id, ip: req.ip });
    return res.status(201).json({ success: true, message: 'Crop created', data: doc, crop: doc });
  } catch (err) {
    return res.status(400).json(error(err.message));
  }
};

exports.update = async (req, res) => {
  try {
    const payload = normalizeCropData({ ...req.body });
    const doc = await Crop.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });
    if (!doc) return res.status(404).json(error('Not found'));
    if (req.user) await auditService.log({ user: req.user._id, action: 'UPDATE', resource: 'Crop', resourceId: doc._id, ip: req.ip });
    return res.json({ success: true, message: 'Crop updated', data: doc, crop: doc });
  } catch (err) {
    return res.status(400).json(error(err.message));
  }
};

exports.delete = async (req, res) => {
  try {
    const doc = await Crop.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json(error('Not found'));
    if (req.user) await auditService.log({ user: req.user._id, action: 'DELETE', resource: 'Crop', resourceId: doc._id, ip: req.ip });
    return res.json({ success: true, message: 'Crop deleted' });
  } catch (err) {
    return res.status(500).json(error(err.message));
  }
};
