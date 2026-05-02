const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Players:', await prisma.player.count());
  console.log('Matches:', await prisma.match.count());
}

main().finally(() => prisma.$disconnect());
