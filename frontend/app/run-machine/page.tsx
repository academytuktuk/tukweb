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

export default function DindaPage() {
  const [potd, setPotd] = useState(null);
  const [lb, setLb] = useState<{ top10: any[]; full: any[] }>({ top10: [], full: [] });
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRules, setShowRules] = useState(false);

  useEffect(() => {
    const cb = `?t=${new Date().getTime()}`;
    Promise.all([
      fetch(`${API_BASE}/api/potd/run-machine${cb}`).then(r => r.json()).catch(() => null),
      fetch(`${API_BASE}/api/rankings/run-machine${cb}`).then(r => r.json()).catch(() => ({ top10: [], full: [] })),
      fetch(`${API_BASE}/api/teams/run-machine${cb}`).then(r => r.json()).catch(() => []),
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
          <div className={`${styles.pageHeader} ${styles.pageHeaderDinda}`}>
            <div className={styles.headerAccentDinda} />
            <div className={styles.headerContent}>
              <span className={`section-label dinda ${styles.pageLabel}`}>
                IPL 2026 - The Leaky End
              </span>
              <h1 className={styles.pageTitle}>
                <span className={styles.dinColor}>RUN MACHINE</span>{' '}ACADEMY
              </h1>
              <p className={styles.pageSubtitle}>
                Ranking IPL's most expensive and wicketless bowlers by Run Machine Score.
                Minimum 4 overs - Higher score = more Run Machine.
              </p>
            </div>
          </div>

          <div className="section-divider" />

          {/* POTD — temporarily hidden
          <section className={`section ${styles.potdSection}`}>
            <div className={styles.potdHeader}>
              <p className="section-label dinda">Today's graduate</p>
              <h2 className="section-title dinda"><span>Player</span> of the Day</h2>
            </div>
            <PlayerCard potd={potd} type="run-machine" />
          </section>

          <div className="section-divider" />
          POTD end */}

          {/* Leaderboard */}
          <section className="section">
            <p className="section-label">Individual Rankings</p>
            <h2 className="section-title dinda"><span>Run Machine</span> Leaderboard</h2>
            <p className="section-subtitle">
              Run Machine Score = Economy Impact + Wicket Drought · Highest = most Run Machine
            </p>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <button 
                className="rules-toggle" 
                onClick={() => setShowRules(!showRules)}
                aria-expanded={showRules}
              >
                {showRules ? 'Hide Rules & Formulas' : 'View Rules & Formulas'}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: showRules ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }}>
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
            </div>
            
            <div className={`rules-wrapper ${showRules ? 'open' : ''}`}>
              <div className={`${styles.formulaBox} ${styles.formulaBoxDinda}`}>
                <div className={styles.fItem}>
                  <span className={`${styles.fKey} ${styles.fKeyDinda}`}>Economy Impact</span>
                  <span className={styles.fVal}>avg_runs_per_over − 8.5</span>
                </div>
                <div className={styles.fDiv} />
                <div className={styles.fItem}>
                  <span className={`${styles.fKey} ${styles.fKeyDinda}`}>Wicket Drought</span>
                  <span className={styles.fVal}>(0.25 − wkts/over) × 10</span>
                </div>
                <div className={styles.fDiv} />
                <div className={styles.fItem}>
                  <span className={`${styles.fKey} ${styles.fKeyDinda}`}>Score / Over</span>
                  <span className={styles.fVal} style={{ color: 'var(--din-light)' }}>Economy Impact + Wicket Drought</span>
                </div>
              </div>
            </div>
            {loading ? <div className={styles.loadingDinda}><div className={styles.dotDinda} /><div className={styles.dotDinda} /><div className={styles.dotDinda} /></div>
              : <LeaderboardTable type="run-machine" top10={lb.top10} full={lb.full} />}
          </section>

          <div className="section-divider" />

          {/* Team table */}
          <section className="section">
            <p className="section-label">Team Rankings</p>
            <h2 className="section-title dinda"><span>Team</span> Run Machine Table</h2>
            <p className="section-subtitle">
              Team Run Machine Score = Economy + (0.25 − Wkts/Over) × 10 · Rank #1 = most Run Machine bowling team
            </p>
            {loading ? <div className={styles.loadingDinda}><div className={styles.dotDinda} /><div className={styles.dotDinda} /><div className={styles.dotDinda} /></div>
              : <TeamPointsTable type="run-machine" rows={teams} />}
          </section>

          <div className="section-divider" />

          {/* Past Graduates */}
          <section className="section">
            <p className="section-label">Historical Archives</p>
            <h2 className="section-title dinda"><span>Past</span> Graduates</h2>
            <p className="section-subtitle">
              The prestigious alumni of the Run Machine Academy from 2008 to 2025.
            </p>
            <PastGraduates type="run-machine" />
          </section>

          <Footer />
        </main>
      </div>
    </>
  );
}
