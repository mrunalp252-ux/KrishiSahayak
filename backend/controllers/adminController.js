const logger = require('../utils/logger');
const User = require('../models/User');
const Farm = require('../models/Farm');
const Crop = require('../models/Crop');
const MarketPrice = require('../models/MarketPrice');
const Advisory = require('../models/Advisory');
const Pest = require('../models/Pest');
const Disease = require('../models/Disease');
const FertilizerGuide = require('../models/FertilizerGuide');
const CultivationGuide = require('../models/CultivationGuide');
const auditService = require('../services/auditService');
const mongoose = require('mongoose');

exports.getDashboard = async (req, res) => {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalFarmers, totalExperts, totalAdmins,
      totalFarms, totalCrops, totalMarketRecords,
      totalAdvisories, totalPests, totalDiseases,
      activeUsers
    ] = await Promise.all([
      User.countDocuments({ role: 'farmer' }),
      User.countDocuments({ role: 'expert' }),
      User.countDocuments({ role: 'admin' }),
      Farm.countDocuments(),
      Crop.countDocuments({ isActive: true }),
      MarketPrice.countDocuments(),
      Advisory.countDocuments({ isActive: true }),
      Pest.countDocuments({ isActive: true }),
      Disease.countDocuments({ isActive: true }),
      User.countDocuments({ updatedAt: { $gte: sevenDaysAgo } })
    ]);

    return res.json({
      success: true,
      message: 'Dashboard data',
      data: {
        totalFarmers,
        totalExperts,
        totalAdmins,
        totalFarms,
        totalCrops,
        totalMarketRecords,
        totalAdvisories,
        totalPests,
        totalDiseases,
        activeUsers,
        systemStatus: {
          database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
          uptime: process.uptime()
        }
      }
    });
  } catch (err) {
    logger.error('Dashboard error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const skip = (page - 1) * limit;
    const filter = {};

    if (req.query.role) filter.role = req.query.role;
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';

    const [users, total] = await Promise.all([
      User.find(filter).select('-password -refreshTokens').sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(filter)
    ]);

    return res.json({
      success: true,
      message: 'Users retrieved',
      data: users,
      users: users,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
  } catch (err) {
    logger.error('Get users error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    // Admin can only update role and isActive status
    const allowedUpdates = {};
    if (req.body.role) allowedUpdates.role = req.body.role;
    if (req.body.isActive !== undefined) allowedUpdates.isActive = req.body.isActive;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      allowedUpdates,
      { new: true, runValidators: true }
    ).select('-password -refreshTokens');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await auditService.log({
      user: req.user._id,
      action: 'update',
      resource: 'User',
      resourceId: req.params.id,
      details: `Admin updated user: ${JSON.stringify(allowedUpdates)}`,
      ip: req.ip
    });

    return res.json({ success: true, message: 'User updated', data: user });
  } catch (err) {
    logger.error('Update user error:', err);
    return res.status(400).json({ success: false, message: err.message });
  }
};

exports.getAuditLogs = async (req, res) => {
  try {
    const result = await auditService.getAuditLogs(req.query);
    return res.json({
      success: true,
      message: 'Audit logs retrieved',
      data: result.data,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages
      }
    });
  } catch (err) {
    logger.error('Audit logs error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
