import Header from '../components/Header';
import Footer from '../components/Footer';
import styles from './page.module.css';

export default function ContactPage() {
  return (
    <>
      <Header />
      <div className="page-wrapper">
        <main className="main-content">

          <div className={styles.pageHeader}>
            <div className={styles.headerAccent} />
            <div className={styles.headerContent}>
              <p className="section-label">Get in Touch</p>
              <h1 className={styles.pageTitle}>CONTACT US</h1>
              <p className={styles.pageSubtitle}>
                Have questions, collaborations, or media enquiries?
                Reach out to the TukTuk Academy team.
              </p>
            </div>
          </div>

          <div className="section-divider" />

          <section className="section">
            <div className={styles.contactGrid}>
              <div className={`card ${styles.contactCard}`}>
                <h3 className={styles.contactTitle}>Twitter / X</h3>
                <a href="https://x.com/TukTuk_Academy" target="_blank" rel="noopener noreferrer" className={styles.contactVal} style={{textDecoration: 'none', color: 'var(--tuk-accent)'}}>@TukTuk_Academy</a>
                <p className={styles.contactNote}>DMs open for collaborations</p>
              </div>
              <div className={`card ${styles.contactCard}`}>
                <h3 className={styles.contactTitle}>Instagram</h3>
                <a href="https://www.instagram.com/tuktuk__academy?igsh=MTE4amUyYzNsdWhtYQ==" target="_blank" rel="noopener noreferrer" className={styles.contactVal} style={{textDecoration: 'none', color: 'var(--tuk-accent)'}}>@tuktuk__academy</a>
                <p className={styles.contactNote}>Daily cards &amp; match updates</p>
              </div>
              <div className={`card ${styles.contactCard}`}>
                <h3 className={styles.contactTitle}>Email</h3>
                <a href="mailto:academytuktuk@gmail.com" className={styles.contactVal} style={{textDecoration: 'none', color: 'var(--tuk-accent)'}}>academytuktuk@gmail.com</a>
                <p className={styles.contactNote}>Media &amp; sponsorship enquiries</p>
              </div>
            </div>
          </section>

          <Footer />
        </main>
      </div>
    </>
  );
}
