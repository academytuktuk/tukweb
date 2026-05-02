const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const innings = await prisma.battingInnings.groupBy({
    by: ['playerId'],
    _count: { matchId: true },
    orderBy: { _count: { matchId: 'desc' } },
    take: 5
  });
  console.log('Top players by innings count:', innings);

  const spells = await prisma.bowlingSpell.groupBy({
    by: ['playerId'],
    _count: { matchId: true },
    orderBy: { _count: { matchId: 'desc' } },
    take: 5
  });
  console.log('Top players by spells count:', spells);
}

main().finally(() => prisma.$disconnect());
