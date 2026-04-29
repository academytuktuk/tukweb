import cron from 'node-cron';
import axios from 'axios';
import { prisma } from '../lib/prisma';

// ─── CONFIG ─────────────────────────────────────────────────────────────────
// TODO: After first run, replace this with the real IPL 2026 series ID from
// GET /series/v1/list?offset=0 on the Cricbuzz RapidAPI.
const IPL_SERIES_ID = process.env.IPL_SERIES_ID || '';

const rapidApiHeaders = {
  'x-rapidapi-key': process.env.RAPIDAPI_KEY!,
  'x-rapidapi-host': process.env.RAPIDAPI_HOST!,
};

// Position benchmarks for TukTuk Score
const POS_BENCHMARKS: Record<number, number> = {
  1: 29.9,
  2: 32.3,
  3: 28.9,
  4: 27.0,
  5: 22.4,
  6: 19.1,
  7: 14.1,
};

// IPL team abbreviations (used to filter teams)
const IPL_TEAMS = ['MI', 'CSK', 'RCB', 'KKR', 'DC', 'PBKS', 'RR', 'SRH', 'GT', 'LSG'];

// ─── API HELPERS ────────────────────────────────────────────────────────────
async function fetchSeriesMatches(seriesId: string) {
  const res = await axios.get(
    `https://cricbuzz-cricket.p.rapidapi.com/series/v1/${seriesId}`,
    { headers: rapidApiHeaders }
  );
  return res.data;
}

async function fetchRecentMatches() {
  const res = await axios.get(
    'https://cricbuzz-cricket.p.rapidapi.com/matches/v1/recent',
    { headers: rapidApiHeaders }
  );
  return res.data;
}

async function fetchScorecard(matchId: string) {
  const res = await axios.get(
    `https://cricbuzz-cricket.p.rapidapi.com/mcenter/v1/${matchId}/scard`,
    { headers: rapidApiHeaders }
  );
  return res.data;
}


