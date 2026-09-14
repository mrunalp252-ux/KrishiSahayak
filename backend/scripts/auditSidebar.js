const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, '..', '..', 'frontend', 'pages');
const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.html'));

const unlocalizedPages = [];

files.forEach(file => {
  const content = fs.readFileSync(path.join(pagesDir, file), 'utf8');
  if (content.includes('class="nav-item">📊 Dashboard</a>')) {
    unlocalizedPages.push(file);
  }
});

console.log('Pages with unlocalized sidebar:', unlocalizedPages);
