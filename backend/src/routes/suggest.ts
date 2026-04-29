import { Router } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const { username, message } = req.body;
    if (!username || !message) {
      res.status(400).json({ error: 'username and message are required' });
      return;
    }
    const suggestion = await prisma.suggestion.create({
      data: { username: username.trim(), message: message.trim() },
    });
    res.json({ success: true, id: suggestion.id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save suggestion' });
  }
});

router.get('/admin', async (req, res) => {
  try {
    const adminPwd = req.headers['x-admin-password'];
    if (adminPwd !== process.env.ADMIN_PASSWORD?.trim()) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const suggestions = await prisma.suggestion.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(suggestions);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch suggestions' });
  }
});

export default router;
