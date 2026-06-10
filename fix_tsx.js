const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'frontend/src/pages');
const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
    const filePath = path.join(pagesDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Cast custom CSS property style objects to React.CSSProperties
    content = content.replace(/style=\{\{\s*('--[a-zA-Z0-9-]+'[^}]+)\}\}/g, 'style={{ $1 } as React.CSSProperties}');

    fs.writeFileSync(filePath, content, 'utf8');
}
console.log('Fixed CSS custom properties casting in TSX files.');
