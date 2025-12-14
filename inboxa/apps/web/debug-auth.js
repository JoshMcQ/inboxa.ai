const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugAuth() {
  try {
    console.log('🔍 Checking for duplicate user records...');
    
    // Find all users with your email
    const users = await prisma.user.findMany({
      where: {
        email: {
          contains: '@' // Replace with your email domain
        }
      },
      include: {
        accounts: true,
        emailAccounts: true
      }
    });
    
    console.log(`📊 Found ${users.length} user records:`);
    users.forEach((user, index) => {
      console.log(`\n👤 User ${index + 1}:`);
      console.log(`  ID: ${user.id}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Name: ${user.name}`);
      console.log(`  Created: ${user.createdAt}`);
      console.log(`  Accounts: ${user.accounts.length}`);
      console.log(`  Email Accounts: ${user.emailAccounts.length}`);
      
      user.accounts.forEach((account, i) => {
        console.log(`    Account ${i + 1}: ${account.provider} (${account.providerAccountId})`);
      });
    });
    
    // Check for accounts without linked users
    const orphanAccounts = await prisma.account.findMany({
      where: {
        provider: 'google'
      },
      include: {
        user: true
      }
    });
    
    console.log(`\n🔗 Found ${orphanAccounts.length} Google accounts:`);
    orphanAccounts.forEach((account, index) => {
      console.log(`\n🔗 Account ${index + 1}:`);
      console.log(`  Provider Account ID: ${account.providerAccountId}`);
      console.log(`  User ID: ${account.userId}`);
      console.log(`  User Email: ${account.user?.email || 'UNKNOWN'}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugAuth();
