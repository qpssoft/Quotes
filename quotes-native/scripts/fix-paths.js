const fs = require('fs');
const path = require('path');

const distPath = path.join(__dirname, '..', 'dist');
const indexPath = path.join(distPath, 'index.html');
const html404Path = path.join(distPath, '404.html');

// Read the index.html
let indexHtml = fs.readFileSync(indexPath, 'utf8');

// Replace absolute paths with subpath
indexHtml = indexHtml
  .replace(/href="\//g, 'href="/Quotes/App/')
  .replace(/src="\//g, 'src="/Quotes/App/')
  .replace(/content="\//g, 'content="/Quotes/App/');

// Write back
fs.writeFileSync(indexPath, indexHtml);
console.log('✓ Fixed paths in index.html');

// Copy to 404.html if it exists
if (fs.existsSync(html404Path)) {
  fs.writeFileSync(html404Path, indexHtml);
  console.log('✓ Fixed paths in 404.html');
}
