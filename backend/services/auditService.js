const AuditLog = require('../models/AuditLog');
const logger = require('../utils/logger');

class AuditService {
  async log({ user, userName, action, resource, resourceId, details, ip, userAgent }) {
    try {
      // Sanitize - never log passwords or tokens
      let sanitizedDetails = details;
      if (typeof details === 'object' && details !== null) {
        sanitizedDetails = JSON.stringify(details);
        // Remove any accidentally included sensitive data
        sanitizedDetails = sanitizedDetails.replace(/"password":"[^"]*"/g, '"password":"[REDACTED]"');
        sanitizedDetails = sanitizedDetails.replace(/"token":"[^"]*"/g, '"token":"[REDACTED]"');
      }

      return await AuditLog.create({
        user: user || undefined,
        userName: userName || undefined,
        action,
        resource,
        resourceId: resourceId ? String(resourceId) : undefined,
        details: sanitizedDetails,
        ip,
        userAgent,
        timestamp: new Date()
      });
    } catch (err) {
      // Audit logging should never crash the main operation
      logger.error('Audit log error:', err.message);
      return null;
    }
  }

  async getAuditLogs(query = {}) {
    const filter = {};
    if (query.user) filter.user = query.user;
    if (query.action) filter.action = query.action;
    if (query.resource) filter.resource = query.resource;
    if (query.startDate || query.endDate) {
      filter.timestamp = {};
      if (query.startDate) filter.timestamp.$gte = new Date(query.startDate);
      if (query.endDate) filter.timestamp.$lte = new Date(query.endDate);
    }

    const page = parseInt(query.page) || 1;
    const limit = Math.min(parseInt(query.limit) || 20, 100);
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      AuditLog.find(filter)
        .populate('user', 'name email role')
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      AuditLog.countDocuments(filter)
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }
}

module.exports = new AuditService();
