require('dotenv').config();

module.exports = {
  secret: process.env.JWT_SECRET || 'fallback-secret-key-dev-only',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret-key-dev-only',
  expire: process.env.JWT_EXPIRE || '15m',
  refreshExpire: process.env.JWT_REFRESH_EXPIRE || '7d'
};
