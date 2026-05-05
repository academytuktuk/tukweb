'use client';
import { useEffect, useRef, useState } from 'react';
import styles from './TreeMeter.module.css';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://tukweb-production.up.railway.app';

interface TreeData {
  totalDotBalls: number;
  trees: number;
  treesPerDotBall: number;
  matchesProcessed: number;
}

function useCountUp(target: number, duration: number = 1500) {
  const [value, setValue] = useState(0);
  const raf = useRef<number>(0);
  useEffect(() => {
    if (target === 0) { setValue(0); return; }
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(eased * target));
      if (progress < 1) raf.current = requestAnimationFrame(animate);
    };
    raf.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration]);
  return value;
}

function getTreeFact(treeCount: number): string {
  if (treeCount === 0) return "Waiting for the first dot ball...";
  if (treeCount < 10000) return "Cubbon Park in Bengaluru has roughly 6,000 trees!";
  if (treeCount < 30000) return "Central Park in New York City has around 20,000 trees!";
  if (treeCount < 55000) return "That's enough to cover the massive Sanjay Gandhi National Park!";
  if (treeCount < 60000) return "Equivalent to 120 acres of dense, natural woodland!";
  if (treeCount < 65000) return "Guindy National Park in Chennai holds roughly this many trees!";
  if (treeCount < 70000) return "That's enough to line every single street in a major metropolis!";
  if (treeCount < 75000) return "You could create a forest the size of 50 cricket stadiums!";
  if (treeCount < 80000) return "Equivalent to the dense tree cover of Borivali National Park!";
  if (treeCount < 85000) return "That's enough to offset the carbon of 15,000 cars for a year!";
  if (treeCount < 90000) return "You are officially building a small rainforest at this point!";
  if (treeCount < 95000) return "The historic Sundarbans delta relies on dense forests like this!";
  if (treeCount < 100000) return "Almost 1 Lakh! That's enough to cover an entire small island!";
  if (treeCount < 150000) return "1 Lakh+ Trees! The Aravalli Biodiversity Park has roughly 100,000 trees!";
  return "Jadav Payeng planted the famous Molai Forest in Assam with roughly 150,000 trees!";
}

const MAX_DOTS = 10000;

export default function TreeMeter() {
  const [data, setData] = useState<TreeData | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/api/trees`)
      .then(r => r.json())
      .then(setData)
      .catch(() => setError(true));
  }, []);

  const trees  = useCountUp(data?.trees ?? 0);
  const dots   = useCountUp(data?.totalDotBalls ?? 0);
  const pct    = data ? Math.min((data.totalDotBalls / MAX_DOTS) * 100, 100) : 0;
  const fmt    = (n: number) => n.toLocaleString();

  return (
    <section className={styles.section} id="tree-meter">
      <div className={styles.inner}>

        {/* ── LEFT COLUMN ── */}
        <div className={styles.leftCol}>
          {/* FIX 5 — TUKTUKFORNATURE one line */}
          <h2 className={styles.natureHeading}>
            <span className={styles.natureMain}>TUKTUKFOR</span>
            <span className={styles.natureAccent}>NATURE</span>
          </h2>
          <p className={styles.subtitle}>
            Every dot ball in IPL 2026 plants a tree
          </p>
          <p className={styles.subNote}>1 dot ball = 19 trees</p>
          <div className={styles.liveTag}>
            <span className={styles.liveDot} />
            Live tracking active
          </div>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className={styles.rightCol}>

          {/* FIX 6 — premium stat boxes */}
          <div className={styles.statBoxRow}>

            {/* Dot Balls — with live dot */}
            <div className={styles.statBox}>
              <span className={styles.statValue}>
                <span className={styles.liveDotInline} />
                {error ? '—' : fmt(dots)}
              </span>
              <span className={styles.statLabel}>
                Dot Balls Recorded
                <span className={styles.infoIcon} data-tooltip={data ? `Data from ${data.matchesProcessed} matches. Updates every 24 hours.` : "Updates every 24 hours"}>
                  i
                </span>
              </span>
            </div>

            {/* Trees Planted */}
            <div className={styles.statBox}>
              <span className={styles.statValue}>
                {error ? '—' : fmt(trees)}
              </span>
              <span className={styles.statLabel}>Trees Planted</span>
              {data && data.trees > 0 && (
                <div className={styles.treeFactContainer}>
                  <span className={styles.treeFactTitle}>REAL-WORLD IMPACT</span>
                  <p className={styles.treeFact}>{getTreeFact(data.trees)}</p>
                </div>
              )}
            </div>

          </div>

          {/* FIX 6 — premium progress bar */}
          <div className={styles.progressTrack}>
            <div
              className={styles.progressFill}
              style={{ width: `${pct}%` }}
              role="progressbar"
              aria-valuenow={data?.totalDotBalls}
              aria-valuemax={MAX_DOTS}
            />
          </div>

          {/* Scale */}
          <div className={styles.scale}>
            <span>0</span>
            <span>5,000</span>
            <span>10,000+ dot balls</span>
          </div>
        </div>

      </div>
    </section>
  );
}
