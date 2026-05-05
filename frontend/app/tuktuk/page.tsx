'use client';
import { useEffect, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PlayerCard from '../components/PlayerCard';
import LeaderboardTable from '../components/LeaderboardTable';
import TeamPointsTable from '../components/TeamPointsTable';
import PastGraduates from '../components/PastGraduates';
import styles from './page.module.css';

const API_BASE = (typeof window !== 'undefined' && window.location.hostname === 'localhost') ? 'http://localhost:4000' : '';

export default function TukTukPage() {
  const [potd, setPotd] = useState(null);
  const [lb, setLb] = useState<{ top10: any[]; full: any[] }>({ top10: [], full: [] });
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cb = `?t=${new Date().getTime()}`;
    Promise.all([
      fetch(`${API_BASE}/api/potd/tuktuk${cb}`).then(r => r.json()).catch(() => null),
      fetch(`${API_BASE}/api/rankings/tuktuk${cb}`).then(r => r.json()).catch(() => ({ top10: [], full: [] })),
      fetch(`${API_BASE}/api/teams/tuktuk${cb}`).then(r => r.json()).catch(() => []),
    ]).then(([p, l, t]) => {
      setPotd(p);
      setLb(l || { top10: [], full: [] });
      setTeams(Array.isArray(t) ? t : []);
      setLoading(false);
    });
  }, []);

  return (
    <>
      <Header />
      <div className="page-wrapper">
        <main className="main-content">

          {/* Page header */}
          <div className={styles.pageHeader}>
            <div className={styles.headerAccent} />
            <div className={styles.headerContent}>
              <span className={`section-label ${styles.pageLabel}`}>
                IPL 2026 - The Pavilion of Patience
              </span>
              <h1 className={styles.pageTitle}>
                <span className={styles.tukColor}>TUKTUK</span>{' '}ACADEMY
              </h1>
              <p className={styles.pageSubtitle}>
                Ranking IPL's slowest stroke-makers by TukTuk Score - the definitive metric of batting patience.
                Minimum 6 innings - Positions 1–7 only - Higher score = more TukTuk.
              </p>
            </div>
          </div>

          <div className="section-divider" />

          {/* POTD */}
          <section className={`section ${styles.potdSection}`}>
            <div className={styles.potdHeader}>
              <p className="section-label">Today's graduate</p>
              <h2 className="section-title tuktuk"><span>Player</span> of the Day</h2>
            </div>
            <PlayerCard potd={potd} type="tuktuk" />
          </section>

          <div className="section-divider" />

          {/* Leaderboard */}
          <section className="section">
            <p className="section-label">Individual Rankings</p>
            <h2 className="section-title tuktuk"><span>TukTuk</span> Leaderboard</h2>
            <p className="section-subtitle">
              TukTuk Score = SR Impact + Volume Penalty · Highest = most TukTuk
            </p>
            <div className={styles.formulaBox}>
              <div className={styles.fItem}>
                <span className={styles.fKey}>SR Impact</span>
                <span className={styles.fVal}>avg_balls × (1 − avg_SR / 140)</span>
              </div>
              <div className={styles.fDiv} />
              <div className={styles.fItem}>
                <span className={styles.fKey}>Volume Penalty</span>
                <span className={styles.fVal}>max(0, (posExpected − avg_runs) / 10)</span>
              </div>
              <div className={styles.fDiv} />
              <div className={styles.fItem}>
                <span className={styles.fKey}>Score / Inn</span>
                <span className={styles.fVal} style={{ color: 'var(--tuk-cyan)' }}>SR Impact + Volume Penalty</span>
              </div>
            </div>
            {loading ? <div className={styles.loading}><div className={styles.dot} /><div className={styles.dot} /><div className={styles.dot} /></div>
              : <LeaderboardTable type="tuktuk" top10={lb.top10} full={lb.full} />}
          </section>

          <div className="section-divider" />

          {/* Team table */}
          <section className="section">
            <p className="section-label">Team Rankings</p>
            <h2 className="section-title tuktuk"><span>Team</span> TukTuk Table</h2>
            <p className="section-subtitle">
              Team TukTuk Score = (190 - Team SR) / Matches · Rank #1 = most TukTuk batting team
            </p>
            {loading ? <div className={styles.loading}><div className={styles.dot} /><div className={styles.dot} /><div className={styles.dot} /></div>
              : <TeamPointsTable type="tuktuk" rows={teams} />}
          </section>

          <div className="section-divider" />

          {/* Past Graduates */}
          <section className="section">
            <p className="section-label">Historical Archives</p>
            <h2 className="section-title tuktuk"><span>Past</span> Graduates</h2>
            <p className="section-subtitle">
              The prestigious alumni of the TukTuk Academy from 2008 to 2025.
            </p>
            <PastGraduates type="tuktuk" />
          </section>

          <Footer />
        </main>
      </div>
    </>
  );
}
