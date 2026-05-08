const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  await prisma.processedMatch.deleteMany({ where: { matchId: '151856' } });
  console.log('Deleted 151856 from processedMatch');
}
main().finally(() => prisma.$disconnect());
