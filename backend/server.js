require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');

const connectDB = require('./config/database');
const corsOptions = require('./config/cors');
const appConfig = require('./config/app');
const { apiLimiter } = require('./middleware/rateLimiter');
const requestLogger = require('./middleware/requestLogger');
const errorHandler = require('./middleware/errorHandler');
const sanitize = require('./middleware/sanitize');
const logger = require('./utils/logger');
const bootstrap = require('./utils/bootstrap');

// Connect to Database and initialize bootstrap
if (process.env.NODE_ENV !== 'test') {
  connectDB().then(() => {
    if (mongoose.connection.readyState === 1) {
      bootstrap().catch(err => logger.warn(`Initial bootstrap warning: ${err.message}`));
    }
  }).catch(() => {});

  mongoose.connection.on('connected', () => {
    bootstrap().catch(err => logger.warn(`Connected bootstrap warning: ${err.message}`));
  });
}

const app = express();

// Trust reverse proxy headers (e.g. Nginx, Cloudflare, AWS ALB)
app.set('trust proxy', 1);

// Middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(sanitize);
app.use(requestLogger);
app.use(apiLimiter);
// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, appConfig.uploadDir)));

// Serverless / Cloud DB connection assurance
app.use(async (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    try {
      await connectDB();
      bootstrap().catch(() => {});
    } catch (e) {}
  }
  next();
});

// Serve frontend static files
let frontendPath = path.join(__dirname, '..', 'frontend');
if (!fs.existsSync(frontendPath)) {
  frontendPath = path.join(__dirname, 'frontend');
}
app.use(express.static(frontendPath));

// Health check route suitable for deployment monitoring
app.get('/health', (req, res) => {
  const dbStatus = connectDB.getSafeDbStatus ? connectDB.getSafeDbStatus() : { state: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' };
  res.status(200).json({
    status: 'OK',
    database: dbStatus.state,
    dbDetails: dbStatus,
    services: {
      ai: {
        configured: Boolean(process.env.AI_API_KEY || process.env.GEMINI_API_KEY || process.env.WEATHER_API_KEY),
        provider: process.env.AI_PROVIDER || 'gemini'
      },
      weather: {
        provider: 'open-meteo',
        keyless: true
      }
    },
    version: appConfig.appVersion,
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Mount API routes
app.use('/api', require('./routes'));

// Serve frontend pages (SPA fallback for HTML pages)
app.get('/pages/*', (req, res) => {
  let requestedPage = path.join(frontendPath, req.path);
  if (!path.extname(requestedPage) && fs.existsSync(requestedPage + '.html')) {
    requestedPage = requestedPage + '.html';
  }
  res.sendFile(requestedPage, (err) => {
    if (err) {
      res.status(404).send('Page not found');
    }
  });
});

// Root fallback to index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error(`Uncaught Exception: ${err.message}`, { stack: err.stack });
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`, { stack: err.stack });
  process.exit(1);
});

if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  const server = app.listen(appConfig.port, '0.0.0.0', () => {
    logger.info(`Server running in ${appConfig.nodeEnv} mode on port ${appConfig.port}`);
    if (appConfig.nodeEnv !== 'production') {
      logger.info(`Frontend: http://localhost:${appConfig.port}`);
      logger.info(`API: http://localhost:${appConfig.port}/api`);
    } else {
      logger.info(`Bound to 0.0.0.0:${appConfig.port}`);
    }
  });

  const gracefulShutdown = (signal) => {
    logger.info(`${signal} received: closing HTTP server and database connections gracefully`);
    server.close(async () => {
      logger.info('HTTP server closed');
      try {
        if (mongoose.connection.readyState !== 0) {
          await mongoose.connection.close(false);
          logger.info('MongoDB connection closed gracefully');
        }
      } catch (err) {
        logger.error('Error closing MongoDB connection:', err);
      }
      process.exit(0);
    });

    // Force close after 10s timeout
    setTimeout(() => {
      logger.error('Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

module.exports = app;
