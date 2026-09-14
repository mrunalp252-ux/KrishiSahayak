const logger = require('../utils/logger');
const FarmActivity = require('../models/FarmActivity');
const Farm = require('../models/Farm');
const Crop = require('../models/Crop');
const auditService = require('../services/auditService');

exports.getAll = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const skip = (page - 1) * limit;
    const filter = { user: req.user._id };

    if (req.query.farm) filter.farm = req.query.farm;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.type) filter.type = req.query.type;

    const sort = req.query.sort || 'scheduledDate';

    const [data, total] = await Promise.all([
      FarmActivity.find(filter).populate('farm', 'farmName').sort(sort).skip(skip).limit(limit),
      FarmActivity.countDocuments(filter)
    ]);

    return res.json({
      success: true,
      message: 'Activities retrieved',
      data,
      activities: data,
      items: data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
  } catch (err) {
    logger.error('Get activities error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const doc = await FarmActivity.findOne({ _id: req.params.id, user: req.user._id }).populate('farm', 'farmName');
    if (!doc) return res.status(404).json({ success: false, message: 'Activity not found' });
    return res.json({ success: true, message: 'Activity retrieved', data: doc });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const activityData = { ...req.body, user: req.user._id };
    if (activityData.farmId && !activityData.farm) activityData.farm = activityData.farmId;
    if (activityData.expenses) {
      const e = activityData.expenses;
      if (!e.totalCost) {
        e.totalCost = (Number(e.seedCost) || 0) + (Number(e.fertilizerCost) || 0) + (Number(e.sprayCost) || 0) + (Number(e.labourCost) || 0) + (Number(e.otherCost) || 0);
      }
    }
    const doc = await FarmActivity.create(activityData);
    return res.status(201).json({ success: true, message: 'Activity created', data: doc, activity: doc });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    delete req.body.user;
    if (req.body.expenses) {
      const e = req.body.expenses;
      if (!e.totalCost) {
        e.totalCost = (Number(e.seedCost) || 0) + (Number(e.fertilizerCost) || 0) + (Number(e.sprayCost) || 0) + (Number(e.labourCost) || 0) + (Number(e.otherCost) || 0);
      }
    }
    const doc = await FarmActivity.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!doc) return res.status(404).json({ success: false, message: 'Activity not found' });
    return res.json({ success: true, message: 'Activity updated', data: doc });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

exports.getUpcomingReminders = async (req, res) => {
  try {
    const daysAhead = parseInt(req.query.days) || 14;
    const now = new Date();
    const futureDate = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);

    const filter = {
      user: req.user._id,
      status: { $in: ['pending', 'in_progress', 'scheduled'] },
      scheduledDate: {
        $gte: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        $lte: futureDate
      }
    };

    const activities = await FarmActivity.find(filter)
      .populate('farm', 'farmName location currentCrop')
      .sort({ scheduledDate: 1 })
      .limit(10);

    const reminders = activities.map(act => {
      const scheduled = new Date(act.scheduledDate);
      const diffDays = Math.ceil((scheduled.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      let urgency = 'normal';
      if (diffDays <= 0) urgency = 'overdue';
      else if (diffDays <= 2) urgency = 'urgent';
      else if (diffDays <= 5) urgency = 'upcoming';

      return {
        _id: act._id,
        title: act.title,
        type: act.type,
        crop: act.crop || (act.farm && act.farm.currentCrop) || '',
        farmName: act.farm ? act.farm.farmName : 'Farm',
        scheduledDate: act.scheduledDate,
        diffDays,
        urgency,
        priority: act.priority || 'medium',
        description: act.description
      };
    });

    return res.json({
      success: true,
      message: 'Upcoming reminders retrieved',
      count: reminders.length,
      data: reminders,
      reminders
    });
  } catch (err) {
    logger.error('Get upcoming reminders error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.getExpenseSummary = async (req, res) => {
  try {
    const filter = { user: req.user._id };
    if (req.query.farm) filter.farm = req.query.farm;
    if (req.query.crop) filter.crop = req.query.crop;

    const activities = await FarmActivity.find(filter).lean();

    let totalSeedCost = 0;
    let totalFertilizerCost = 0;
    let totalSprayCost = 0;
    let totalLabourCost = 0;
    let totalOtherCost = 0;
    let grandTotalCost = 0;
    let totalEstimatedIncome = 0;
    let totalActualIncome = 0;

    const byCrop = {};
    const byCategory = {
      seed: 0,
      fertilizer: 0,
      spray: 0,
      labour: 0,
      other: 0
    };

    activities.forEach(act => {
      const exp = act.expenses || {};
      const seed = Number(exp.seedCost || 0);
      const fert = Number(exp.fertilizerCost || 0);
      const spray = Number(exp.sprayCost || 0);
      const labour = Number(exp.labourCost || 0);
      const other = Number(exp.otherCost || 0);
      const total = Number(exp.totalCost || (seed + fert + spray + labour + other));

      totalSeedCost += seed;
      totalFertilizerCost += fert;
      totalSprayCost += spray;
      totalLabourCost += labour;
      totalOtherCost += other;
      grandTotalCost += total;

      byCategory.seed += seed;
      byCategory.fertilizer += fert;
      byCategory.spray += spray;
      byCategory.labour += labour;
      byCategory.other += other;

      const crop = act.crop || 'General';
      if (!byCrop[crop]) {
        byCrop[crop] = { totalCost: 0, count: 0 };
      }
      byCrop[crop].totalCost += total;
      byCrop[crop].count += 1;

      if (act.income) {
        totalEstimatedIncome += Number(act.income.estimatedIncome || 0);
        totalActualIncome += Number(act.income.actualIncome || 0);
      }
    });

    const netProfit = totalActualIncome - grandTotalCost;

    return res.json({
      success: true,
      message: 'Expense summary retrieved',
      data: {
        totalSeedCost,
        totalFertilizerCost,
        totalSprayCost,
        totalLabourCost,
        totalOtherCost,
        grandTotalCost,
        totalEstimatedIncome,
        totalActualIncome,
        netProfit,
        byCategory,
        byCrop,
        activityCount: activities.length
      }
    });
  } catch (err) {
    logger.error('Get expense summary error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.complete = async (req, res) => {
  try {
    const doc = await FarmActivity.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { status: 'completed', completedDate: new Date() },
      { new: true }
    );
    if (!doc) return res.status(404).json({ success: false, message: 'Activity not found' });
    return res.json({ success: true, message: 'Activity completed', data: doc });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const doc = await FarmActivity.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!doc) return res.status(404).json({ success: false, message: 'Activity not found' });
    return res.json({ success: true, message: 'Activity deleted' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.generatePlan = async (req, res) => {
  try {
    const farmId = req.body.farmId || req.params.farmId;
    if (!farmId) {
      return res.status(400).json({ success: false, message: 'farmId is required' });
    }

    const farm = await Farm.findOne({ _id: farmId, owner: req.user._id });
    if (!farm) {
      return res.status(404).json({ success: false, message: 'Farm not found' });
    }

    const sowingDate = farm.sowingDate ? new Date(farm.sowingDate) : new Date();
    const cropName = farm.currentCrop || 'General';

    // Look up crop for duration info
    let cropDuration = 120;
    if (farm.currentCrop) {
      const crop = await Crop.findOne({ name: { $regex: new RegExp('^' + farm.currentCrop + '$', 'i') } });
      if (crop && crop.duration) {
        cropDuration = crop.duration.max || crop.duration.min || 120;
      }
    }

    // Generate standard activities based on crop lifecycle
    const activities = [
      {
        title: 'Land Preparation',
        description: `Prepare land for ${cropName} cultivation. Plough, level, and add organic matter.`,
        type: 'land_preparation',
        scheduledDate: new Date(sowingDate.getTime() - 14 * 24 * 60 * 60 * 1000),
        priority: 'high'
      },
      {
        title: 'Seed Selection & Treatment',
        description: `Select quality seeds for ${cropName}. Treat seeds before sowing.`,
        type: 'seed_selection',
        scheduledDate: new Date(sowingDate.getTime() - 7 * 24 * 60 * 60 * 1000),
        priority: 'high'
      },
      {
        title: 'Sowing',
        description: `Sow ${cropName} seeds at recommended spacing and depth.`,
        type: 'sowing',
        scheduledDate: sowingDate,
        priority: 'high'
      },
      {
        title: 'First Irrigation',
        description: 'Provide first irrigation after sowing to ensure germination.',
        type: 'irrigation',
        scheduledDate: new Date(sowingDate.getTime() + 3 * 24 * 60 * 60 * 1000),
        priority: 'high'
      },
      {
        title: 'Basal Fertilizer Application',
        description: 'Apply basal dose of fertilizers as per soil test recommendations.',
        type: 'fertilizing',
        scheduledDate: new Date(sowingDate.getTime() + 7 * 24 * 60 * 60 * 1000),
        priority: 'medium'
      },
      {
        title: 'First Weeding',
        description: 'Remove weeds to reduce competition for nutrients and water.',
        type: 'weeding',
        scheduledDate: new Date(sowingDate.getTime() + 21 * 24 * 60 * 60 * 1000),
        priority: 'medium'
      },
      {
        title: 'Pest Monitoring',
        description: 'Inspect crop for early signs of pest infestation.',
        type: 'pest_monitoring',
        scheduledDate: new Date(sowingDate.getTime() + 30 * 24 * 60 * 60 * 1000),
        priority: 'medium'
      },
      {
        title: 'Top Dressing Fertilizer',
        description: 'Apply top dressing fertilizer at vegetative growth stage.',
        type: 'fertilizing',
        scheduledDate: new Date(sowingDate.getTime() + Math.floor(cropDuration * 0.3) * 24 * 60 * 60 * 1000),
        priority: 'medium'
      },
      {
        title: 'Disease Monitoring',
        description: 'Check for disease symptoms and take preventive measures.',
        type: 'disease_monitoring',
        scheduledDate: new Date(sowingDate.getTime() + Math.floor(cropDuration * 0.5) * 24 * 60 * 60 * 1000),
        priority: 'medium'
      },
      {
        title: 'Pre-Harvest Assessment',
        description: `Assess ${cropName} crop maturity and plan harvest timing.`,
        type: 'harvesting',
        scheduledDate: new Date(sowingDate.getTime() + Math.floor(cropDuration * 0.85) * 24 * 60 * 60 * 1000),
        priority: 'high'
      },
      {
        title: 'Harvesting',
        description: `Harvest ${cropName} at optimal maturity.`,
        type: 'harvesting',
        scheduledDate: new Date(sowingDate.getTime() + cropDuration * 24 * 60 * 60 * 1000),
        priority: 'high'
      },
      {
        title: 'Post-Harvest Processing',
        description: 'Cleaning, drying, grading, and safe storage of harvested produce.',
        type: 'post_harvest',
        scheduledDate: new Date(sowingDate.getTime() + (cropDuration + 7) * 24 * 60 * 60 * 1000),
        priority: 'medium'
      }
    ];

    // Create all activities
    const createdActivities = await FarmActivity.insertMany(
      activities.map(a => ({
        ...a,
        farm: farmId,
        user: req.user._id,
        crop: cropName,
        status: 'pending'
      }))
    );

    return res.status(201).json({
      success: true,
      message: `Generated ${createdActivities.length} activities for ${cropName}`,
      data: createdActivities
    });
  } catch (err) {
    logger.error('Generate plan error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
