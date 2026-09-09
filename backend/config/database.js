const mongoose = require('mongoose');
const logger = require('../utils/logger');

// Disable buffering so queries fail-fast immediately instead of hanging for 10 seconds
mongoose.set('bufferCommands', false);

let reconnectInterval = null;
let lastConnectionError = null;

// Helper to sanitize URIs and error strings (masking password)
const maskCredentials = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str.replace(/(mongodb(\+srv)?:\/\/[^:]+:)[^@]+(@)/gi, '$1*****$3');
};

// Candidate environment variable resolution
const resolveDbConfig = () => {
  const isTest = process.env.NODE_ENV === 'test';
  if (isTest) {
    return {
      uri: process.env.TEST_MONGODB_URI || 'mongodb://127.0.0.1:27017/krishi-sahayak-test',
      varName: process.env.TEST_MONGODB_URI ? 'TEST_MONGODB_URI' : 'default_test',
      configured: true
    };
  }

  const candidates = [
    'MONGODB_URI',
    'MONGO_URI',
    'DATABASE_URL',
    'MONGODB_URL',
    'MONGO_URL',
    'ATLAS_URI'
  ];

  for (const name of candidates) {
    const raw = process.env[name];
    if (raw && typeof raw === 'string' && raw.trim() !== '') {
      // Strip outer quotes if accidentally added in environment dashboard
      const clean = raw.trim().replace(/^["']|["']$/g, '');
      return {
        uri: clean,
        varName: name,
        configured: true
      };
    }
  }

  return {
    uri: '',
    varName: 'none',
    configured: false
  };
};

const getSafeDbStatus = () => {
  const stateNames = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  const readyState = mongoose.connection.readyState;
  const state = stateNames[readyState] || 'unknown';
  
  const { uri, varName, configured } = resolveDbConfig();
  let sanitizedHost = 'unconfigured';
  let isAtlas = false;
  let isLocal = false;
  let scheme = 'none';
  let databaseName = 'krishi-sahayak';

  if (configured && uri) {
    try {
      scheme = uri.startsWith('mongodb+srv://') ? 'mongodb+srv' : (uri.startsWith('mongodb://') ? 'mongodb' : 'unknown');
      
      const atIndex = uri.indexOf('@');
      if (atIndex !== -1) {
        const afterAt = uri.substring(atIndex + 1);
        const slashIndex = afterAt.indexOf('/');
        const qIndex = afterAt.indexOf('?');
        
        if (slashIndex !== -1) {
          sanitizedHost = afterAt.substring(0, slashIndex);
          const afterSlash = afterAt.substring(slashIndex + 1);
          databaseName = afterSlash.split('?')[0] || 'krishi-sahayak';
        } else if (qIndex !== -1) {
          sanitizedHost = afterAt.substring(0, qIndex);
        } else {
          sanitizedHost = afterAt;
        }
        isAtlas = sanitizedHost.includes('mongodb.net');
      } else {
        const withoutProto = uri.replace(/^mongodb(\+srv)?:\/\//, '');
        sanitizedHost = withoutProto.split('/')[0].split('?')[0];
      }
      isLocal = sanitizedHost.includes('127.0.0.1') || sanitizedHost.includes('localhost') || sanitizedHost.includes('::1');
    } catch (e) {
      sanitizedHost = 'configured';
    }
  }

  return {
    state,
    connected: readyState === 1,
    configured,
    variableName: varName,
    scheme,
    host: sanitizedHost,
    databaseName,
    isAtlas,
    isLocal,
    lastError: lastConnectionError ? maskCredentials(lastConnectionError.message) : null,
    diagnosticHint: lastConnectionError ? lastConnectionError.hint : (configured ? (readyState === 1 ? 'Connected and operational.' : 'Connecting...') : 'Add MONGODB_URI to Render Dashboard -> Environment.'),
    lastAttempt: lastConnectionError ? lastConnectionError.time : null
  };
};

const connectDB = async () => {
  try {
    if (mongoose.connection.readyState === 1 || mongoose.connection.readyState === 2) {
      return;
    }

    const isProd = process.env.NODE_ENV === 'production';
    const { uri, varName, configured } = resolveDbConfig();

    if (!configured || !uri) {
      const msg = 'No MongoDB connection string found. MONGODB_URI is unconfigured.';
      lastConnectionError = {
        message: msg,
        hint: 'In Render Dashboard -> Environment: Add MONGODB_URI pointing to your MongoDB Atlas cluster.',
        time: new Date().toISOString()
      };
      if (isProd) {
        logger.error(`[DATABASE CONFIG ERROR] ${msg} Refusing localhost fallback in production.`);
        return;
      } else {
        logger.info('Development mode: defaulting to local MongoDB on 127.0.0.1:27017');
      }
    }

    let mongoURI = uri || 'mongodb://127.0.0.1:27017/krishi-sahayak';

    if (isProd) {
      const isLocal = mongoURI.includes('127.0.0.1') || mongoURI.includes('localhost') || mongoURI.includes('::1');
      if (isLocal) {
        const msg = 'MONGODB_URI points to localhost/127.0.0.1, which is unreachable from cloud hosting.';
        lastConnectionError = {
          message: msg,
          hint: 'Update MONGODB_URI in Render Dashboard to a remote MongoDB Atlas cluster URI.',
          time: new Date().toISOString()
        };
        logger.error(`[DATABASE CONFIG ERROR] ${msg}`);
        return;
      }
    }

    // Ensure database name is present before query string in Atlas URIs
    if (mongoURI.startsWith('mongodb+srv://') && !mongoURI.includes('.mongodb.net/krishi-sahayak') && !mongoURI.match(/\.mongodb\.net\/[a-zA-Z0-9_-]+/)) {
      if (mongoURI.includes('.mongodb.net/?')) {
        mongoURI = mongoURI.replace('.mongodb.net/?', '.mongodb.net/krishi-sahayak?');
      } else if (mongoURI.endsWith('.mongodb.net/')) {
        mongoURI += 'krishi-sahayak';
      } else if (mongoURI.endsWith('.mongodb.net')) {
        mongoURI += '/krishi-sahayak';
      }
    }

    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      family: 4
    });

    lastConnectionError = null;
    if (reconnectInterval) {
      clearInterval(reconnectInterval);
      reconnectInterval = null;
    }
  } catch (error) {
    const cleanMsg = maskCredentials(error.message);
    let hint = 'Please check your MongoDB connection string and network settings.';

    if (cleanMsg.includes('timed out') || cleanMsg.includes('Server selection timed out') || cleanMsg.includes('ETIMEDOUT')) {
      hint = 'Network Access blocked: In MongoDB Atlas, navigate to Network Access -> Add IP Address -> Select "Allow Access from Anywhere" (0.0.0.0/0).';
    } else if (cleanMsg.includes('Authentication failed') || cleanMsg.includes('bad auth')) {
      hint = 'Authentication failed: Verify your database username and password in MongoDB Atlas -> Database Access. URL-encode special characters in password.';
    } else if (cleanMsg.includes('ENOTFOUND') || cleanMsg.includes('querySrv')) {
      hint = 'DNS Resolution failed: The Atlas cluster hostname could not be found. Check cluster name in connection string.';
    }

    lastConnectionError = {
      message: cleanMsg,
      hint,
      time: new Date().toISOString()
    };

    logger.error(`MongoDB connection error: ${cleanMsg}`);
    logger.warn(`Diagnostic Hint: ${hint}`);

    if (!reconnectInterval && process.env.NODE_ENV !== 'test') {
      reconnectInterval = setInterval(async () => {
        if (mongoose.connection.readyState === 0) {
          try {
            await connectDB();
          } catch (e) {}
        }
      }, 15000);
    }
  }
};

mongoose.connection.on('connected', () => {
  logger.info('MongoDB connected successfully');
  lastConnectionError = null;
  if (reconnectInterval) {
    clearInterval(reconnectInterval);
    reconnectInterval = null;
  }
});

mongoose.connection.on('error', (err) => {
  logger.error(`MongoDB runtime connection error: ${maskCredentials(err.message)}`);
});

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected');
});

connectDB.getSafeDbStatus = getSafeDbStatus;

module.exports = connectDB;
