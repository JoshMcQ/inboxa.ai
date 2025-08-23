const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function getEmailAccountId() {
  try {
    console.log('🔍 Finding email account ID...');
    
    const emailAccounts = await prisma.emailAccount.findMany({
      where: {
        user: {
          email: 'joshuamcqueary@gmail.com'
        }
      },
      select: {
        id: true,
        email: true,
        name: true,
        user: {
          select: {
            email: true
          }
        }
      }
    });
    
    console.log(`📧 Found ${emailAccounts.length} email account(s):`);
    emailAccounts.forEach((account, index) => {
      console.log(`\n📧 Email Account ${index + 1}:`);
      console.log(`  ID: ${account.id}`);
      console.log(`  Email: ${account.email}`);
      console.log(`  Name: ${account.name}`);
      console.log(`  User Email: ${account.user.email}`);
      console.log(`  Assistant URL: http://localhost:3000/${account.id}/assistant`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

getEmailAccountId();
