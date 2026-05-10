import cron from 'node-cron';
import { prisma } from '../lib/prisma';

// ── Position benchmarks (mirrors leaderboard.ts) ────────────────────────────
const POS_BENCHMARKS: Record<number, number> = {
  1: 29.9, 2: 32.3, 3: 28.9, 4: 27.0, 5: 22.4, 6: 19.1, 7: 14.1,
};

const AUTO_POTD_DELAY_MS = 15 * 60 * 1000; // 15 minutes

// ── Scoring formulas ─────────────────────────────────────────────────────────
function tukTukScoreForInning(runs: number, balls: number, position: number): number {
  const sr = balls > 0 ? (runs / balls) * 100 : 0;
  const posExpected = POS_BENCHMARKS[Math.min(position, 7)] ?? 20;
  const srImpact = balls * (1 - sr / 140);
  const volumePenalty = Math.max(0, (posExpected - runs) / 10);
  return srImpact + volumePenalty;
}

function runMachineScoreForSpell(overs: number, runsConceded: number, wickets: number): number {
  const totalBalls = Math.floor(overs) * 6 + Math.round((overs % 1) * 10);
  const economy = totalBalls > 0 ? (runsConceded / totalBalls) * 6 : 0;
  const wktsPerOver = totalBalls > 0 ? (wickets / totalBalls) * 6 : 0;
  return (economy - 8.5) + (0.25 - wktsPerOver) * 10;
}

// ── Today boundary (UTC midnight) ────────────────────────────────────────────
function todayStart(): Date {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

// ── Guard checks ─────────────────────────────────────────────────────────────
async function adminPostedTodayFor(type: string): Promise<boolean> {
  const record = await prisma.playerOfDay.findFirst({
    where: { type, date: { gte: todayStart() }, NOT: { imageUrl: 'auto' } },
    orderBy: { date: 'desc' },
  });
  return record !== null;
}

async function autoPotdExistsFor(type: string, matchId: string): Promise<boolean> {
  const all = await prisma.playerOfDay.findMany({
    where: { type, date: { gte: todayStart() }, imageUrl: 'auto' },
  });
  for (const r of all) {
    try {
      if (JSON.parse(r.stats).matchId === matchId) return true;
    } catch {}
  }
  return false;
}

// ── Core: generate auto-POTD for a specific matchId ─────────────────────────
export async function generateAutoPotdForMatch(matchId: string): Promise<{
  tuktuk: string | null;
  runMachine: string | null;
}> {
  const result = { tuktuk: null as string | null, runMachine: null as string | null };

  // ── TukTuk (batter) ─────────────────────────────────────────────────────
  if (!(await adminPostedTodayFor('tuktuk')) && !(await autoPotdExistsFor('tuktuk', matchId))) {
    const innings = await prisma.battingInnings.findMany({
      where: { matchId, balls: { gt: 0 }, position: { lte: 7 } },
      include: { player: true },
    });

    if (innings.length > 0) {
      const scored = innings
        .map((i) => ({ innings: i, score: tukTukScoreForInning(i.runs, i.balls, i.position) }))
        .sort((a, b) => b.score - a.score);

      const { innings: wi, score } = scored[0];
      const sr = wi.balls > 0 ? ((wi.runs / wi.balls) * 100).toFixed(1) : '0.0';

      await prisma.playerOfDay.create({
        data: {
          type: 'tuktuk',
          imageUrl: 'auto',
          playerName: wi.player.name,
          stats: JSON.stringify({
            matchId,
            runs: wi.runs,
            balls: wi.balls,
            sr,
            position: wi.position,
            tuktukScore: Math.round(score * 100) / 100,
            team: wi.player.team,
            source: 'auto',
          }),
        },
      });
      result.tuktuk = wi.player.name;
      console.log(`🤖 [Auto POTD] TukTuk: ${wi.player.name} — ${wi.runs}(${wi.balls}) SR ${sr}`);
    }
  } else {
    result.tuktuk = 'skipped'; // admin uploaded or already exists
  }

  // ── Run Machine (bowler) ─────────────────────────────────────────────────
  if (!(await adminPostedTodayFor('run-machine')) && !(await autoPotdExistsFor('run-machine', matchId))) {
    const spells = await prisma.bowlingSpell.findMany({
      where: { matchId, overs: { gt: 0 } },
      include: { player: true },
    });

    if (spells.length > 0) {
      const scored = spells
        .map((s) => ({ spell: s, score: runMachineScoreForSpell(s.overs, s.runsConceded, s.wickets) }))
        .sort((a, b) => b.score - a.score);

      const { spell: ws, score } = scored[0];
      const totalBalls = Math.floor(ws.overs) * 6 + Math.round((ws.overs % 1) * 10);
      const economy = totalBalls > 0 ? ((ws.runsConceded / totalBalls) * 6).toFixed(2) : '0.00';
      const fullOvers = Math.floor(ws.overs);
      const partBalls = Math.round((ws.overs % 1) * 10);
      const spellStr = `${fullOvers}.${partBalls}-0-${ws.runsConceded}-${ws.wickets}`;

      await prisma.playerOfDay.create({
        data: {
          type: 'run-machine',
          imageUrl: 'auto',
          playerName: ws.player.name,
          stats: JSON.stringify({
            matchId,
            overs: ws.overs,
            runsConceded: ws.runsConceded,
            wickets: ws.wickets,
            economy,
            spell: spellStr,
            runMachineScore: Math.round(score * 100) / 100,
            team: ws.player.team,
            source: 'auto',
          }),
        },
      });
      result.runMachine = ws.player.name;
      console.log(`🤖 [Auto POTD] Run Machine: ${ws.player.name} — ${spellStr} Eco ${economy}`);
    }
  } else {
    result.runMachine = 'skipped';
  }

  return result;
}

// ── Scheduled check: look at innings created in the last 3h (post 15-min delay)
async function runAutoPotdCron(): Promise<void> {
  try {
    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000);
    const delayThreshold = new Date(Date.now() - AUTO_POTD_DELAY_MS);

    const groups = await prisma.battingInnings.groupBy({
      by: ['matchId'],
      where: { createdAt: { gte: threeHoursAgo, lte: delayThreshold } },
    });

    for (const { matchId } of groups) {
      await generateAutoPotdForMatch(matchId);
    }
  } catch (err) {
    console.error('❌ [Auto POTD Cron] Error:', err);
  }
}

