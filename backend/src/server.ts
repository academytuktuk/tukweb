import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import leaderboardRouter from './routes/leaderboard';
import teamsRouter from './routes/teams';
import potdRouter from './routes/potd';
import treesRouter from './routes/trees';
import suggestRouter from './routes/suggest';
import { startMatchSyncJob } from './jobs/matchSync';
import { startCricsheetSyncJob } from './jobs/cricsheetSync';
import { startLiveSyncJob } from './jobs/liveSync';
import liveDroughtsRouter from './routes/liveDroughts';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ 
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, server-side)
    if (!origin) return callback(null, true);
    // Allow localhost (dev)
    if (origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) return callback(null, true);
    // Allow any Vercel deployment (preview + production)
    if (origin.endsWith('.vercel.app')) return callback(null, true);
    // Allow custom FRONTEND_URL set in Railway env vars
    if (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-password']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/rankings', leaderboardRouter);
app.use('/api/leaderboard', leaderboardRouter); // Backward compatibility for cached mobile clients
app.use('/api/teams', teamsRouter);
app.use('/api/potd', potdRouter);
app.use('/api/trees', treesRouter);
app.use('/api/suggest', suggestRouter);
app.use('/api/live-droughts', liveDroughtsRouter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`🏏 TukTuk & Dinda Backend running on http://localhost:${PORT}`);
  // Start cron jobs
  startMatchSyncJob();
  startCricsheetSyncJob();
  startLiveSyncJob();
});

export default app;
