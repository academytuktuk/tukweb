'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from './components/Header';
import TreeMeter from './components/TreeMeter';
import Footer from './components/Footer';
import styles from './page.module.css';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://tukweb-production.up.railway.app';

interface TopPlayer { name: string; team: string; }

export default function HomePage() {
  const [topTuk, setTopTuk] = useState<TopPlayer | null>(null);
  const [topDin, setTopDin] = useState<TopPlayer | null>(null);

  useEffect(() => {
    const cb = `?t=${new Date().getTime()}`;
    Promise.all([
      fetch(`${API_BASE}/api/rankings/tuktuk${cb}`).then(r => r.json()).catch(() => null),
      fetch(`${API_BASE}/api/rankings/run-machine${cb}`).then(r => r.json()).catch(() => null),
    ]).then(([tukData, dinData]) => {
      if (tukData?.top10?.[0]) setTopTuk(tukData.top10[0]);
      if (dinData?.top10?.[0]) setTopDin(dinData.top10[0]);
    });
  }, []);

  return (
    <>
      <Header />
      <div className="page-wrapper">
        <main className="main-content">

          {/* â”€â”€ 1. HERO â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
          <section className={styles.hero}>
            <div className={styles.heroInner}>

              {/* LEFT COLUMN */}
              <div className={styles.heroLeft}>
                <div className={styles.heroEyebrow}>
                  <span className={styles.eyebrowLine} />
                  IPL 2026 - The Pavilion of Patience
                </div>

                {/* FIX 2 â€” title restructure */}
                <div className={styles.heroTitleBlock}>
                  <div className={styles.heroMainLine}>
                    <span className={styles.textYellow}>TUKTUK</span>
                    <span className={styles.amp}> & </span>
                    <span className={styles.textPurple}>RUN MACHINE</span>
                  </div>
                  <div className={styles.heroSubLine}><span className={styles.white}>ACADEMY</span></div>
                </div>

                <p className={styles.heroDesc}>
                  Real data! Zero mercy!! Pure satire!!! <br/>
                  Celebrating cricket's slowest batters and most expensive bowlers.
                </p>

                {/* FIX 4 â€” single ghost CTA */}
                <a href="#features" className={styles.heroScrollCta}>
                  EXPLORE THE ACADEMY â†“
                </a>
              </div>

              {/* FIX 3 â€” RIGHT COLUMN: stat preview cards */}
              <div className={styles.heroRight}>
                <div className={`${styles.heroStatCard} ${styles.heroStatCardTuk}`}>
                  <p className={styles.heroStatLabel}>SLOWEST BATTERS</p>
                  <p className={styles.heroStatPlayer}>
                    #1 THIS WEEK:&nbsp;
                    <span>{topTuk ? topTuk.name : 'â€”'}</span>
                  </p>
                  <Link href="/tuktuk" className={`${styles.heroStatLink} ${styles.heroStatLinkTuk}`}>
                    VIEW RANKINGS â†’
                  </Link>
                </div>

                <div className={`${styles.heroStatCard} ${styles.heroStatCardDin}`}>
                  <p className={styles.heroStatLabel}>MOST EXPENSIVE</p>
                  <p className={styles.heroStatPlayer}>
                    #1 THIS WEEK:&nbsp;
                    <span>{topDin ? topDin.name : 'â€”'}</span>
                  </p>
                  <Link href="/run-machine" className={`${styles.heroStatLink} ${styles.heroStatLinkDin}`}>
                    VIEW RANKINGS â†’
                  </Link>
                </div>
              </div>

            </div>

            {/* FIX 1 & 8 â€” scroll indicator: right side, vertical, z-index 0 */}
            <div className={styles.scrollHint} aria-hidden="true">
              <span>SCROLL</span>
              <div className={styles.scrollLine} />
            </div>
          </section>

          {/* DIVIDER */}
          <div className="section-divider" />

          {/* â”€â”€ 2. SPLIT FEATURE CARDS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
          {/* FIX 4 â€” id="features" for scroll target */}
          <div className={styles.featureRow} id="features">

            <div className={`${styles.featureCard} ${styles.featureCardTuk}`}>
              <p className={styles.featureLabel}>TUKTUK ACADEMY</p>
              <h2 className={styles.featureHeadline}><span className={styles.textCyan}>The Pavilion of Patience</span></h2>
              <p className={styles.featureDesc}>
                The slowest batters in IPL 2026, ranked by dot ball consumption and strike rate damage.
              </p>
              <div className={styles.statPillsRow}>
                <span className={`${styles.statPill} ${styles.statPillTuk}`}>SR &lt; 140</span>
                <span className={`${styles.statPill} ${styles.statPillTuk}`}>6+ INNINGS</span>
                <span className={`${styles.statPill} ${styles.statPillTuk}`}>POS 1â€“7</span>
              </div>
              <Link href="/tuktuk" className={`${styles.featureCta} ${styles.featureCtaTuk}`}>
                VIEW TUKTUK RANKINGS â†’
              </Link>
            </div>

            <div className={styles.featureDivider} />

            <div className={`${styles.featureCard} ${styles.featureCardDin}`}>
              <p className={styles.featureLabel}>RUN MACHINE ACADEMY</p>
              <h2 className={styles.featureHeadline}><span className={styles.textPurple}>The Leaky End</span></h2>
              <p className={styles.featureDesc}>
                The most expensive bowlers in IPL 2026, ranked by economy damage and wicket drought.
              </p>
              <div className={styles.statPillsRow}>
                <span className={`${styles.statPill} ${styles.statPillDin}`}>ECON &gt; 8.5</span>
                <span className={`${styles.statPill} ${styles.statPillDin}`}>0.25 WKTS/OVER</span>
                <span className={`${styles.statPill} ${styles.statPillDin}`}>ALL OVERS</span>
              </div>
              <Link href="/run-machine" className={`${styles.featureCta} ${styles.featureCtaDin}`}>
                VIEW RUN MACHINE RANKINGS â†’
              </Link>
            </div>

          </div>

          {/* DIVIDER */}
          <div className="section-divider" />

          {/* â”€â”€ 3. TREE METER â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
          <TreeMeter />

          {/* DIVIDER */}
          <div className="section-divider" style={{ margin: '40px 0' }} />

          {/* â”€â”€ 4. HALL OF FAME BANNER â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
          <div className={styles.hofBanner}>
            <div className="section-label">LEGENDS NEVER DIE</div>
            <h2 className={styles.hofTitle}>HALL OF FAME</h2>
            <p className={styles.hofDesc}>
              Explore the absolute slowest innings, the most outrageously expensive bowling spells, the golden duck masters, and the bowlers who consistently leaked 50+ runs.
            </p>
            <Link href="/hall-of-fame" className={styles.hofCta}>
              ENTER THE HALL OF FAME â†’
            </Link>
          </div>

          {/* DIVIDER */}
          <div className="section-divider" style={{ margin: '40px 0' }} />

          {/* â”€â”€ 5. FOOTER â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
          <Footer />

        </main>
      </div>
    </>
  );
}
