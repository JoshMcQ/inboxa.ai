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

// Function to fix imports in a file
function fixImports(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Fix @inboxzero/loops imports
  if (content.includes('@inboxzero/loops')) {
    content = content.replace(
      /import\s*{([^}]+)}\s*from\s*["']@inboxzero\/loops["'];?/g,
      'import {$1} from "@/utils/stub-packages";\nconst { deleteContact: deleteLoopsContact, switchedPremiumPlan, startedTrial } = loops;'
    );
    // Add loops import at the top if needed
    if (!content.includes('import { loops }')) {
      content = 'import { loops } from "@/utils/stub-packages";\n' + content;
    }
    modified = true;
  }
  
  // Fix @inboxzero/resend imports
  if (content.includes('@inboxzero/resend')) {
    content = content.replace(
      /import\s*{([^}]+)}\s*from\s*["']@inboxzero\/resend["'];?/g,
      'import { resend } from "@/utils/stub-packages";\nconst {$1} = resend;'
    );
    modified = true;
  }
  
  // Fix @inboxzero/tinybird imports
  if (content.includes('@inboxzero/tinybird') && !content.includes('tinybird-ai-analytics')) {
    content = content.replace(
      /import\s*{([^}]+)}\s*from\s*["']@inboxzero\/tinybird["'];?/g,
      'import { tinybird } from "@/utils/stub-packages";\nconst {$1} = tinybird;'
    );
    content = content.replace(
      /import\s+type\s*{([^}]+)}\s*from\s*["']@inboxzero\/tinybird["'];?/g,
      'import type {$1} from "@/utils/stub-packages";'
    );
    modified = true;
  }
  
  // Fix @inboxzero/tinybird-ai-analytics imports
  if (content.includes('@inboxzero/tinybird-ai-analytics')) {
    content = content.replace(
      /import\s*{([^}]+)}\s*from\s*["']@inboxzero\/tinybird-ai-analytics["'];?/g,
      'import { tinybirdAiAnalytics } from "@/utils/stub-packages";\nconst {$1} = tinybirdAiAnalytics;'
    );
    modified = true;
  }
  
  // Fix test files - add missing 'to' property
  if (filePath.includes('__tests__') && content.includes('EmailForLLM')) {
    // Fix array mappings
    content = content.replace(
      /return Array\.from\({ length: \d+ }\)\.map\(\(_, i\) => \({([^}]+)}\)\)/g,
      (match, props) => {
        if (!props.includes('to:')) {
          return match.replace(props, props + ',\n        to: "test@example.com"');
        }
        return match;
      }
    );
    
    // Fix individual email objects
    content = content.replace(
      /{\s*id:\s*"email-\d+",([^}]+)}/g,
      (match, props) => {
        if (!props.includes('to:') && props.includes('from:')) {
          return match.replace(props, props + ',\n          to: "test@example.com"');
        }
        return match;
      }
    );
    
    // Fix return statements in test helpers
    if (filePath.includes('helpers.ts')) {
      content = content.replace(
        /return\s*{\s*id:[^}]+from:[^}]+subject:[^}]+content:[^}]+}/g,
        (match) => {
          if (!match.includes('to:')) {
            return match.replace('from:', 'to: "test@example.com",\n    from:');
          }
          return match;
        }
      );
    }
    
    modified = true;
  }
  
  // Fix missing promptText property in test files
  if (content.includes('promptText') && filePath.includes('__tests__')) {
    content = content.replace(
      /return\s*{([^}]+systemType:\s*null)\s*}/g,
      (match, props) => {
        if (!props.includes('promptText')) {
          return match.replace('systemType: null', 'systemType: null,\n    promptText: null');
        }
        return match;
      }
    );
    modified = true;
  }
  
  // Fix missing exclude property in test files
  if (content.includes('GroupItemType') && filePath.includes('test')) {
    content = content.replace(
      /{\s*type:\s*"(FROM|SUBJECT)",\s*value:\s*"[^"]+"\s*}/g,
      (match) => {
        if (!match.includes('exclude')) {
          return match.replace('}', ', exclude: false }');
        }
        return match;
      }
    );
    modified = true;
  }
  
  // Fix optional exclude property
  if (content.includes('exclude?: boolean | undefined')) {
    content = content.replace('exclude?: boolean | undefined', 'exclude: boolean');
    modified = true;
  }
  
  // Fix Prisma.sql date issues
  if (content.includes('Prisma.sql') && content.includes('new Date(')) {
    content = content.replace(
      /new Date\((fromDate|toDate)\)/g,
      'new Date($1 as string)'
    );
    modified = true;
  }
  
  // Fix implicit any type
  if (content.includes('.map((d)')) {
    content = content.replace('.map((d)', '.map((d: any)');
    modified = true;
  }
  
  if (content.includes('.catch((error)')) {
    content = content.replace('.catch((error)', '.catch((error: any)');
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

// Fix specific files that have errors
const errorFiles = [
  'app/api/lemon-squeezy/webhook/route.ts',
  'app/api/resend/digest/route.ts',
  'app/api/resend/summary/route.ts',
  'app/api/user/stats/by-period/route.ts',
  'app/api/user/stats/email-actions/route.ts',
  'app/api/user/stats/sender-emails/route.ts',
  'app/app-layout/[emailAccountId]/stats/NewsletterModal.tsx',
  'ee/billing/stripe/loops-events.test.ts',
  'ee/billing/stripe/loops-events.ts',
  'scripts/addUsersToResend.ts',
  'utils/group/find-matching-group.test.ts',
  'utils/usage.ts',
  'utils/user/delete.ts',
  '__tests__/ai-choose-args.test.ts',
  '__tests__/ai-detect-recurring-pattern.test.ts',
  '__tests__/ai-extract-from-email-history.test.ts',
  '__tests__/ai-process-user-request.test.ts',
  '__tests__/helpers.ts'
];

for (const file of errorFiles) {
  const fullPath = path.join(webDir, file);
  if (fs.existsSync(fullPath)) {
    fixImports(fullPath);
  }
}

console.log('Import fixing complete!');