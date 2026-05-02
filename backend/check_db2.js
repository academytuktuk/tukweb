const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Players:', await prisma.player.count());
  console.log('Matches:', await prisma.cricketMatch.count());
  console.log('Performances:', await prisma.performance.count());
}

main().finally(() => prisma.$disconnect());
