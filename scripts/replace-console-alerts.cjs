const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const exts = ['.ts', '.tsx', '.js', '.jsx'];

function walk(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (['node_modules', 'dist', '.git'].includes(e.name)) continue;
      walk(full, files);
    } else {
      if (exts.includes(path.extname(e.name))) files.push(full);
    }
  }
  return files;
}

const files = walk(root);
let changed = 0;
for (const file of files) {
  let src = fs.readFileSync(file, 'utf8');
  let orig = src;
  // skip test or scripts folder files (but we'll operate on all for now)
  // create backup
  // simple replacements:
  // 1) console.log( -> console.debug(
  src = src.replace(/console\.log\s*\(/g, 'console.debug(');
  // 2) alert( -> console.warn(
  src = src.replace(/\balert\s*\(/g, 'console.warn(');
  // 3) confirm( -> window.confirm(
  src = src.replace(/\bconfirm\s*\(/g, 'window.confirm(');

  if (src !== orig) {
    fs.copyFileSync(file, file + '.bak');
    fs.writeFileSync(file, src, 'utf8');
    changed++;
    console.log('Patched', file);
  }
}
console.log('Done. Files changed:', changed);
