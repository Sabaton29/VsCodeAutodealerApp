const fs = require('fs')
const path = require('path')

const ROOT = process.cwd()
const TARGET_DIRS = ['components', 'src']
const EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx']

function walk(dir) {
  let results = []
  const list = fs.readdirSync(dir)
  list.forEach((file) => {
    const full = path.join(dir, file)
    const stat = fs.statSync(full)
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(full))
    } else {
      results.push(full)
    }
  })
  return results
}

function shouldProcess(file) {
  const ext = path.extname(file).toLowerCase()
  return EXTENSIONS.includes(ext)
}

function processFile(file) {
  let code = fs.readFileSync(file, 'utf8')
  const original = code
  code = code.replace(/console\.debug\s*\(/g, 'console.warn(')
  if (code !== original) {
    try { fs.copyFileSync(file, file + '.bak') } catch (err) { console.error('Backup failed', file, err.message); return false }
    fs.writeFileSync(file, code, 'utf8')
    return true
  }
  return false
}

function main() {
  const modified = []
  TARGET_DIRS.forEach((d) => {
    const dirPath = path.join(ROOT, d)
    if (!fs.existsSync(dirPath)) return
    const files = walk(dirPath)
    files.forEach((f) => {
      if (!shouldProcess(f)) return
      try { if (processFile(f)) modified.push(path.relative(ROOT, f)) } catch (err) { console.error('Error', f, err.message) }
    })
  })
  console.log('Done. Modified files:', modified.length)
  modified.forEach(m => console.log(' -', m))
}

main()
