const winston = require('winston');
const path = require('path');

const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    return `${timestamp} [${level.toUpperCase()}]: ${message} ${
      Object.keys(meta).length ? JSON.stringify(meta) : ''
    } ${stack || ''}`;
  })
);

const fs = require('fs');
const transports = [];

if (process.env.NODE_ENV !== 'test') {
  const logsDir = path.join(__dirname, '../logs');
  if (!fs.existsSync(logsDir)) {
    try {
      fs.mkdirSync(logsDir, { recursive: true });
    } catch (e) {}
  }
  transports.push(
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error'
    }),
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log')
    })
  );
}

// Always enable console logging for stdout capture by cloud providers (Render, Docker, etc.)
transports.push(
  new winston.transports.Console({
    format: process.env.NODE_ENV === 'production'
      ? winston.format.combine(
          winston.format.timestamp(),
          winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
            return `${timestamp} [${level.toUpperCase()}]: ${message} ${
              Object.keys(meta).length ? JSON.stringify(meta) : ''
            } ${stack || ''}`.trim();
          })
        )
      : winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        )
  })
);

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  format: logFormat,
  transports,
});

module.exports = logger;
