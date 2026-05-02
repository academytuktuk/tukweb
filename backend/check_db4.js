const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Qualified Batting:', await prisma.battingInnings.count({ where: { isQualified: true } }));
  console.log('Qualified Bowling:', await prisma.bowlingSpell.count({ where: { isQualified: true } }));
}

main().finally(() => prisma.$disconnect());
