import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAccounts() {
  try {
    // Check users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        createdAt: true,
      },
    });

    console.log(`\n👥 Users: ${users.length}`);
    users.forEach((user) => {
      console.log(`   ${user.email} (created ${user.createdAt.toLocaleDateString()})`);
    });

    // Check email accounts
    const emailAccounts = await prisma.emailAccount.findMany({
      select: {
        id: true,
        email: true,
        userId: true,
        createdAt: true,
      },
    });

    console.log(`\n📧 Email Accounts: ${emailAccounts.length}`);
    emailAccounts.forEach((acc) => {
      console.log(`   ${acc.id}: ${acc.email}`);
    });

    // Check total emails in DB (not just inbox)
    const totalEmails = await prisma.emailMessage.count();
    console.log(`\n📬 Total emails in database: ${totalEmails}`);

    if (totalEmails > 0) {
      const allEmails = await prisma.emailMessage.findMany({
        select: {
          id: true,
          subject: true,
          inbox: true,
          priority: true,
          aiCategorized: true,
          date: true,
        },
        orderBy: { date: 'desc' },
        take: 10,
      });

      console.log(`\n📨 Recent emails (all, not just inbox):`);
      allEmails.forEach((email, i) => {
        console.log(`\n${i + 1}. ${email.subject || '(No subject)'}`);
        console.log(`   Inbox: ${email.inbox}`);
        console.log(`   Priority: ${email.priority || 'NONE'}`);
        console.log(`   AI Categorized: ${email.aiCategorized}`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAccounts();
