import { Router } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    const tracker = await prisma.treeTracker.findUnique({ where: { id: 1 } });
    const totalDotBalls = tracker?.totalDotBalls ?? 0;
    const matchesProcessed = tracker?.matchesProcessed ?? 0;
    const trees = totalDotBalls * 19;
    res.json({ totalDotBalls, trees, treesPerDotBall: 19, matchesProcessed });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tree data' });
  }
});

export default router;
