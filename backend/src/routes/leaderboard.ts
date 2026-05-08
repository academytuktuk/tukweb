import { Router } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();

// Position benchmarks
const POS_BENCHMARKS: Record<number, number> = {
  1: 29.9, 2: 32.3, 3: 28.9, 4: 27.0, 5: 22.4, 6: 19.1, 7: 14.1,
};

// ─── TUKTUK LEADERBOARD ─────────────────────────────────────────────────────
// HALL OF SHAME: Rank #1 = most TukTuk (slowest) batter
// TukTuk Score/Inn = SR Impact + Volume Penalty
// SR Impact = avg_balls × (1 − avg_SR/140)
// Volume Penalty = max(0, (posExpected − avg_runs) / 10)
router.get('/tuktuk', async (_req, res) => {
  try {
    // Aggregate per player
    const allInnings = await prisma.battingInnings.findMany({
      include: { player: true },
    });

    // Group by player
    const playerMap = new Map<number, {
      player: any;
      allInnings: any[];
    }>();

    for (const inning of allInnings) {
      if (!playerMap.has(inning.playerId)) {
        playerMap.set(inning.playerId, { player: inning.player, allInnings: [] });
      }
      playerMap.get(inning.playerId)!.allInnings.push(inning);
    }

    const rows = [];
    for (const [, data] of playerMap) {
      const { player, allInnings: playerAllInnings } = data;
      
      const totalCount = playerAllInnings.length;
      const top7Innings = playerAllInnings.filter((i: any) => i.position >= 1 && i.position <= 7);
      const top7Count = top7Innings.length;
      
      let playerInnings = top7Innings;
      
      // If a batter plays mostly top order (>= 85% in top 7), include all their innings (even >= 8)
      if (totalCount > 0 && (top7Count / totalCount) >= 0.85) {
        playerInnings = playerAllInnings;
      }
      
      const count = playerInnings.length;
      
      // Filter: Minimum 6 innings required for the leaderboard
      if (count < 6) continue;

      const totalRuns = playerInnings.reduce((s, i) => s + i.runs, 0);
      const totalBalls = playerInnings.reduce((s, i) => s + i.balls, 0);
      const avgRuns = totalRuns / count;
      const avgBalls = totalBalls / count;
      const avgSR = totalBalls > 0 ? (totalRuns / totalBalls) * 100 : 0;

      // Dominant position (most common)
      const posCounts: Record<number, number> = {};
      for (const i of playerInnings) {
        posCounts[i.position] = (posCounts[i.position] || 0) + 1;
      }
      const dominantPos = parseInt(
        Object.entries(posCounts).sort((a, b) => b[1] - a[1])[0][0]
      );
      const posExpected = POS_BENCHMARKS[dominantPos] ?? 20;

      const srImpact = avgBalls * (1 - avgSR / 140);
      const volumePenalty = Math.max(0, (posExpected - avgRuns) / 10);
      const tuktukScore = srImpact + volumePenalty;

      rows.push({
        playerId: player.id,
        name: player.name,
        team: player.team,
        innings: count,
        totalRuns,
        totalBalls,
        avgRuns: Math.round(avgRuns * 10) / 10,
        avgBalls: Math.round(avgBalls * 10) / 10,
        avgSR: Math.round(avgSR * 10) / 10,
        tuktukScore: Math.round(tuktukScore * 100) / 100,
      });
    }

    // Sort highest TukTuk Score first. If tied, prioritize player with fewer runs.
    rows.sort((a, b) => {
      if (b.tuktukScore === a.tuktukScore) {
        return a.totalRuns - b.totalRuns;
      }
      return b.tuktukScore - a.tuktukScore;
    });
    const ranked = rows.map((r, i) => ({ ...r, rank: i + 1 }));

    res.json({ top10: ranked.slice(0, 10), full: ranked });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch TukTuk leaderboard' });
  }
});

