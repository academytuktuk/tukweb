import cron from 'node-cron';
import { prisma } from '../lib/prisma';

// ── Position benchmarks (mirrors leaderboard.ts) ────────────────────────────
const POS_BENCHMARKS: Record<number, number> = {
  1: 29.9, 2: 32.3, 3: 28.9, 4: 27.0, 5: 22.4, 6: 19.1, 7: 14.1,
};

const AUTO_POTD_DELAY_MS = 15 * 60 * 1000; // 15 minutes after match processes

// ── Compute per-innings TukTuk score (same formula as leaderboard) ───────────
function tukTukScoreForInning(
  runs: number,
  balls: number,
  position: number
): number {
  const sr = balls > 0 ? (runs / balls) * 100 : 0;
  const posExpected = POS_BENCHMARKS[Math.min(position, 7)] ?? 20;
  const srImpact = balls * (1 - sr / 140);
  const volumePenalty = Math.max(0, (posExpected - runs) / 10);
  return srImpact + volumePenalty;
}

// ── Compute per-spell Run Machine score (same formula as leaderboard) ────────
function runMachineScoreForSpell(
  overs: number,
  runsConceded: number,
  wickets: number
): number {
  const totalBalls = Math.floor(overs) * 6 + Math.round((overs % 1) * 10);
  const economy = totalBalls > 0 ? (runsConceded / totalBalls) * 6 : 0;
  const wktsPerOver = totalBalls > 0 ? (wickets / totalBalls) * 6 : 0;
  const economyImpact = economy - 8.5;
  const wicketDrought = (0.25 - wktsPerOver) * 10;
  return economyImpact + wicketDrought;
}

