const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    userName: String,
    action: {
      type: String,
      required: true,
      index: true,
    },
    resource: String,
    resourceId: String,
    details: String,
    ip: String,
    userAgent: String,
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false,
  }
);

// Normalize action to lowercase before save
auditLogSchema.pre('save', function (next) {
  if (this.action) {
    this.action = this.action.toLowerCase();
  }
  next();
});

auditLogSchema.index({ timestamp: -1 });
auditLogSchema.index({ user: 1, action: 1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);
module.exports = AuditLog;
