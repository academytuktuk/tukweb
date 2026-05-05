const fs = require('fs');
const path = require('path');

function walk(dir) {
  fs.readdirSync(dir).forEach(file => {
    let f = path.join(dir, file);
    if (fs.statSync(f).isDirectory()) walk(f);
    else if (f.endsWith('.tsx') || f.endsWith('.ts')) {
      let content = fs.readFileSync(f, 'utf8');
      let replaced = content.replace(/const API_BASE = process\.env\.NEXT_PUBLIC_API_URL \|\| 'https:\/\/tukweb-production\.up\.railway\.app';/g, "const API_BASE = (typeof window !== 'undefined' && window.location.hostname === 'localhost') ? 'http://localhost:4000' : '';");
      if (content !== replaced) {
        fs.writeFileSync(f, replaced, 'utf8');
      }
    }
  });
}
walk('frontend/app');
