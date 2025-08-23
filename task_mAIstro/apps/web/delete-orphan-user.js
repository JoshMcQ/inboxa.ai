const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function deleteOrphanUser() {
  try {
    console.log('🗑️ Deleting orphaned user record...');
    
    const result = await prisma.user.delete({
      where: {
        id: 'cmdxj5k7u0000t2j40h9ymjqu'
      }
    });
    
    console.log('✅ Successfully deleted user:', result.email);
    
  } catch (error) {
    console.error('❌ Error deleting user:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

deleteOrphanUser();
