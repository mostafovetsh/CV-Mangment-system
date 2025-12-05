const fs = require('fs');
const path = require('path');

function walk(dir, exts, out=[]) {
  if (!fs.existsSync(dir)) return out;
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const stat = fs.statSync(p);
    if (stat.isDirectory()) walk(p, exts, out);
    else if (exts.includes(path.extname(p).toLowerCase())) out.push(p);
  }
  return out;
}

const exts = ['.js','.jsx','.ts','.tsx','.css','.html'];
const projectRoot = path.join(__dirname, '..');
const frontRoot = path.join(projectRoot, 'frontend');
const srcRoot = path.join(frontRoot, 'src');
const publicRoot = path.join(frontRoot, 'public');
const files = [];
files.push(...walk(srcRoot, exts));
files.push(...walk(publicRoot, exts));

const mojibake = /[ÙØÃÂÄúûêîôÕçå…]/;
let fixedCount = 0;
for (const p of files) {
  try {
    const s = fs.readFileSync(p, 'utf8');
    if (mojibake.test(s)) {
      const fixed = Buffer.from(s, 'latin1').toString('utf8');
      fs.writeFileSync(p, fixed, 'utf8');
      console.log('Fixed:', p);
      fixedCount++;
    }
  } catch (err) {
    console.error('Error processing', p, err.message);
  }
}
console.log('Done. Files fixed:', fixedCount);
