import { Router } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();

// IPL team colors for frontend reference
const TEAM_COLORS: Record<string, { primary: string; bg: string; text: string }> = {
  MI:   { primary: '#005DA0', bg: '#005DA0', text: '#FFFFFF' },
  CSK:  { primary: '#F5C518', bg: '#F5C518', text: '#000000' },
  RCB:  { primary: '#CC0000', bg: '#CC0000', text: '#FFFFFF' },
  KKR:  { primary: '#3A225D', bg: '#3A225D', text: '#F5C518' },
  DC:   { primary: '#17479E', bg: '#17479E', text: '#FF0000' },
  PBKS: { primary: '#ED1B24', bg: '#ED1B24', text: '#FFFFFF' },
  RR:   { primary: '#EA1A85', bg: '#EA1A85', text: '#FFFFFF' },
  SRH:  { primary: '#F7A721', bg: '#F7A721', text: '#000000' },
  GT:   { primary: '#1C3660', bg: '#1C3660', text: '#C7A84B' },
  LSG:  { primary: '#A4C0E4', bg: '#A4C0E4', text: '#1A2F5A' },
};

// ─── TEAM TUKTUK TABLE ───────────────────────────────────────────────────────
// Team TukTuk Score = (Dot Balls Faced / Balls Faced) × 100
// Rank #1 = most TukTuk batting team (highest dot ball %)
router.get('/tuktuk', async (_req, res) => {
  try {
    const allMatches = await prisma.teamMatch.findMany();
    const teamMap: Record<string, any> = {};

    for (const tm of allMatches) {
      if (!teamMap[tm.team]) {
        teamMap[tm.team] = {
          team: tm.team,
          matchesPlayed: 0,
          validBattingMatches: 0,
          ballsFaced: 0,
          runsBatted: 0,
        };
      }

      teamMap[tm.team].matchesPlayed += 1;

      if (tm.ballsFaced > 0) {
        teamMap[tm.team].ballsFaced += tm.ballsFaced;
        teamMap[tm.team].runsBatted += tm.runsBatted;

        // A valid match is one where the team had significant involvement (not just 3 overs before rain)
        const totalBalls = tm.ballsFaced + tm.oversBowled * 6;
        if (totalBalls >= 40) {
          teamMap[tm.team].validBattingMatches += 1;
        }
      }
    }

    const rows = Object.values(teamMap)
      .filter((td) => td.ballsFaced > 0)
      .map((td) => {
        const teamSR = (td.runsBatted / td.ballsFaced) * 100;
        // Use validBattingMatches as the divisor for TukTuk score
        const tuktukScore = td.validBattingMatches > 0 ? (190 - teamSR) / td.validBattingMatches : 0;

        return {
          team: td.team,
          colors: TEAM_COLORS[td.team] || { primary: '#666', bg: '#666', text: '#fff' },
          matchesPlayed: td.matchesPlayed,
          ballsFaced: td.ballsFaced,
          runsBatted: td.runsBatted,
          teamSR: Math.round(teamSR * 100) / 100,
          tuktukScore: Math.round(tuktukScore * 100) / 100,
        };
      });

    // Sort highest tuktuk score first
    rows.sort((a, b) => b.tuktukScore - a.tuktukScore);
    const ranked = rows.map((r, i) => ({ ...r, rank: i + 1 }));

    res.json(ranked);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch team TukTuk table' });
  }
});

// ─── TEAM RUN MACHINE TABLE ────────────────────────────────────────────────────────
// Team Run Machine Score = Economy + max(0, (0.25 − WktsPerOver) × 3)
// Rank #1 = most Run Machine bowling team
router.get('/run-machine', async (_req, res) => {
  try {
    const allMatches = await prisma.teamMatch.findMany();
    const teamMap: Record<string, any> = {};

    for (const tm of allMatches) {
      if (!teamMap[tm.team]) {
        teamMap[tm.team] = {
          team: tm.team,
          matchesPlayed: 0,
          oversBowled: 0,
          runsConceded: 0,
          wicketsTaken: 0,
        };
      }

      teamMap[tm.team].matchesPlayed += 1;

      if (tm.oversBowled > 0) {
        teamMap[tm.team].oversBowled += tm.oversBowled;
        teamMap[tm.team].runsConceded += tm.runsConceded;
        teamMap[tm.team].wicketsTaken += tm.wicketsTaken;
      }
    }

    const rows = Object.values(teamMap)
      .filter((td) => td.oversBowled > 0)
      .map((td) => {
        const economy = td.runsConceded / td.oversBowled;
        const wktsPerOver = td.wicketsTaken / td.oversBowled;
        const wicketDrought = (0.25 - wktsPerOver) * 10;
        const runMachineScore = economy + wicketDrought;

        return {
          team: td.team,
          colors: TEAM_COLORS[td.team] || { primary: '#666', bg: '#666', text: '#fff' },
          matchesPlayed: td.matchesPlayed,
          oversBowled: Math.round(td.oversBowled * 10) / 10,
          runsConceded: td.runsConceded,
          wicketsTaken: td.wicketsTaken,
          economy: Math.round(economy * 100) / 100,
          wktsPerOver: Math.round(wktsPerOver * 100) / 100,
          runMachineScore: Math.round(runMachineScore * 100) / 100,
        };
      });

    // Sort by runMachineScore descending — highest score = most Run Machine (rank 1 = worst bowling team)
    rows.sort((a, b) => b.runMachineScore - a.runMachineScore);
    const ranked = rows.map((r, i) => ({ ...r, rank: i + 1 }));

    res.json(ranked);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch team Run Machine table' });
  }
});

export default router;
