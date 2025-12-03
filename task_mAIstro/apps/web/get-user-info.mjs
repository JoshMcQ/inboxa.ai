import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({
    include: {
      emailAccounts: {
        select: {
          id: true,
          email: true,
        },
        take: 1,
      },
    },
  });

  if (user) {
    console.log('\n=== User Info for ElevenLabs Configuration ===');
    console.log('User ID:', user.id);
    console.log('Email Account ID:', user.emailAccounts[0]?.id);
    console.log('Email:', user.emailAccounts[0]?.email);
    console.log('\n=== Headers to add in ElevenLabs Dashboard ===');
    console.log('x-user-id:', user.id);
    console.log('x-email-account-id:', user.emailAccounts[0]?.id);
    console.log('===============================================\n');
  } else {
    console.log('No user found');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