// ─── PROCESS ONE MATCH ──────────────────────────────────────────────────────
async function processMatch(matchId: string, matchInfo: any): Promise<void> {
  const scorecard = await fetchScorecard(matchId);

  // Cricbuzz scorecard structure
  const innings: any[] = scorecard?.scorecard || [];
  if (!innings.length) return;

  let matchDotBalls = 0;

  for (const inning of innings) {
    const battingTeam: string = inning?.batteamsname || '';
    const team1 = matchInfo?.team1?.teamSName || '';
    const team2 = matchInfo?.team2?.teamSName || '';
    
    let bowlingTeam = '';
    if (battingTeam === team1) bowlingTeam = team2;
    else if (battingTeam === team2) bowlingTeam = team1;

    const batsmen: any[] = inning?.batsman || [];
    const bowlers: any[] = inning?.bowler || [];

    let inningBallsFaced = parseInt(inning?.ballnbr) || 0;
    let inningRunsBatted = parseInt(inning?.score) || 0;
    let inningDotBalls = 0;

    for (let i = 0; i < batsmen.length; i++) {
      const batter = batsmen[i];
      const position = i + 1;
      const name: string = batter?.name || '';
      const runs: number = parseInt(batter?.runs) || 0;
      const balls: number = parseInt(batter?.balls) || 0;
      const fours: number = parseInt(batter?.fours) || 0;
      const sixes: number = parseInt(batter?.sixes) || 0;

      if (!name || balls === 0) continue;

      const sr = balls > 0 ? (runs / balls) * 100 : 0;
      const dotBalls = 0; // Handled by Cricsheet daily sync now

      // Team totals are now taken from inning.score / inning.ballnbr
      // inningBallsFaced += balls;
      // inningRunsBatted += runs;

      // Only record positions 1–7 for leaderboard
      if (position >= 1 && position <= 7) {
        // Upsert player
        const player = await prisma.player.upsert({
          where: { name },
          create: { name, team: battingTeam, role: 'batter' },
          update: { team: battingTeam },
        });

        // Upsert batting innings
        await prisma.battingInnings.upsert({
          where: { playerId_matchId: { playerId: player.id, matchId } },
          create: {
            playerId: player.id,
            matchId,
            position,
            runs,
            balls,
            strikeRate: sr,
            dotBalls,
            fours,
            sixes,
            isQualified: false,
          },
          update: { runs, balls, strikeRate: sr, dotBalls, fours, sixes },
        });
      }
    }

    // ── BOWLING ─────────────────────────────────────────────────────────────
    let inningOversBowled = 0;
    let inningRunsConceded = 0; // summed from bowlers (consistent with individual economy calc)
    let inningWickets = 0;

    for (const bowler of bowlers) {
      const name: string = bowler?.name || '';
      const oversStr: string = bowler?.overs || '0';
      const runsConceded: number = parseInt(bowler?.runs) || 0;
      const wickets: number = parseInt(bowler?.wickets) || 0;

      if (!name) continue;

      // Convert "3.4" overs to decimal (3 full overs + 4 balls = 3.667)
      const parts = oversStr.split('.');
      const fullOvers = parseInt(parts[0]) || 0;
      const extraBalls = parseInt(parts[1]) || 0;
      const overs = fullOvers + extraBalls / 6;
      const economy = overs > 0 ? runsConceded / overs : 0;

      inningOversBowled += overs;
      inningRunsConceded += runsConceded;
      inningWickets += wickets;

      // Upsert player
      const player = await prisma.player.upsert({
        where: { name },
        create: { name, team: bowlingTeam, role: 'bowler' },
        update: { team: bowlingTeam },
      });

      // Upsert bowling spell
      await prisma.bowlingSpell.upsert({
        where: { playerId_matchId: { playerId: player.id, matchId } },
        create: { playerId: player.id, matchId, overs, runsConceded, wickets, economy },
        update: { overs, runsConceded, wickets, economy },
      });
    }

    // ── TEAM MATCH ──────────────────────────────────────────────────────────
    // Batting side of this inning = batting team's TukTuk data
    await prisma.teamMatch.upsert({
      where: { team_matchId: { team: battingTeam, matchId } },
      create: {
        team: battingTeam,
        matchId,
        ballsFaced: inningBallsFaced,
        runsBatted: inningRunsBatted,
        dotBallsFaced: 0,
        oversBowled: 0,
        runsConceded: 0,
        wicketsTaken: 0,
      },
      update: {
        ballsFaced: inningBallsFaced,
        runsBatted: inningRunsBatted,
        dotBallsFaced: 0,
      },
    });

    // Bowling side of this inning = bowling team's Dinda data
    const existingBowlingTeam = await prisma.teamMatch.findUnique({
      where: { team_matchId: { team: bowlingTeam, matchId } },
    });
    if (existingBowlingTeam) {
      await prisma.teamMatch.update({
        where: { team_matchId: { team: bowlingTeam, matchId } },
        data: {
          oversBowled: inningOversBowled,
          runsConceded: inningRunsConceded,
          wicketsTaken: inningWickets,
        },
      });
    } else {
      await prisma.teamMatch.create({
        data: {
          team: bowlingTeam,
          matchId,
          ballsFaced: 0,
          runsBatted: 0,
          dotBallsFaced: 0,
          oversBowled: inningOversBowled,
          runsConceded: inningRunsConceded,
          wicketsTaken: inningWickets,
        },
      });
    }
  }

  // ── UPDATE TREE TRACKER ──────────────────────────────────────────────────
  await prisma.treeTracker.upsert({
    where: { id: 1 },
    create: { id: 1, totalDotBalls: matchDotBalls },
    update: { totalDotBalls: { increment: matchDotBalls } },
  });

  // ── MARK MATCH AS PROCESSED ──────────────────────────────────────────────
  await prisma.processedMatch.create({ data: { matchId } });

  // ── UPDATE isQualified FLAGS ─────────────────────────────────────────────
  await recomputeQualifiedPlayers();

  console.log(`✅ Processed match ${matchId} — ${matchDotBalls} dot balls added`);
}

