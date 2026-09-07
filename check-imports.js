const fs = require('fs');

function scanDir(dir) {
  const entries = fs.readdirSync(dir);
  entries.forEach(entry => {
    const fullPath = dir + '/' + entry;
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      scanDir(fullPath);
    } else if (entry.endsWith('.jsx')) {
      try {
        const c = fs.readFileSync(fullPath, 'utf8');
        if (c.includes('AlertCircle') && c.includes('lucide-react')) {
          const lines = c.split('\n');
          const lucideImport = lines.find(l => l.includes('lucide-react'));
          const hasAlertCircle = lucideImport && lucideImport.includes('AlertCircle');
          if (!hasAlertCircle) {
            console.log('MISSING:', fullPath);
          }
        }
      } catch(e) {}
    }
  });
}

scanDir('./app/(admin)/admin');
