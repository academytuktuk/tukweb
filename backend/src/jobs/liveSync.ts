import cron from 'node-cron';
import axios from 'axios';
import { prisma } from '../lib/prisma';

const rapidApiHeaders = {
  'x-rapidapi-key': process.env.RAPIDAPI_KEY!,
  'x-rapidapi-host': process.env.RAPIDAPI_HOST!,
};

async function fetchRecentMatches() {
  const res = await axios.get(
    'https://cricbuzz-cricket.p.rapidapi.com/matches/v1/live',
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

async function syncLiveMatch(matchId: string, matchInfo: any) {
  try {
    const scorecard = await fetchScorecard(matchId);
    const inningsList: any[] = scorecard?.scorecard || [];
    if (!inningsList.length) return;

    for (const inning of inningsList) {
      const battingTeam: string = inning?.batteamsname || '';
      const batsmen: any[] = inning?.batsman || [];

      for (let i = 0; i < batsmen.length; i++) {
        const batter = batsmen[i];
        const name: string = batter?.name || '';
        const outdec: string = batter?.outdec || '';
        const runs: number = parseInt(batter?.runs) || 0;
        const balls: number = parseInt(batter?.balls) || 0;
        const fours: number = parseInt(batter?.fours) || 0;
        const sixes: number = parseInt(batter?.sixes) || 0;

        // Skip if no name or no balls faced
        if (!name || balls === 0) continue;

        const sr = balls > 0 ? (runs / balls) * 100 : 0;
        const currentBoundaries = fours + sixes;

        const player = await prisma.player.upsert({
          where: { name },
          create: { name, team: battingTeam, role: 'batter' },
          update: { team: battingTeam },
        });

        // Find existing innings
        const existingInnings = await prisma.battingInnings.findUnique({
          where: { playerId_matchId: { playerId: player.id, matchId } }
        });

        if (existingInnings) {
          let currentDrought = existingInnings.currentBoundaryDrought;
          
          if (currentBoundaries > existingInnings.lastBoundaries) {
            // A boundary was hit since the last poll! Reset drought.
            currentDrought = 0;
          } else if (balls > existingInnings.lastBallsFaced) {
            // No boundary hit, add the difference in balls faced
            currentDrought += (balls - existingInnings.lastBallsFaced);
          }

          const maxDrought = Math.max(existingInnings.maxBoundaryDrought, currentDrought);

          await prisma.battingInnings.update({
            where: { id: existingInnings.id },
            data: {
              runs,
              balls,
              strikeRate: sr,
              fours,
              sixes,
              currentBoundaryDrought: currentDrought,
              maxBoundaryDrought: maxDrought,
              lastBallsFaced: balls,
              lastBoundaries: currentBoundaries
            }
          });
        } else {
          // If innings doesn't exist yet, create it
          // Assuming the drought is simply total balls if boundaries is 0
          const initialDrought = currentBoundaries === 0 ? balls : 0;
          
          await prisma.battingInnings.create({
            data: {
              playerId: player.id,
              matchId,
              position: i + 1, // Rough position
              runs,
              balls,
              strikeRate: sr,
              dotBalls: 0,
              fours,
              sixes,
              currentBoundaryDrought: initialDrought,
              maxBoundaryDrought: initialDrought,
              lastBallsFaced: balls,
              lastBoundaries: currentBoundaries,
              isQualified: false
            }
          });
        }
      }
    }
    console.log(`🔴 [Live Sync] Updated drought tracker for match ${matchId}`);
  } catch (err) {
    console.error(`❌ [Live Sync] Error processing match ${matchId}:`, err);
  }
}

export async function processLiveMatches() {
  if (!process.env.RAPIDAPI_KEY) return;

  try {
    const data = await fetchRecentMatches();
    const typeMatches: any[] = data?.typeMatches || [];
    
    let liveMatchFound = false;

    for (const typeMatch of typeMatches) {
      const seriesMatches: any[] = typeMatch?.seriesMatches || [];
      for (const sm of seriesMatches) {
        const matches: any[] = sm?.seriesAdWrapper?.matches || [];
        for (const m of matches) {
          const matchInfo = m?.matchInfo;
          if (matchInfo) {
            const seriesName: string = matchInfo.seriesName || '';
            const isIpl = seriesName.toLowerCase().includes('indian premier league') || 
                          seriesName.toLowerCase().includes('ipl');
            
            // State-aware polling: Only poll if match is active
            if (isIpl && (matchInfo.state === 'In Progress' || matchInfo.state === 'Innings Break')) {
              liveMatchFound = true;
              await syncLiveMatch(String(matchInfo.matchId), matchInfo);
            }
          }
        }
      }
    }

    if (!liveMatchFound) {
      // console.log('⏸️ [Live Sync] No "In Progress" matches found. Waiting...');
    }
  } catch (err) {
    console.error('❌ [Live Sync] Error fetching recent matches:', err);
  }
}

export function startLiveSyncJob(): void {
  // Run every 3 minutes
  cron.schedule('*/3 * * * *', () => {
    processLiveMatches();
  });

  // Also run once immediately
  processLiveMatches();
  console.log('⏱  Live Match Tracker cron started (every 3 minutes)');
}
