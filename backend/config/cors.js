require('dotenv').config();

const rawFrontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
const configuredOrigins = rawFrontendUrl
  .split(',')
  .map(url => url.trim().replace(/\/+$/, ''))
  .filter(Boolean);

const defaultDevOrigins = [
  'http://localhost:3000',
  'http://localhost:5000',
  'http://localhost:8080',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5000',
  'http://127.0.0.1:8080',
];

const allowedOrigins = Array.from(new Set([...configuredOrigins, ...defaultDevOrigins]));

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, server-to-server, same-origin)
    if (!origin) {
      return callback(null, true);
    }
    const normalizedOrigin = origin.replace(/\/+$/, '');
    const isVercelOrigin = /^https:\/\/[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*\.vercel\.app$/.test(normalizedOrigin);
    const isRenderOrigin = /^https:\/\/[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*\.onrender\.com$/.test(normalizedOrigin);
    if (allowedOrigins.includes('*') || allowedOrigins.includes(normalizedOrigin) || isVercelOrigin || isRenderOrigin) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
};

module.exports = corsOptions;
