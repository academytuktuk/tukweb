import axios from 'axios';
import AdmZip from 'adm-zip';
import fs from 'fs';
import path from 'path';

// POS_BENCHMARKS matching our leaderboard logic
const POS_BENCHMARKS: Record<number, number> = {
  1: 30, 2: 30, 3: 28, 4: 25,
  5: 20, 6: 15, 7: 10
};

interface PlayerSeasonStats {
  name: string;
  team: string; // The primary team they played for that season
  
  // Batting
  runs: number;
  balls: number;
  innings: number;
  positions: number[];
  
  // Bowling
  ballsBowled: number;
  runsConceded: number;
  wickets: number;
  spells: number;
}

const TEAM_MAP: Record<string, string> = {
  "Chennai Super Kings": "CSK",
  "Mumbai Indians": "MI",
  "Royal Challengers Bangalore": "RCB",
  "Royal Challengers Bengaluru": "RCB",
  "Kolkata Knight Riders": "KKR",
  "Sunrisers Hyderabad": "SRH",
  "Deccan Chargers": "DEC",
  "Delhi Capitals": "DC",
  "Delhi Daredevils": "DC",
  "Rajasthan Royals": "RR",
  "Punjab Kings": "PBKS",
  "Kings XI Punjab": "PBKS",
  "Gujarat Titans": "GT",
  "Lucknow Super Giants": "LSG",
  "Gujarat Lions": "GL",
  "Rising Pune Supergiant": "RPS",
  "Rising Pune Supergiants": "RPS",
  "Pune Warriors": "PWI",
  "Kochi Tuskers Kerala": "KTK"
};

