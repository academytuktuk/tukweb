import Header from '../components/Header';
import Footer from '../components/Footer';
import styles from './page.module.css';

export default function DisclaimerPage() {
  return (
    <>
      <Header />
      <div className="page-wrapper">
        <main className="main-content">
          
          <div className={styles.pageHeader}>
            <div className={styles.headerAccent} />
            <div className={styles.headerContent}>
              <p className="section-label">Legal</p>
              <h1 className={styles.pageTitle}>DISCLAIMER</h1>
              <p className={styles.pageSubtitle}>
                Satire, parody, and just for fun. Please read carefully.
              </p>
            </div>
          </div>

          <div className="section-divider" />

          <section className={`section ${styles.contentSection}`}>
            <div className={styles.card}>
              <h3 className={styles.title}>1. Satire & Parody</h3>
              <p className={styles.text}>
                TukTuk & Run Machine Academy is a satirical and parody website created solely for entertainment purposes by cricket fans, for cricket fans. The terms "TukTuk Academy" and "Run Machine Academy" are popular internet memes and cultural jokes within the cricket community. None of the content on this website should be taken seriously as professional analysis or malicious criticism.
              </p>
            </div>

            <div className={styles.card}>
              <h3 className={styles.title}>2. No Official Affiliation</h3>
              <p className={styles.text}>
                This website is <strong>NOT</strong> affiliated with, endorsed by, sponsored by, or connected to the Board of Control for Cricket in India (BCCI), the Indian Premier League (IPL), any official IPL franchises, or any professional cricket players. All team names, colors, and player names are used purely for nominative and descriptive purposes to facilitate parody.
              </p>
            </div>

            <div className={styles.card}>
              <h3 className={styles.title}>3. Data & Intellectual Property</h3>
              <p className={styles.text}>
                The statistical data presented on this website is sourced from publicly available, open-source community datasets (such as Cricsheet). We do not host, distribute, or claim ownership of any official broadcast imagery, official team logos, or copyrighted trademarks owned by the BCCI or respective franchises.
              </p>
            </div>

            <div className={styles.card}>
              <h3 className={styles.title}>4. No Harm Intended</h3>
              <p className={styles.text}>
                We have immense respect for the athletes who play the sport at the highest level. The "roasts" and "awards" generated on this platform are completely lighthearted and generated based on statistical algorithms (like strike rate and economy) mixed with internet humor. It is not our intention to defame, harass, or maliciously harm the reputation of any individual player.
              </p>
            </div>

            <div className={styles.card}>
              <h3 className={styles.title}>5. Content Removal & Good Faith</h3>
              <p className={styles.text}>
                If you are a legal representative of a player, franchise, or official organization and have a genuine concern regarding specific content or imagery used on this site, we are fully willing to cooperate. Please reach out to our team via the <strong>Contact Us</strong> page. We operate in good faith and will promptly review and remove the requested material to resolve any disputes amicably.
              </p>
            </div>
          </section>

          <Footer />
        </main>
      </div>
    </>
  );
}
