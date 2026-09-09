const mongoose = require('mongoose');
const logger = require('../utils/logger');
const CultivationGuide = require('../models/CultivationGuide');
const Crop = require('../models/Crop');
const auditService = require('../services/auditService');

const formatGuideObj = (doc) => {
  if (!doc) return null;
  const obj = doc.toObject ? doc.toObject() : { ...doc };
  obj.crop = obj.cropName;
  if (Array.isArray(obj.sections)) {
    obj.sections.forEach(sec => {
      if (sec.title && sec.content) {
        // e.g. "Land Preparation" -> "landPreparation"
        const key = sec.title.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase());
        obj[key] = sec.content;
      }
    });
  }
  return obj;
};

exports.getAll = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const skip = (page - 1) * limit;
    const filter = { isActive: true };

    if (req.query.search) {
      filter.$or = [
        { cropName: new RegExp(req.query.search, 'i') },
        { 'sections.content': new RegExp(req.query.search, 'i') }
      ];
    }
    if (req.query.crop) filter.cropName = new RegExp(req.query.crop, 'i');
    if (req.query.language) filter.language = req.query.language;

    const [data, total] = await Promise.all([
      CultivationGuide.find(filter).skip(skip).limit(limit),
      CultivationGuide.countDocuments(filter)
    ]);

    const formattedList = data.map(formatGuideObj);
    const totalPages = Math.ceil(total / limit) || 1;

    return res.json({
      success: true,
      message: 'Cultivation guides retrieved',
      data: formattedList,
      items: formattedList,
      guides: formattedList,
      totalPages,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    });
  } catch (err) {
    logger.error('Get guides error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.getByCrop = async (req, res) => {
  try {
    const identifier = req.params.cropId;
    let query = { isActive: true };

    if (mongoose.Types.ObjectId.isValid(identifier)) {
      query.$or = [{ crop: identifier }, { cropName: new RegExp('^' + identifier + '$', 'i') }];
    } else {
      query.cropName = new RegExp('^' + identifier + '$', 'i');
    }

    const docs = await CultivationGuide.find(query);
    const formatted = docs.map(formatGuideObj);

    return res.json({
      success: true,
      message: 'Guides retrieved',
      data: formatted.length === 1 ? formatted[0] : formatted,
      guides: formatted,
      items: formatted,
      guide: formatted[0] || null,
      ...(formatted[0] || {})
    });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const identifier = req.params.id;
    let doc = null;

    if (mongoose.Types.ObjectId.isValid(identifier)) {
      doc = await CultivationGuide.findById(identifier);
    }
    if (!doc) {
      doc = await CultivationGuide.findOne({ cropName: new RegExp('^' + identifier + '$', 'i') });
    }

    if (!doc) return res.status(404).json({ success: false, message: 'Cultivation guide not found' });

    const formatted = formatGuideObj(doc);
    return res.json({
      success: true,
      message: 'Cultivation guide fetched',
      data: formatted,
      guide: formatted,
      item: formatted,
      ...formatted
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const doc = await CultivationGuide.create(req.body);
    if (req.user) await auditService.log({ user: req.user._id, action: 'CREATE', resource: 'CultivationGuide', resourceId: doc._id, ip: req.ip });
    const formatted = formatGuideObj(doc);
    return res.status(201).json({ success: true, message: 'Cultivation guide created', data: formatted, guide: formatted });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const doc = await CultivationGuide.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!doc) return res.status(404).json({ success: false, message: 'Not found' });
    if (req.user) await auditService.log({ user: req.user._id, action: 'UPDATE', resource: 'CultivationGuide', resourceId: doc._id, ip: req.ip });
    const formatted = formatGuideObj(doc);
    return res.json({ success: true, message: 'Cultivation guide updated', data: formatted, guide: formatted });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const doc = await CultivationGuide.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Not found' });
    if (req.user) await auditService.log({ user: req.user._id, action: 'DELETE', resource: 'CultivationGuide', resourceId: doc._id, ip: req.ip });
    return res.json({ success: true, message: 'Cultivation guide deleted' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
