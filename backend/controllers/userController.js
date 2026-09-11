const logger = require('../utils/logger');
const User = require('../models/User');
const auditService = require('../services/auditService');

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password -refreshTokens');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    return res.json({ success: true, message: 'Profile retrieved', data: user, user });
  } catch (err) {
    logger.error('Get profile error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    // Only allow specific fields to be updated
    const allowedFields = ['name', 'mobile', 'phone', 'state', 'district', 'village', 'language', 'preferredLanguage'];
    const updates = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });
    if (!updates.mobile && updates.phone) {
      updates.mobile = updates.phone;
    }
    delete updates.phone;
    if (updates.preferredLanguage && !updates.language) {
      updates.language = updates.preferredLanguage;
    }
    delete updates.preferredLanguage;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    ).select('-password -refreshTokens');

    await auditService.log({
      user: req.user._id,
      userName: req.user.name,
      action: 'update',
      resource: 'User',
      resourceId: req.user._id,
      details: 'Profile updated',
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    return res.json({ success: true, message: 'Profile updated', data: user, user });
  } catch (err) {
    logger.error('Update profile error:', err);
    return res.status(400).json({ success: false, message: err.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isMatch = await user.comparePassword(req.body.currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = req.body.newPassword;
    await user.save();

    await auditService.log({
      user: req.user._id,
      userName: req.user.name,
      action: 'password_change',
      resource: 'User',
      resourceId: req.user._id,
      details: 'Password changed',
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    return res.json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    logger.error('Change password error:', err);
    return res.status(400).json({ success: false, message: err.message });
  }
};

exports.uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file provided' });
    }

    const imageUrl = '/uploads/' + req.file.filename;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { profileImage: imageUrl },
      { new: true }
    ).select('-password -refreshTokens');

    return res.json({ 
      success: true, 
      message: 'Profile image uploaded', 
      data: { url: imageUrl, user } 
    });
  } catch (err) {
    logger.error('Upload profile image error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};
