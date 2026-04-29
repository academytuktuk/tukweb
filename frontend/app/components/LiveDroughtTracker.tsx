'use client';
import { useEffect, useState } from 'react';
import styles from './LiveDroughtTracker.module.css';

interface LiveBatter {
  playerName: string;
  team: string;
  runs: number;
  balls: number;
  strikeRate: number;
  matchId: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function LiveDroughtTracker() {
  const [batters, setBatters] = useState<LiveBatter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBatters() {
      try {
        const res = await fetch(`${API_BASE}/api/live-droughts`);
        if (res.ok) {
          const data = await res.json();
          setBatters(data);
        }
      } catch (err) {
        console.error('Failed to fetch live batters', err);
      } finally {
        setLoading(false);
      }
    }

    fetchBatters();
    const interval = setInterval(fetchBatters, 30000);
    return () => clearInterval(interval);
  }, []);

  // Hide entirely when loading or no TukTuk batters active
  if (loading || batters.length === 0) return null;

  return (
    <div className={styles.trackerContainer}>
      <div className={styles.liveBadge}>
        <div className={styles.pulsingDot} />
        Live Tracker
      </div>
      <div className={styles.marqueeWrapper}>
        <div className={styles.marqueeContent}>
          {batters.map((b, i) => (
            <span key={`${b.matchId}-${b.playerName}-${i}`} className={styles.droughtItem}>
              <span className={styles.playerName}>{b.playerName}</span>
              ({b.team}) is batting at
              <span className={styles.droughtBalls}>SR {b.strikeRate}</span>
              — {b.runs}({b.balls}) 🐢
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
