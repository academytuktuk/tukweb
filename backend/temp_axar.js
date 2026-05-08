const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const p = await prisma.player.findFirst({ where: { name: { contains: 'Axar' } } });
  if (!p) return console.log('not found');
  const inns = await prisma.battingInnings.findMany({ where: { playerId: p.id } });
  console.log('Player:', p.name);
  console.log(inns);
}
main().finally(() => prisma.$disconnect());