// ── Midnight UTC for comparing "today" ──────────────────────────────────────
function todayStart(): Date {
  // Use IST midnight-ish — IPL matches are in IST, use UTC+5:30
  // But simpler: just compare by UTC date of the POTD creation
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

// ── Check if admin has already posted a POTD for today ──────────────────────
async function adminPostedTodayFor(type: string): Promise<boolean> {
  const today = todayStart();
  const record = await prisma.playerOfDay.findFirst({
    where: {
      type,
      date: { gte: today },
      // Admin cards have a real image path; auto cards have imageUrl = 'auto'
      NOT: { imageUrl: 'auto' },
    },
    orderBy: { date: 'desc' },
  });
  return record !== null;
}

// ── Check if auto-POTD was already created today for this match ──────────────
async function autoPotdCreatedTodayFor(type: string, matchId: string): Promise<boolean> {
  const today = todayStart();
  const all = await prisma.playerOfDay.findMany({
    where: { type, date: { gte: today }, imageUrl: 'auto' },
  });
  for (const r of all) {
    try {
      const parsed = JSON.parse(r.stats);
      if (parsed.matchId === matchId) return true;
    } catch {}
  }
  return false;
}

// ── Main auto-POTD logic ─────────────────────────────────────────────────────
async function runAutoPotd(): Promise<void> {
  try {
    // Discover recently-processed matches by looking at BattingInnings.createdAt.
    // We want innings created between 3 hours ago and 15 minutes ago so we give
    // admins 15 minutes to upload a card before the auto-card kicks in.
    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000);
    const delayThreshold = new Date(Date.now() - AUTO_POTD_DELAY_MS);

    const recentBattingGroups = await prisma.battingInnings.groupBy({
      by: ['matchId'],
      where: {
        createdAt: {
          gte: threeHoursAgo,
          lte: delayThreshold,
        },
      },
    });

    if (recentBattingGroups.length === 0) return;

    for (const group of recentBattingGroups) {
      const matchId = group.matchId;

      // ── TukTuk (batter) POTD ──────────────────────────────────────────────
      const adminHasTuktuk = await adminPostedTodayFor('tuktuk');
      const autoTuktukDone = await autoPotdCreatedTodayFor('tuktuk', matchId);

      if (!adminHasTuktuk && !autoTuktukDone) {
        // Find all batting innings from this match (top 7 positions, min 1 ball)
        const innings = await prisma.battingInnings.findMany({
          where: { matchId, balls: { gt: 0 }, position: { lte: 7 } },
          include: { player: true },
        });

        if (innings.length > 0) {
          // Score each innings and pick the worst (highest TukTuk score)
          const scored = innings.map((i) => ({
            innings: i,
            score: tukTukScoreForInning(i.runs, i.balls, i.position),
          }));
          scored.sort((a, b) => b.score - a.score);

          const worst = scored[0];
          const { innings: wi, score } = worst;
          const sr = wi.balls > 0 ? ((wi.runs / wi.balls) * 100).toFixed(1) : '0.0';

          const statsJson = JSON.stringify({
            matchId,
            runs: wi.runs,
            balls: wi.balls,
            sr,
            position: wi.position,
            tuktukScore: Math.round(score * 100) / 100,
            team: wi.player.team,
            source: 'auto',
          });

          await prisma.playerOfDay.create({
            data: {
              type: 'tuktuk',
              imageUrl: 'auto',
              playerName: wi.player.name,
              stats: statsJson,
            },
          });

          console.log(
            `🤖 [Auto POTD] TukTuk: ${wi.player.name} (${wi.runs}(${wi.balls}), SR ${sr}) — match ${matchId}`
          );
        }
      }

      // ── Run Machine (bowler) POTD ─────────────────────────────────────────
      const adminHasRunMachine = await adminPostedTodayFor('run-machine');
      const autoRunMachineDone = await autoPotdCreatedTodayFor('run-machine', matchId);

      if (!adminHasRunMachine && !autoRunMachineDone) {
        // Find all bowling spells from this match
        const spells = await prisma.bowlingSpell.findMany({
          where: { matchId, overs: { gt: 0 } },
          include: { player: true },
        });

        if (spells.length > 0) {
          const scored = spells.map((s) => ({
            spell: s,
            score: runMachineScoreForSpell(s.overs, s.runsConceded, s.wickets),
          }));
          scored.sort((a, b) => b.score - a.score);

          const worst = scored[0];
          const { spell: ws, score } = worst;
          const totalBalls =
            Math.floor(ws.overs) * 6 + Math.round((ws.overs % 1) * 10);
          const economy =
            totalBalls > 0
              ? ((ws.runsConceded / totalBalls) * 6).toFixed(2)
              : '0.00';

          // Format spell as "4.0-0-52-1"
          const fullOvers = Math.floor(ws.overs);
          const partBalls = Math.round((ws.overs % 1) * 10);
          const spellStr = `${fullOvers}.${partBalls}-0-${ws.runsConceded}-${ws.wickets}`;

          const statsJson = JSON.stringify({
            matchId,
            overs: ws.overs,
            runsConceded: ws.runsConceded,
            wickets: ws.wickets,
            economy,
            spell: spellStr,
            runMachineScore: Math.round(score * 100) / 100,
            team: ws.player.team,
            source: 'auto',
          });

          await prisma.playerOfDay.create({
            data: {
              type: 'run-machine',
              imageUrl: 'auto',
              playerName: ws.player.name,
              stats: statsJson,
            },
          });

          console.log(
            `🤖 [Auto POTD] Run Machine: ${ws.player.name} (${spellStr}, Eco ${economy}) — match ${matchId}`
          );
        }
      }
    }
  } catch (err) {
    console.error('❌ [Auto POTD] Error:', err);
  }
}

// ── Cron: check every 5 minutes ──────────────────────────────────────────────
export function startAutoPotdJob(): void {
  cron.schedule('*/5 * * * *', () => {
    runAutoPotd();
  });

  // Also run once immediately on startup (handles restarts after a match)
  runAutoPotd();
  console.log('🤖  Auto POTD cron started (checks every 5 minutes, fires 15 min after match)');
}
