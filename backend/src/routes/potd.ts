import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { prisma } from '../lib/prisma';
import { generateAutoPotdForMatch } from '../jobs/autoPotd';

const router = Router();

// Ensure uploads dir exists
const uploadDir = path.join(__dirname, '../../uploads/potd');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ts = Date.now();
    cb(null, `${ts}-${file.originalname}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB limit

// GET /api/potd/tuktuk — latest TukTuk POTD card
// Priority: 1) Admin card from today  2) Auto card from today  3) Most recent admin card  4) Most recent any
router.get('/tuktuk', async (_req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);

    // 1. Admin-uploaded card from today
    const todayAdmin = await prisma.playerOfDay.findFirst({
      where: { type: 'tuktuk', date: { gte: todayStart }, NOT: { imageUrl: 'auto' } },
      orderBy: { date: 'desc' },
    });
    if (todayAdmin) return res.json(todayAdmin);

    // 2. Auto card from today
    const todayAuto = await prisma.playerOfDay.findFirst({
      where: { type: 'tuktuk', date: { gte: todayStart }, imageUrl: 'auto' },
      orderBy: { date: 'desc' },
    });
    if (todayAuto) return res.json(todayAuto);

    // 3. Most recent admin card ever (staleness note: imageUrl != 'auto')
    const latestAdmin = await prisma.playerOfDay.findFirst({
      where: { type: 'tuktuk', NOT: { imageUrl: 'auto' } },
      orderBy: { date: 'desc' },
    });
    if (latestAdmin) return res.json(latestAdmin);

    // 4. Anything at all
    const latest = await prisma.playerOfDay.findFirst({
      where: { type: 'tuktuk' },
      orderBy: { date: 'desc' },
    });
    res.json(latest || null);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch TukTuk POTD' });
  }
});

// GET /api/potd/run-machine — latest Run Machine POTD card
router.get('/run-machine', async (_req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);

    const todayAdmin = await prisma.playerOfDay.findFirst({
      where: { type: 'run-machine', date: { gte: todayStart }, NOT: { imageUrl: 'auto' } },
      orderBy: { date: 'desc' },
    });
    if (todayAdmin) return res.json(todayAdmin);

    const todayAuto = await prisma.playerOfDay.findFirst({
      where: { type: 'run-machine', date: { gte: todayStart }, imageUrl: 'auto' },
      orderBy: { date: 'desc' },
    });
    if (todayAuto) return res.json(todayAuto);

    const latestAdmin = await prisma.playerOfDay.findFirst({
      where: { type: 'run-machine', NOT: { imageUrl: 'auto' } },
      orderBy: { date: 'desc' },
    });
    if (latestAdmin) return res.json(latestAdmin);

    const latest = await prisma.playerOfDay.findFirst({
      where: { type: 'run-machine' },
      orderBy: { date: 'desc' },
    });
    res.json(latest || null);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch Run Machine POTD' });
  }
});


// POST /api/potd/verify — verifies admin password without uploading
router.post('/verify', async (req: Request, res: Response): Promise<void> => {
  const adminPwd = req.headers['x-admin-password'];
  if (adminPwd !== process.env.ADMIN_PASSWORD?.trim()) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  res.json({ success: true });
});

// POST /api/potd/upload — admin uploads a new POTD card
router.post('/upload', upload.single('card'), async (req: Request, res: Response): Promise<void> => {
  try {
    const adminPwd = req.headers['x-admin-password'];
    if (adminPwd !== process.env.ADMIN_PASSWORD?.trim()) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const { type, playerName, stats } = req.body;
    if (!type || !['tuktuk', 'run-machine'].includes(type)) {
      res.status(400).json({ error: 'type must be tuktuk or run-machine' });
      return;
    }

    const imageUrl = `/uploads/potd/${req.file.filename}`;

    const potd = await prisma.playerOfDay.create({
      data: {
        type,
        imageUrl,
        playerName: playerName || 'Unknown',
        stats: stats || '{}',
      },
    });

    res.json({ success: true, potd });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// POST /api/potd/force-auto — admin triggers auto-POTD for a specific match or most recent
router.post('/force-auto', async (req: Request, res: Response): Promise<void> => {
  try {
    const adminPwd = req.headers['x-admin-password'];
    if (adminPwd !== process.env.ADMIN_PASSWORD?.trim()) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    let matchId: string | null = req.body.matchId || null;

    // If no matchId supplied, find the most recent match from last 24h
    if (!matchId) {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const groups = await prisma.battingInnings.groupBy({
        by: ['matchId'],
        where: { createdAt: { gte: oneDayAgo } },
        _max: { createdAt: true },
        orderBy: { _max: { createdAt: 'desc' } },
      });
      if (groups.length === 0) {
        res.status(404).json({ error: 'No recent match innings found in last 24h' });
        return;
      }
      matchId = groups[0].matchId;
    }

    const result = await generateAutoPotdForMatch(matchId);
    res.json({ success: true, matchId, result });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Force auto failed' });
  }
});

// GET /api/potd/recent-matches — debug: list recent matchIds with innings in last 48h
router.get('/recent-matches', async (req: Request, res: Response): Promise<void> => {
  try {
    const adminPwd = req.headers['x-admin-password'];
    if (adminPwd !== process.env.ADMIN_PASSWORD?.trim()) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
    const groups = await prisma.battingInnings.groupBy({
      by: ['matchId'],
      where: { createdAt: { gte: twoDaysAgo } },
      _max: { createdAt: true },
      orderBy: { _max: { createdAt: 'desc' } },
    });
    const todayPotds = await prisma.playerOfDay.findMany({
      where: { date: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
      orderBy: { date: 'desc' },
      select: { id: true, type: true, imageUrl: true, playerName: true, date: true, stats: true },
    });
    res.json({ recentMatches: groups, todayPotds });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
