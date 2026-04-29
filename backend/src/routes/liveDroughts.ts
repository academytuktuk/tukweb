import { Router } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();

router.get('/', async (req, res) => {
  try {
    // A match is "live" if it has innings data but is not yet fully processed in ProcessedMatch
    const processedMatchIds = (await prisma.processedMatch.findMany({
      select: { matchId: true }
    })).map(m => m.matchId);

    // Fetch active batters (SR < 140) from live matches, ordered by lowest SR first
    const liveBatters = await prisma.battingInnings.findMany({
      where: {
        matchId: { notIn: processedMatchIds },
        balls: { gte: 5 },          // Must have faced at least 5 balls to be meaningful
        strikeRate: { lt: 140 },    // TukTuk zone: SR < 140
      },
      include: {
        player: true
      },
      orderBy: {
        strikeRate: 'asc'           // Lowest SR first = most TukTuk batter on top
      },
      take: 5
    });

    res.json(liveBatters.map(d => ({
      playerName: d.player.name,
      team: d.player.team,
      runs: d.runs,
      balls: d.balls,
      strikeRate: Math.round(d.strikeRate * 10) / 10,
      matchId: d.matchId,
    })));

  } catch (error) {
    console.error('Error fetching live TukTuk batters:', error);
    res.status(500).json({ error: 'Failed to fetch live batters' });
  }
});

export default router;