// ── Startup backfill: find the most recent processed match today
// (catches matches processed before this code was deployed, or after a restart)
async function runStartupBackfill(): Promise<void> {
  try {
    // Find the most recent matchId that has innings from today (IST = UTC+5:30)
    // Use a 24-hour window to be safe
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const groups = await prisma.battingInnings.groupBy({
      by: ['matchId'],
      where: { createdAt: { gte: oneDayAgo } },
      _max: { createdAt: true },
      orderBy: { _max: { createdAt: 'desc' } },
    });

    if (groups.length === 0) {
      console.log('🤖 [Auto POTD Backfill] No recent match innings found.');
      return;
    }

    // Only process the most recent match (top of list)
    const mostRecentMatchId = groups[0].matchId;
    const lastCreatedAt = groups[0]._max.createdAt!;

    // Only fire if the match was processed at least 15 min ago
    if (Date.now() - lastCreatedAt.getTime() < AUTO_POTD_DELAY_MS) {
      console.log(`🤖 [Auto POTD Backfill] Match ${mostRecentMatchId} processed < 15 min ago, waiting...`);
      return;
    }

    console.log(`🤖 [Auto POTD Backfill] Checking match ${mostRecentMatchId}...`);
    const result = await generateAutoPotdForMatch(mostRecentMatchId);
    console.log(`🤖 [Auto POTD Backfill] Done. TukTuk: ${result.tuktuk}, RunMachine: ${result.runMachine}`);
  } catch (err) {
    console.error('❌ [Auto POTD Backfill] Error:', err);
  }
}

// ── Start both jobs ──────────────────────────────────────────────────────────
export function startAutoPotdJob(): void {
  // Every 5 minutes: check for recent matches
  cron.schedule('*/5 * * * *', () => {
    runAutoPotdCron();
  });

  // Run backfill immediately on startup (catches missed matches after deploy/restart)
  setTimeout(() => runStartupBackfill(), 5000); // 5s delay to let DB connect

  console.log('🤖  Auto POTD cron started (every 5 min + startup backfill)');
}