// ─── RECOMPUTE isQualified ───────────────────────────────────────────────────
async function recomputeQualifiedPlayers(): Promise<void> {
  // Count innings per player
  const counts = await prisma.battingInnings.groupBy({
    by: ['playerId'],
    _count: { matchId: true },
  });

  for (const row of counts) {
    const qualified = row._count.matchId >= 4;
    await prisma.battingInnings.updateMany({
      where: { playerId: row.playerId },
      data: { isQualified: qualified },
    });
  }
}

// ─── MAIN SYNC FUNCTION ──────────────────────────────────────────────────────
async function syncMatches(): Promise<void> {
  if (!process.env.RAPIDAPI_KEY) {
    console.warn('⚠️  RAPIDAPI_KEY not set — skipping sync');
    return;
  }

  try {
    console.log('🔄 Running match sync...');
    const allMatches: any[] = [];

    if (IPL_SERIES_ID) {
      console.log(`📡 Fetching all matches for series ${IPL_SERIES_ID}...`);
      const data = await fetchSeriesMatches(IPL_SERIES_ID);
      const matchDetails = data?.matchDetails || [];
      for (const md of matchDetails) {
        const matches = md?.matchDetailsMap?.match || [];
        for (const m of matches) {
          if (m?.matchInfo) allMatches.push(m.matchInfo);
        }
      }
    } else {
      console.log('📡 Fetching recent matches...');
      const data = await fetchRecentMatches();
      const typeMatches: any[] = data?.typeMatches || [];
      for (const typeMatch of typeMatches) {
        const seriesMatches: any[] = typeMatch?.seriesMatches || [];
        for (const sm of seriesMatches) {
          const matches: any[] = sm?.seriesAdWrapper?.matches || [];
          for (const m of matches) {
            if (m?.matchInfo) allMatches.push(m.matchInfo);
          }
        }
      }
    }

    // Filter IPL matches
    const iplMatches = allMatches.filter((m) => {
      if (!m) return false;
      const seriesId = String(m?.seriesId || '');
      const seriesName: string = m?.seriesName || '';
      // If series ID is set, use it; otherwise fall back to name check
      if (IPL_SERIES_ID) return seriesId === IPL_SERIES_ID;
      
      const isIpl = seriesName.toLowerCase().includes('indian premier league') || 
                    seriesName.toLowerCase().includes('ipl');
      const is2026 = seriesName.includes('2026');
      
      return isIpl && is2026;
    });

    console.log(`Found ${iplMatches.length} IPL matches`);

    for (const match of iplMatches) {
      console.log('Match info:', JSON.stringify(match));
      const matchId = String(match?.matchId || '');
      const state: string = match?.state || '';
      const status: string = match?.status || '';

      if (!matchId) continue;

      // Only process completed matches (not live — scorecard may be incomplete)
      // Change to include 'Live' if you want real-time updates
      if (!['Complete', 'Completed'].includes(state)) {
        console.log(`⏭  Skipping ${matchId} (state: ${state})`);
        continue;
      }

      // Check if already processed
      const alreadyProcessed = await prisma.processedMatch.findUnique({
        where: { matchId },
      });
      if (alreadyProcessed) {
        console.log(`⏭  Already processed: ${matchId}`);
        continue;
      }

      try {
        await processMatch(matchId, match);
      } catch (err) {
        console.error(`❌ Error processing match ${matchId}:`, err);
      }
    }

    console.log('✅ Sync complete');
  } catch (err) {
    console.error('❌ Sync error:', err);
  }
}

// ─── CRON JOB ───────────────────────────────────────────────────────────────
export function startMatchSyncJob(): void {
  // Run every 10 minutes
  cron.schedule('*/10 * * * *', () => {
    syncMatches();
  });

  // Also run immediately on startup
  syncMatches();
  console.log('⏱  Match sync cron started (every 10 minutes)');
}
