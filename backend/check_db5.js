const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const bat = await prisma.battingInnings.count({ where: { isQualified: true } });
  console.log('Qualified Batting:', bat);
}

main().finally(() => prisma.$disconnect());