// Ensure the output directory exists
const outputDir = path.join(__dirname, '../../../frontend/public/data');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function run() {
  console.log('🌳 Downloading ipl_json.zip from Cricsheet...');
  const response = await axios.get('https://cricsheet.org/downloads/ipl_json.zip', {
    responseType: 'arraybuffer'
  });

  const zip = new AdmZip(response.data);
  const entries = zip.getEntries().filter((e: any) => e.name.endsWith('.json'));
  
  console.log(`📦 Unzipped ${entries.length} IPL matches. Parsing historical data...`);

  const seasonData: Record<string, Record<string, PlayerSeasonStats>> = {};

  for (const entry of entries) {
    const matchData = JSON.parse(entry.getData().toString('utf8'));
    let season = String(matchData?.info?.season);
    
    // Normalize Cricsheet's strange season strings
    if (season === '2007/08') season = '2008';
    if (season === '2009/10') season = '2010';
    if (season === '2020/21') season = '2020';
    
    // We only care about 2008 to 2025.
    const year = parseInt(season);
    if (isNaN(year) || year < 2008 || year > 2025) continue;

    if (!seasonData[season]) seasonData[season] = {};
    const players = seasonData[season];

    const innings = matchData.innings || [];
    
    for (const inningObj of innings) {
      const battingTeamFull = inningObj.team;
      const battingTeam = TEAM_MAP[battingTeamFull] || battingTeamFull;
      
      const bowlingTeamFull = matchData.info.teams?.find((t: string) => t !== battingTeamFull) || 'Unknown';
      const bowlingTeam = TEAM_MAP[bowlingTeamFull] || bowlingTeamFull;

      const overs = inningObj.overs || [];
      
      // Track batting order for this specific innings
      const creaseOrder: string[] = [];
      const addBatter = (b: string) => {
        if (!creaseOrder.includes(b)) creaseOrder.push(b);
      };

      // Bowling stats tracking for this innings
      const bowlersInInnings = new Set<string>();

      for (const over of overs) {
        const deliveries = over.deliveries || [];
        for (const delivery of deliveries) {
          const batter = delivery.batter;
          const nonStriker = delivery.non_striker;
          const bowler = delivery.bowler;
          
          addBatter(batter);
          addBatter(nonStriker);
          
          // Initialize batter
          if (!players[batter]) {
            players[batter] = { name: batter, team: battingTeam, runs: 0, balls: 0, innings: 0, positions: [], ballsBowled: 0, runsConceded: 0, wickets: 0, spells: 0 };
          }
          players[batter].team = battingTeam;

          // Initialize non_striker
          if (!players[nonStriker]) {
            players[nonStriker] = { name: nonStriker, team: battingTeam, runs: 0, balls: 0, innings: 0, positions: [], ballsBowled: 0, runsConceded: 0, wickets: 0, spells: 0 };
          }
          players[nonStriker].team = battingTeam;
          
          // Initialize bowler
          if (!players[bowler]) {
            players[bowler] = { name: bowler, team: bowlingTeam, runs: 0, balls: 0, innings: 0, positions: [], ballsBowled: 0, runsConceded: 0, wickets: 0, spells: 0 };
          }
          players[bowler].team = bowlingTeam;
          bowlersInInnings.add(bowler);

          // Update batting
          const isWide = delivery.extras && delivery.extras.wides;
          if (!isWide) {
            players[batter].balls += 1;
            players[batter].runs += (delivery.runs.batter || 0);
          }

          // Update bowling
          const isNoBall = delivery.extras && delivery.extras.noballs;
          if (!isWide && !isNoBall) {
            players[bowler].ballsBowled += 1;
          }
          // Runs conceded by bowler = total runs minus byes/legbyes/penalties
          let runsToBowler = delivery.runs.total || 0;
          if (delivery.extras) {
            if (delivery.extras.byes) runsToBowler -= delivery.extras.byes;
            if (delivery.extras.legbyes) runsToBowler -= delivery.extras.legbyes;
            if (delivery.extras.penalty) runsToBowler -= delivery.extras.penalty;
          }
          players[bowler].runsConceded += runsToBowler;

          // Wickets
          if (delivery.wickets) {
            for (const w of delivery.wickets) {
              if (w.kind !== 'run out' && w.kind !== 'retired hurt' && w.kind !== 'retired out' && w.kind !== 'obstructing the field') {
                players[bowler].wickets += 1;
              }
            }
          }
        }
      }

      // Add innings counts and positions
      for (let i = 0; i < creaseOrder.length; i++) {
        const b = creaseOrder[i];
        if (players[b].balls > 0) { // Only count if they actually faced a ball
          players[b].innings += 1;
          players[b].positions.push(i + 1);
        }
      }
      
      // Add spells count
      for (const b of bowlersInInnings) {
        players[b].spells += 1;
      }
    }
  }

  // Calculate Leaderboards
  const finalLeaderboards: any = {};

  for (const season of Object.keys(seasonData).sort().reverse()) {
    const pData = Object.values(seasonData[season]);
    
    // TUKTUK
    const tuktukRows = pData
      .filter(p => p.innings >= 8)
      .map(p => {
        const posCounts: Record<number, number> = {};
        for (const pos of p.positions) posCounts[pos] = (posCounts[pos] || 0) + 1;
        const dominantPos = parseInt(Object.entries(posCounts).sort((a, b) => b[1] - a[1])[0][0]);
        return { ...p, dominantPos };
      })
      .filter(p => p.dominantPos >= 1 && p.dominantPos <= 7)
      .map(p => {
        const avgRuns = p.runs / p.innings;
        const avgBalls = p.balls / p.innings;
        const avgSR = p.balls > 0 ? (p.runs / p.balls) * 100 : 0;
        
        const posExpected = POS_BENCHMARKS[p.dominantPos] ?? 20;

        const srImpact = avgBalls * (1 - avgSR / 140);
        const volumePenalty = Math.max(0, (posExpected - avgRuns) / 10);
        const tuktukScore = srImpact + volumePenalty;

        return {
          name: p.name,
          team: p.team,
          innings: p.innings,
          totalRuns: p.runs,
          totalBalls: p.balls,
          avgRuns: Math.round(avgRuns * 10) / 10,
          avgBalls: Math.round(avgBalls * 10) / 10,
          avgSR: Math.round(avgSR * 10) / 10,
          tuktukScore: Math.round(tuktukScore * 100) / 100,
        };
      })
      .sort((a, b) => {
        if (b.tuktukScore === a.tuktukScore) return a.totalRuns - b.totalRuns; // tiebreaker: fewer runs
        return b.tuktukScore - a.tuktukScore;
      })
      .map((r, i) => ({ ...r, rank: i + 1 }))
      .slice(0, 10);

    // DINDA
    const dindaRows = pData
      .filter(p => p.spells >= 8)
      .map(p => {
        const oversFloat = p.ballsBowled / 6;
        const avgOvers = oversFloat / p.spells;
        const avgRuns = p.runsConceded / p.spells;
        const avgWickets = p.wickets / p.spells;
        const economy = oversFloat > 0 ? p.runsConceded / oversFloat : 0;

        const econPenalty = economy * 1.5;
        const volumeFactor = avgOvers / 4;
        const wicketDiscount = avgWickets * 5;
        const dindaScore = (econPenalty * volumeFactor) + Math.max(0, avgRuns - 30) - wicketDiscount;
        const wktsPerOver = oversFloat > 0 ? p.wickets / oversFloat : 0;

        return {
          name: p.name,
          team: p.team === 'Unknown' ? 'Multiple' : p.team,
          innings: p.spells,
          totalOvers: Math.round(oversFloat * 10) / 10,
          totalRuns: p.runsConceded,
          totalWickets: p.wickets,
          economy: Math.round(economy * 100) / 100,
          wktsPerOver: Math.round(wktsPerOver * 100) / 100,
          dindaScore: Math.round(dindaScore * 100) / 100,
        };
      })
      .sort((a, b) => b.dindaScore - a.dindaScore)
      .map((r, i) => ({ ...r, rank: i + 1 }))
      .slice(0, 10);

    finalLeaderboards[season] = { tuktuk: tuktukRows, dinda: dindaRows };
  }

  fs.writeFileSync(path.join(outputDir, 'historical_leaderboards.json'), JSON.stringify(finalLeaderboards, null, 2));
  console.log(`✅ Success! Historical leaderboards written to frontend/public/data/historical_leaderboards.json`);
}

run().catch(console.error);
