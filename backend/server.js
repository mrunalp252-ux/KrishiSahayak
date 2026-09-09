require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const path = require('path');

const connectDB = require('./config/database');
const corsOptions = require('./config/cors');
const appConfig = require('./config/app');
const { apiLimiter } = require('./middleware/rateLimiter');
const requestLogger = require('./middleware/requestLogger');
const errorHandler = require('./middleware/errorHandler');
const sanitize = require('./middleware/sanitize');
const logger = require('./utils/logger');

// Connect to Database
connectDB();

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

// Serve frontend static files
const frontendPath = path.join(__dirname, '..', 'frontend');
app.use(express.static(frontendPath));

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', version: appConfig.appVersion });
});

// Mount API routes
app.use('/api', require('./routes'));

// Serve frontend pages (SPA fallback for HTML pages)
app.get('/pages/*', (req, res) => {
  const requestedPage = path.join(frontendPath, req.path);
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

if (process.env.NODE_ENV !== 'test') {
  app.listen(appConfig.port, () => {
    logger.info(`Server running in ${appConfig.nodeEnv} mode on port ${appConfig.port}`);
    logger.info(`Frontend: http://localhost:${appConfig.port}`);
    logger.info(`API: http://localhost:${appConfig.port}/api`);
  });
}

module.exports = app;
