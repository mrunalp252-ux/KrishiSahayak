const { success, error, paginated } = require('../utils/apiResponse');
const logger = require('../utils/logger');
const Farm = require('../models/Farm');
const auditService = require('../services/auditService');
const { getPagination } = require('../utils/pagination');

const formatFarmObj = (farm) => {
  if (!farm) return null;
  const obj = farm.toObject ? farm.toObject() : { ...farm };
  obj.name = obj.farmName;
  obj.size = obj.landSize;
  obj.unit = obj.landUnit;
  return obj;
};

exports.getAll = async (req, res) => {
  try {
    const { skip, limit, sort, page } = getPagination(req.query);
    const query = { owner: req.user._id };
    
    const [farms, total] = await Promise.all([
      Farm.find(query).sort(sort).skip(skip).limit(limit),
      Farm.countDocuments(query)
    ]);
    
    const formattedFarms = farms.map(formatFarmObj);

    return res.json({
      success: true,
      message: 'Farms retrieved',
      data: farms,
      farms: formattedFarms,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    logger.error('Get farms error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const farm = await Farm.findOne({ _id: req.params.id, owner: req.user._id });
    if (!farm) {
      return res.status(404).json({ success: false, message: 'Farm not found' });
    }
    return res.json({ success: true, message: 'Farm retrieved', data: farm, farm: formatFarmObj(farm) });
  } catch (err) {
    logger.error('Get farm error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    if (req.body.name && !req.body.farmName) req.body.farmName = req.body.name;
    if (req.body.size !== undefined && req.body.landSize === undefined) req.body.landSize = req.body.size;
    if (req.body.unit && !req.body.landUnit) req.body.landUnit = req.body.unit;
    if (req.body.location) {
      if (typeof req.body.location === 'object') {
        if (req.body.location.state && !req.body.state) req.body.state = req.body.location.state;
        if (req.body.location.district && !req.body.district) req.body.district = req.body.location.district;
        if (req.body.location.village && !req.body.village) req.body.village = req.body.location.village;
      } else if (typeof req.body.location === 'string' && !req.body.state) {
        req.body.state = req.body.location;
      }
    }
    if (!req.body.district && req.body.state) req.body.district = req.body.state;
    if (!req.body.irrigationType) req.body.irrigationType = 'rainfed';

    const farmData = { ...req.body, owner: req.user._id };
    const farm = await Farm.create(farmData);
    
    await auditService.log({
      user: req.user._id,
      action: 'create',
      resource: 'Farm',
      resourceId: farm._id,
      details: `Created farm: ${farm.farmName}`,
      ip: req.ip
    });
    
    return res.status(201).json({ success: true, message: 'Farm created', data: farm, farm: formatFarmObj(farm) });
  } catch (err) {
    logger.error('Create farm error:', err);
    return res.status(400).json({ success: false, message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    delete req.body.owner;
    if (req.body.size !== undefined && req.body.landSize === undefined) req.body.landSize = req.body.size;
    if (req.body.name && !req.body.farmName) req.body.farmName = req.body.name;
    if (req.body.unit && !req.body.landUnit) req.body.landUnit = req.body.unit;
    if (req.body.location && typeof req.body.location === 'object') {
      if (req.body.location.state && !req.body.state) req.body.state = req.body.location.state;
      if (req.body.location.district && !req.body.district) req.body.district = req.body.location.district;
      if (req.body.location.village && !req.body.village) req.body.village = req.body.location.village;
    }
    
    const farm = await Farm.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!farm) {
      return res.status(404).json({ success: false, message: 'Farm not found' });
    }
    
    await auditService.log({
      user: req.user._id,
      action: 'update',
      resource: 'Farm',
      resourceId: farm._id,
      details: `Updated farm: ${farm.farmName}`,
      ip: req.ip
    });
    
    return res.json({ success: true, message: 'Farm updated', data: farm, farm: formatFarmObj(farm) });
  } catch (err) {
    logger.error('Update farm error:', err);
    return res.status(400).json({ success: false, message: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const farm = await Farm.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    if (!farm) {
      return res.status(404).json({ success: false, message: 'Farm not found' });
    }
    
    await auditService.log({
      user: req.user._id,
      action: 'delete',
      resource: 'Farm',
      resourceId: farm._id,
      details: `Deleted farm: ${farm.farmName}`,
      ip: req.ip
    });
    
    return res.json({ success: true, message: 'Farm deleted' });
  } catch (err) {
    logger.error('Delete farm error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
