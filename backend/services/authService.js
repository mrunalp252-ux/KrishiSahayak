const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const jwtConfig = require('../config/jwt');

class AuthService {
  async register(userData) {
    const cleanEmail = (userData.email || '').trim().toLowerCase();
    userData.email = cleanEmail;
    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      const err = new Error('Email already registered');
      err.statusCode = 409;
      throw err;
    }
    const user = await User.create(userData);
    const userObj = user.toObject();
    delete userObj.password;
    delete userObj.refreshTokens;
    return userObj;
  }

  async login(email, password) {
    const cleanEmail = (email || '').trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail, isActive: true }).select('+password');
    if (!user) {
      const err = new Error('Invalid credentials');
      err.statusCode = 401;
      throw err;
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      const err = new Error('Invalid credentials');
      err.statusCode = 401;
      throw err;
    }

    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    // Store refresh token in array
    user.cleanExpiredTokens();
    user.addRefreshToken(refreshToken, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
    await user.save();

    const userObj = user.toObject();
    delete userObj.password;
    delete userObj.refreshTokens;
    return { user: userObj, accessToken, refreshToken };
  }

  async refreshToken(token) {
    try {
      const decoded = jwt.verify(token, jwtConfig.refreshSecret);
      const user = await User.findOne({
        _id: decoded.id,
        'refreshTokens.token': token,
        isActive: true
      });
      if (!user) {
        const err = new Error('Invalid refresh token');
        err.statusCode = 401;
        throw err;
      }

      const accessToken = this.generateAccessToken(user);
      const newRefreshToken = this.generateRefreshToken(user);

      // Remove old token, add new one
      user.removeRefreshToken(token);
      user.cleanExpiredTokens();
      user.addRefreshToken(newRefreshToken, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
      await user.save();

      return { accessToken, refreshToken: newRefreshToken };
    } catch (err) {
      if (err.statusCode) throw err;
      const error = new Error('Invalid refresh token');
      error.statusCode = 401;
      throw error;
    }
  }

  async logout(userId, refreshToken) {
    const user = await User.findById(userId);
    if (user) {
      if (refreshToken) {
        user.removeRefreshToken(refreshToken);
      } else {
        user.refreshTokens = [];
      }
      await user.save();
    }
  }

  async forgotPassword(email) {
    const cleanEmail = (email || '').trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });
    if (!user) return null; // Don't reveal if email exists

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hash = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.passwordResetToken = hash;
    user.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    return resetToken;
  }

  async resetPassword(token, newPassword) {
    const hash = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      passwordResetToken: hash,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      const err = new Error('Invalid or expired reset token');
      err.statusCode = 400;
      throw err;
    }

    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.refreshTokens = []; // Invalidate all sessions
    await user.save();
    return true;
  }

  generateAccessToken(user) {
    return jwt.sign(
      { id: user._id, role: user.role },
      jwtConfig.secret,
      { expiresIn: jwtConfig.expire || '15m' }
    );
  }

  generateRefreshToken(user) {
    return jwt.sign(
      { id: user._id, type: 'refresh' },
      jwtConfig.refreshSecret,
      { expiresIn: jwtConfig.refreshExpire || '7d' }
    );
  }
}

module.exports = new AuthService();
