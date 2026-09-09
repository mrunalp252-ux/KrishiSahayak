const logger = require('../utils/logger');
const MarketPrice = require('../models/MarketPrice');
const auditService = require('../services/auditService');
const marketService = require('../services/marketService');

exports.getAll = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const skip = (page - 1) * limit;
    const filter = {};

    if (req.query.search) {
      filter.$or = [
        { crop: new RegExp(req.query.search, 'i') },
        { market: new RegExp(req.query.search, 'i') },
        { state: new RegExp(req.query.search, 'i') }
      ];
    }
    if (req.query.crop) filter.crop = new RegExp(req.query.crop, 'i');
    if (req.query.state) filter.state = new RegExp(req.query.state, 'i');
    if (req.query.market) filter.market = new RegExp(req.query.market, 'i');

    let sort = { date: -1, price: -1 };
    if (req.query.sort === 'price_asc') sort = { price: 1 };
    else if (req.query.sort === 'price_desc') sort = { price: -1 };
    else if (req.query.sort === 'date_desc') sort = { date: -1 };

    const [data, total] = await Promise.all([
      MarketPrice.find(filter).sort(sort).skip(skip).limit(limit),
      MarketPrice.countDocuments(filter)
    ]);

    // Compute basic analytics for current filter
    let analytics = null;
    const allFilteredPrices = await MarketPrice.find(filter).select('price');
    if (allFilteredPrices.length > 0) {
      let max = allFilteredPrices[0].price;
      let min = allFilteredPrices[0].price;
      let sum = 0;
      allFilteredPrices.forEach(p => {
        if (p.price > max) max = p.price;
        if (p.price < min) min = p.price;
        sum += p.price;
      });
      analytics = {
        highest: max,
        lowest: min,
        average: Math.round(sum / allFilteredPrices.length),
        trend: 'stable'
      };
    }

    const totalPages = Math.ceil(total / limit) || 1;

    return res.json({
      success: true,
      message: 'Market prices retrieved',
      data,
      prices: data,
      analytics,
      totalPages,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    });
  } catch (err) {
    logger.error('Get market prices error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAnalytics = async (req, res) => {
  try {
    const analytics = await marketService.getMarketAnalytics(req.query.crop, req.query.state);
    return res.json({ success: true, message: 'Analytics', data: analytics, analytics });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const doc = await MarketPrice.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Not found' });
    return res.json({ success: true, message: 'MarketPrice fetched', data: doc, price: doc });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const normalizeMarketData = (body) => {
  if (body.cropName && !body.crop) body.crop = body.cropName;
  if (body.marketName && !body.market) body.market = body.marketName;
  if (!body.date) body.date = new Date();
  if (!body.source) body.source = 'Mandi Agmarknet';
  return body;
};

exports.create = async (req, res) => {
  try {
    const payload = normalizeMarketData({ ...req.body });
    const doc = await MarketPrice.create(payload);
    if (req.user) await auditService.log({ user: req.user._id, action: 'CREATE', resource: 'MarketPrice', resourceId: doc._id, ip: req.ip });
    return res.status(201).json({ success: true, message: 'MarketPrice created', data: doc, price: doc });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const payload = normalizeMarketData({ ...req.body });
    const doc = await MarketPrice.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });
    if (!doc) return res.status(404).json({ success: false, message: 'Not found' });
    if (req.user) await auditService.log({ user: req.user._id, action: 'UPDATE', resource: 'MarketPrice', resourceId: doc._id, ip: req.ip });
    return res.json({ success: true, message: 'MarketPrice updated', data: doc, price: doc });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const doc = await MarketPrice.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Not found' });
    if (req.user) await auditService.log({ user: req.user._id, action: 'DELETE', resource: 'MarketPrice', resourceId: doc._id, ip: req.ip });
    return res.json({ success: true, message: 'MarketPrice deleted' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
