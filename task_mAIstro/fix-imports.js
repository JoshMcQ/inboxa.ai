const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Function to fix imports in a file
function fixImportsInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Replace @/app/(app)/ with @/app/app-layout/
    const newContent = content.replace(/@\/app\/\(app\)\//g, '@/app/app-layout/');
    
    if (newContent !== content) {
      modified = true;
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`Fixed imports in: ${filePath}`);
    }
    
    return modified;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Find all TypeScript and JavaScript files
const patterns = [
  'apps/web/**/*.ts',
  'apps/web/**/*.tsx',
  'apps/web/**/*.js',
  'apps/web/**/*.jsx'
];

let totalFixed = 0;

patterns.forEach(pattern => {
  const files = glob.sync(pattern, { ignore: ['**/node_modules/**', '**/dist/**', '**/.next/**'] });
  
  files.forEach(file => {
    if (fixImportsInFile(file)) {
      totalFixed++;
    }
  });
});

console.log(`\nTotal files fixed: ${totalFixed}`);
console.log('Import fix completed!');