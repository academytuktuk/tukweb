import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with mock IPL data...');

  // 1. Create Players
  const players = [
    { name: 'KL Rahul', team: 'LSG', role: 'batter' },
    { name: 'Virat Kohli', team: 'RCB', role: 'batter' },
    { name: 'MS Dhoni', team: 'CSK', role: 'batter' },
    { name: 'David Warner', team: 'DC', role: 'batter' },
    { name: 'Hardik Pandya', team: 'MI', role: 'batter' },
    { name: 'Harshal Patel', team: 'PBKS', role: 'bowler' },
    { name: 'Tushar Deshpande', team: 'CSK', role: 'bowler' },
    { name: 'Mohammed Siraj', team: 'RCB', role: 'bowler' },
    { name: 'Shardul Thakur', team: 'CSK', role: 'bowler' },
    { name: 'Umesh Yadav', team: 'GT', role: 'bowler' },
  ];

  for (const p of players) {
    await prisma.player.upsert({
      where: { name: p.name },
      create: p,
      update: p,
    });
  }

  // Fetch created players
  const pList = await prisma.player.findMany();
  const getPId = (name: string) => pList.find((p) => p.name === name)!.id;

  // 2. Create Batting Innings (TukTuk qualifiers - min 4 innings)
  const matches = ['m1', 'm2', 'm3', 'm4', 'm5'];
  
  // KL Rahul (High TukTuk score: slow SR, high balls)
  for (const m of matches) {
    await prisma.battingInnings.upsert({
      where: { playerId_matchId: { playerId: getPId('KL Rahul'), matchId: m } },
      create: { playerId: getPId('KL Rahul'), matchId: m, position: 1, runs: 45, balls: 40, strikeRate: 112.5, dotBalls: 15, fours: 4, sixes: 0, isQualified: true },
      update: { isQualified: true },
    });
  }

  // Virat Kohli (Moderate TukTuk)
  for (const m of matches) {
    await prisma.battingInnings.upsert({
      where: { playerId_matchId: { playerId: getPId('Virat Kohli'), matchId: m } },
      create: { playerId: getPId('Virat Kohli'), matchId: m, position: 1, runs: 50, balls: 38, strikeRate: 131.5, dotBalls: 10, fours: 5, sixes: 1, isQualified: true },
      update: { isQualified: true },
    });
  }

  // David Warner
  for (const m of matches) {
    await prisma.battingInnings.upsert({
      where: { playerId_matchId: { playerId: getPId('David Warner'), matchId: m } },
      create: { playerId: getPId('David Warner'), matchId: m, position: 1, runs: 30, balls: 28, strikeRate: 107.1, dotBalls: 12, fours: 3, sixes: 0, isQualified: true },
      update: { isQualified: true },
    });
  }

  // Hardik Pandya
  for (const m of matches) {
    await prisma.battingInnings.upsert({
      where: { playerId_matchId: { playerId: getPId('Hardik Pandya'), matchId: m } },
      create: { playerId: getPId('Hardik Pandya'), matchId: m, position: 5, runs: 15, balls: 18, strikeRate: 83.3, dotBalls: 8, fours: 1, sixes: 0, isQualified: true },
      update: { isQualified: true },
    });
  }

  // MS Dhoni
  for (const m of matches) {
    await prisma.battingInnings.upsert({
      where: { playerId_matchId: { playerId: getPId('MS Dhoni'), matchId: m } },
      create: { playerId: getPId('MS Dhoni'), matchId: m, position: 7, runs: 12, balls: 15, strikeRate: 80.0, dotBalls: 6, fours: 1, sixes: 0, isQualified: true },
      update: { isQualified: true },
    });
  }

  // 3. Create Bowling Spells (Dinda qualifiers - min 4 overs total, usually 1 over per match * 4)
  const bMatches = ['bm1', 'bm2', 'bm3', 'bm4'];

  // Harshal Patel (High Dinda: expensive, no wickets)
  for (const m of bMatches) {
    await prisma.bowlingSpell.upsert({
      where: { playerId_matchId: { playerId: getPId('Harshal Patel'), matchId: m } },
      create: { playerId: getPId('Harshal Patel'), matchId: m, overs: 4, runsConceded: 48, wickets: 0, economy: 12.0 },
      update: {},
    });
  }

  // Tushar Deshpande
  for (const m of bMatches) {
    await prisma.bowlingSpell.upsert({
      where: { playerId_matchId: { playerId: getPId('Tushar Deshpande'), matchId: m } },
      create: { playerId: getPId('Tushar Deshpande'), matchId: m, overs: 4, runsConceded: 45, wickets: 0, economy: 11.25 },
      update: {},
    });
  }

  // Mohammed Siraj
  for (const m of bMatches) {
    await prisma.bowlingSpell.upsert({
      where: { playerId_matchId: { playerId: getPId('Mohammed Siraj'), matchId: m } },
      create: { playerId: getPId('Mohammed Siraj'), matchId: m, overs: 4, runsConceded: 40, wickets: 1, economy: 10.0 },
      update: {},
    });
  }

  // Shardul Thakur
  for (const m of bMatches) {
    await prisma.bowlingSpell.upsert({
      where: { playerId_matchId: { playerId: getPId('Shardul Thakur'), matchId: m } },
      create: { playerId: getPId('Shardul Thakur'), matchId: m, overs: 4, runsConceded: 50, wickets: 1, economy: 12.5 },
      update: {},
    });
  }

  // Umesh Yadav
  for (const m of bMatches) {
    await prisma.bowlingSpell.upsert({
      where: { playerId_matchId: { playerId: getPId('Umesh Yadav'), matchId: m } },
      create: { playerId: getPId('Umesh Yadav'), matchId: m, overs: 4, runsConceded: 38, wickets: 0, economy: 9.5 },
      update: {},
    });
  }

  // 4. Create Team Matches (for Team Points Table)
  const teamsData = [
    { team: 'LSG', runsBatted: 800, ballsFaced: 700, dotBallsFaced: 250, oversBowled: 120, runsConceded: 1000, wicketsTaken: 30 },
    { team: 'RCB', runsBatted: 900, ballsFaced: 650, dotBallsFaced: 180, oversBowled: 120, runsConceded: 1150, wicketsTaken: 25 },
    { team: 'CSK', runsBatted: 850, ballsFaced: 680, dotBallsFaced: 200, oversBowled: 120, runsConceded: 1050, wicketsTaken: 35 },
    { team: 'MI', runsBatted: 950, ballsFaced: 600, dotBallsFaced: 150, oversBowled: 120, runsConceded: 950, wicketsTaken: 40 },
    { team: 'DC', runsBatted: 750, ballsFaced: 690, dotBallsFaced: 280, oversBowled: 120, runsConceded: 1200, wicketsTaken: 20 },
    { team: 'PBKS', runsBatted: 820, ballsFaced: 640, dotBallsFaced: 190, oversBowled: 120, runsConceded: 1100, wicketsTaken: 22 },
  ];

  for (const t of teamsData) {
    await prisma.teamMatch.upsert({
      where: { team_matchId: { team: t.team, matchId: 'mock-season' } },
      create: { matchId: 'mock-season', ...t },
      update: { ...t },
    });
  }

  // 5. Tree Tracker
  await prisma.treeTracker.upsert({
    where: { id: 1 },
    create: { id: 1, totalDotBalls: 4500 },
    update: { totalDotBalls: 4500 },
  });

  console.log('✅ Mock data seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
