const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanupUser() {
  try {
    const email = 'joshuamcqueary@gmail.com';
    
    console.log(`🗑️ Cleaning up orphaned user record for ${email}...`);
    
    // Check what we're about to delete
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        accounts: true,
        emailAccounts: true,
        premium: true,
        rules: true,
        // Add other relations that might exist
      }
    });
    
    if (!user) {
      console.log('❌ No user found with that email');
      return;
    }
    
    console.log('👤 User details:');
    console.log(`  ID: ${user.id}`);
    console.log(`  Email: ${user.email}`);
    console.log(`  Accounts: ${user.accounts.length}`);
    console.log(`  Email Accounts: ${user.emailAccounts.length}`);
    console.log(`  Premium records: ${user.premium.length}`);
    console.log(`  Rules: ${user.rules.length}`);
    
    // If user has important data, warn and exit
    if (user.rules.length > 0 || user.premium.length > 0 || user.emailAccounts.length > 0) {
      console.log('⚠️ User has important data - manual cleanup required');
      console.log('Cannot safely delete this user automatically');
      return;
    }
    
    // Safe to delete - no linked accounts or data
    if (user.accounts.length === 0) {
      await prisma.user.delete({
        where: { email }
      });
      console.log('✅ Successfully deleted orphaned user record');
      console.log('🔄 You can now sign up fresh with Google OAuth');
    } else {
      console.log('⚠️ User has linked accounts - not deleting');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupUser();
