import { PrismaClient } from '@prisma/client';
import { google } from 'googleapis';

const prisma = new PrismaClient();

async function syncEmails() {
  try {
    // Get the user's email account
    const emailAccount = await prisma.emailAccount.findFirst({
      where: {
        email: 'joshuamcqueary@gmail.com'
      },
      include: {
        account: true
      }
    });

    if (!emailAccount) {
      console.error('❌ Email account not found');
      return;
    }

    console.log('✅ Found email account:', emailAccount.email);
    console.log('   Account ID:', emailAccount.id);

    // Decrypt access token (you'll need to implement this or use the actual token)
    // For now, let's just trigger the app's sync endpoint

    console.log('\n💡 To sync emails, please:');
    console.log('   1. Log into the app at http://localhost:3001');
    console.log('   2. Navigate to your inbox');
    console.log('   3. The app should automatically fetch emails');
    console.log('\nOR manually call the Gmail API sync endpoint:');
    console.log(`   curl http://localhost:3001/api/google/messages/sync?emailAccountId=${emailAccount.id}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

syncEmails();
