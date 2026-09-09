const logger = require('../utils/logger');
const authService = require('../services/authService');
const auditService = require('../services/auditService');
const emailService = require('../services/emailService');

exports.register = async (req, res) => {
  try {
    const payload = { ...req.body };
    if (!payload.mobile || typeof payload.mobile !== 'string' || payload.mobile.trim() === '') {
      delete payload.mobile;
    } else {
      payload.mobile = payload.mobile.trim();
    }
    if (payload.preferredLanguage && !payload.language) {
      payload.language = payload.preferredLanguage;
    }
    delete payload.confirmPassword;
    delete payload.confirm_password;

    const user = await authService.register(payload);
    const accessToken = authService.generateAccessToken(user);
    const refreshToken = authService.generateRefreshToken(user);

    // Store refresh token
    const User = require('../models/User');
    const dbUser = await User.findById(user._id);
    dbUser.addRefreshToken(refreshToken, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
    await dbUser.save();

    await auditService.log({
      user: user._id,
      userName: user.name,
      action: 'login',
      resource: 'User',
      details: 'New user registered',
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    emailService.sendWelcome(user.email, user.name).catch(err => {
      logger.error('Failed to send welcome email:', err);
    });

    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      token: accessToken,
      accessToken,
      refreshToken,
      user,
      data: { user, accessToken, refreshToken }
    });
  } catch (err) {
    logger.error('Registration error:', err);
    const statusCode = err.statusCode || 400;
    return res.status(statusCode).json({ success: false, message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);

    await auditService.log({
      user: result.user._id,
      userName: result.user.name,
      action: 'login',
      resource: 'Auth',
      details: 'User logged in',
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    return res.json({
      success: true,
      message: 'Login successful',
      token: result.accessToken,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: result.user,
      data: result
    });
  } catch (err) {
    // Log failed login attempt
    await auditService.log({
      action: 'login_failed',
      resource: 'Auth',
      details: `Failed login attempt for: ${req.body.email}`,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    }).catch(() => {});

    const statusCode = err.statusCode || 401;
    return res.status(statusCode).json({ success: false, message: err.message });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const token = req.body.token || req.body.refreshToken;
    if (!token) {
      return res.status(400).json({ success: false, message: 'Refresh token is required' });
    }
    const result = await authService.refreshToken(token);
    return res.json({
      success: true,
      message: 'Token refreshed',
      data: result
    });
  } catch (err) {
    const statusCode = err.statusCode || 401;
    return res.status(statusCode).json({ success: false, message: err.message });
  }
};

exports.logout = async (req, res) => {
  try {
    if (req.user) {
      await authService.logout(req.user._id, req.body.refreshToken).catch(() => {});

      await auditService.log({
        user: req.user._id,
        userName: req.user.name,
        action: 'logout',
        resource: 'Auth',
        details: 'User logged out',
        ip: req.ip,
        userAgent: req.get('User-Agent')
      }).catch(() => {});
    }

    return res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    logger.error('Logout error:', err);
    return res.json({ success: true, message: 'Logged out successfully' });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const token = await authService.forgotPassword(req.body.email);
    if (token) {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      emailService.sendPasswordReset(req.body.email, token, frontendUrl).catch(err => {
        logger.error('Failed to send reset email:', err);
      });
    }
    // Always return same message to prevent email enumeration
    return res.json({
      success: true,
      message: 'If that email is registered, a password reset link has been sent.'
    });
  } catch (err) {
    logger.error('Forgot password error:', err);
    return res.json({
      success: true,
      message: 'If that email is registered, a password reset link has been sent.'
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    await authService.resetPassword(req.body.token, req.body.password);

    await auditService.log({
      action: 'password_reset',
      resource: 'Auth',
      details: 'Password reset completed',
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    return res.json({ success: true, message: 'Password reset successful' });
  } catch (err) {
    const statusCode = err.statusCode || 400;
    return res.status(statusCode).json({ success: false, message: err.message });
  }
};