// ─── RUN MACHINE LEADERBOARD ──────────────────────────────────────────────────────
// HALL OF SHAME: Rank #1 = most expensive / wicketless bowler
// Run Machine Score/Over = Economy Impact + Wicket Drought
// Economy Impact = avg_runs_per_over − 8.5
// Wicket Drought = max(0, (0.25 − avg_wkts_per_over) × 3)
router.get('/run-machine', async (_req, res) => {
  try {
    const spells = await prisma.bowlingSpell.findMany({
      include: { player: true },
    });

    const playerMap = new Map<number, {
      player: any;
      spells: any[];
    }>();

    for (const spell of spells) {
      if (!playerMap.has(spell.playerId)) {
        playerMap.set(spell.playerId, { player: spell.player, spells: [] });
      }
      playerMap.get(spell.playerId)!.spells.push(spell);
    }

    const rows = [];
    for (const [, data] of playerMap) {
      const { player, spells: playerSpells } = data;
      let totalBalls = 0;
      for (const sp of playerSpells) {
        const o = Math.floor(sp.overs);
        const b = Math.round((sp.overs - o) * 10);
        totalBalls += (o * 6) + b;
      }
      const totalOvers = Math.floor(totalBalls / 6) + (totalBalls % 6) / 10;

      const totalRuns = playerSpells.reduce((s, sp) => s + sp.runsConceded, 0);
      const totalWickets = playerSpells.reduce((s, sp) => s + sp.wickets, 0);

      if (playerSpells.length < 4 || totalOvers < 8) continue; // Minimum 4 innings and 8 overs to qualify

      const economy = totalBalls > 0 ? (totalRuns / totalBalls) * 6 : 0;
      const wktsPerOver = totalBalls > 0 ? (totalWickets / totalBalls) * 6 : 0;
      const economyImpact = economy - 8.5;
      const wicketDrought = (0.25 - wktsPerOver) * 10;
      const runMachineScore = economyImpact + wicketDrought;

      rows.push({
        playerId: player.id,
        name: player.name,
        team: player.team,
        innings: playerSpells.length,
        totalOvers: Math.round(totalOvers * 10) / 10,
        totalRuns,
        totalWickets,
        economy: Math.round(economy * 100) / 100,
        wktsPerOver: Math.round(wktsPerOver * 100) / 100,
        runMachineScore: Math.round(runMachineScore * 100) / 100,
      });
    }

    rows.sort((a, b) => b.runMachineScore - a.runMachineScore);
    const ranked = rows.map((r, i) => ({ ...r, rank: i + 1 }));

    res.json({ top10: ranked.slice(0, 10), full: ranked });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch Run Machine leaderboard' });
  }
});

// ─── TUKTUK HALL OF FAME ──────────────────────────────────────────────────────
// Top 3 players who scored exactly 1, 2, or 3 runs while facing the most balls, plus search
router.get('/tuktuk-hall-of-fame', async (req, res) => {
  try {
    const { runs, player } = req.query;

    if (runs || player) {
      const whereClause: any = {};
      if (runs) {
        const parsedRuns = parseInt(runs as string);
        if (!isNaN(parsedRuns)) whereClause.runs = parsedRuns;
      }
      if (player) {
        whereClause.player = { name: { contains: player as string } };
      }

      const innings = await prisma.battingInnings.findMany({
        where: whereClause,
        include: { player: true },
        orderBy: { balls: 'desc' },
        take: 20,
      });

      const results = innings.map((i, rank) => ({
        rank: rank + 1,
        playerId: i.player.id,
        name: i.player.name,
        team: i.player.team,
        runs: i.runs,
        balls: i.balls,
        strikeRate: i.strikeRate,
      }));

      return res.json({ searchResults: results });
    }

    // Default top 3 logic
    const getTopForRuns = async (runs: number) => {
      const innings = await prisma.battingInnings.findMany({
        where: { runs },
        include: { player: true },
        orderBy: { balls: 'desc' },
        take: 3,
      });
      return innings.map((i, rank) => ({
        rank: rank + 1,
        playerId: i.player.id,
        name: i.player.name,
        team: i.player.team,
        runs: i.runs,
        balls: i.balls,
        strikeRate: i.strikeRate,
      }));
    };

    const [oneRun, twoRuns, threeRuns] = await Promise.all([
      getTopForRuns(1),
      getTopForRuns(2),
      getTopForRuns(3),
    ]);

    res.json({
      oneRun,
      twoRuns,
      threeRuns,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch TukTuk Hall of Fame' });
  }
});

export default router;
