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

// Function to fix import paths in a file
function fixImportPaths(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Fix bulk-unsubscribe -> unsubscribe
  const bulkUnsubscribeRegex = /@\/app\/app-layout\/\[emailAccountId\]\/bulk-unsubscribe/g;
  if (bulkUnsubscribeRegex.test(content)) {
    content = content.replace(bulkUnsubscribeRegex, '@/app/app-layout/[emailAccountId]/unsubscribe');
    modified = true;
  }
  
  // Fix cold-email-blocker -> ce-blocker
  const coldEmailBlockerRegex = /@\/app\/app-layout\/\[emailAccountId\]\/cold-email-blocker/g;
  if (coldEmailBlockerRegex.test(content)) {
    content = content.replace(coldEmailBlockerRegex, '@/app/app-layout/[emailAccountId]/ce-blocker');
    modified = true;
  }
  
  // Fix utils/prisma -> @/utils/prisma
  const utilsPrismaRegex = /from ["']utils\/prisma["']/g;
  if (utilsPrismaRegex.test(content)) {
    content = content.replace(utilsPrismaRegex, 'from "@/utils/prisma"');
    modified = true;
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`Fixed imports in: ${filePath}`);
  }
}

// Main execution
const webDir = __dirname;
const tsFiles = findTsFiles(webDir);

console.log(`Found ${tsFiles.length} TypeScript files`);

for (const file of tsFiles) {
  fixImportPaths(file);
}

console.log('Import path fixing complete!');