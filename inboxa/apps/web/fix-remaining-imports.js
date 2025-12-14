const fs = require('fs');
const path = require('path');

// Function to recursively find all TypeScript files
function findTsFiles(dir, files = []) {
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
      findTsFiles(fullPath, files);
    } else if (item.endsWith('.ts') || item.endsWith('.tsx')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Function to fix malformed import paths
function fixMalformedImports(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Fix malformed quotes in import paths
  const malformedImportRegex = /from ["']'([^"']+)["']'[^"']*["']/g;
  if (malformedImportRegex.test(content)) {
    content = content.replace(malformedImportRegex, 'from "@/$1"');
    modified = true;
  }
  
  // Fix any remaining bulk-unsubscribe references that weren't caught
  const remainingBulkRegex = /bulk-unsubscribe/g;
  if (remainingBulkRegex.test(content)) {
    content = content.replace(remainingBulkRegex, 'unsubscribe');
    modified = true;
  }
  
  // Fix any remaining cold-email-blocker references that weren't caught
  const remainingColdRegex = /cold-email-blocker/g;
  if (remainingColdRegex.test(content)) {
    content = content.replace(remainingColdRegex, 'ce-blocker');
    modified = true;
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`Fixed malformed imports in: ${filePath}`);
  }
}

// Main execution
const webDir = __dirname;
const tsFiles = findTsFiles(webDir);

console.log(`Found ${tsFiles.length} TypeScript files`);

for (const file of tsFiles) {
  fixMalformedImports(file);
}

console.log('Malformed import fixing complete!');