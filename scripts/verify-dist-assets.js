const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '..', 'dist');
const indexPath = path.join(distDir, 'index.html');
const assetsDir = path.join(distDir, 'assets');

if (!fs.existsSync(indexPath)) {
  console.error('index.html not found in dist/');
  process.exit(2);
}

const html = fs.readFileSync(indexPath, 'utf8');
const assetRegex = /\/(assets\/[\w\-\.]+\.js)/g;
let m;
const refs = new Set();
while ((m = assetRegex.exec(html)) !== null) {
  refs.add(m[1]);
}

if (refs.size === 0) {
  console.log('No /assets/*.js references found in index.html');
  process.exit(0);
}

const missing = [];
for (const ref of refs) {
  const file = path.join(distDir, ref.replace(/^\//, ''));
  if (!fs.existsSync(file)) missing.push(ref);
}

if (missing.length === 0) {
  console.log(`All referenced assets are present in dist/assets (checked ${refs.size} files).`);
  process.exit(0);
} else {
  console.error('Missing referenced assets:');
  missing.forEach(x => console.error(` - ${x}`));
  process.exit(1);
}
