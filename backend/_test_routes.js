require('dotenv').config();
try {
  const routes = require('./routes');
  console.log('All routes loaded successfully');
} catch(e) {
  console.error('Route load error:', e.message);
  console.error(e.stack);
}
