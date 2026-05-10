import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { prisma } from '../lib/prisma';

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

export default router;
