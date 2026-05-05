import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>

        {/* Brand */}
        <div className={styles.brand}>
          <Link href="/" className={styles.logo}>
            <span className={styles.logoTuk}>TUK</span>
            <span className={styles.logoTuk2}>TUK</span>
            <span className={styles.logoDivider}>&amp;</span>
            <span className={styles.logoDinda}>RUN MACHINE</span>
            <span className={styles.logoAcademy}>ACADEMY</span>
          </Link>
          <p className={styles.tagline}>The Pavilion of Patience & The Leaky End</p>
          <p className={styles.nature}>TukTukForNature - every dot ball plants 19 trees</p>
        </div>

        {/* Navigate */}
        <div className={styles.group}>
          <h4 className={styles.groupTitle}>Navigate</h4>
          <Link href="/" className={styles.link}>Home</Link>
          <Link href="/tuktuk"  className={styles.link}>TukTuk Academy</Link>
          <Link href="/run-machine"   className={styles.link}>Run Machine Academy</Link>
          <Link href="/droughts" className={styles.link}>Trophy Droughts</Link>
          <Link href="/contact" className={styles.link}>Contact Us</Link>
          <Link href="/disclaimer" className={styles.link}>Disclaimer</Link>
        </div>

        {/* Resources Section Removed */}

        {/* Follow */}
        <div className={styles.group}>
          <h4 className={styles.groupTitle}>Follow</h4>
          <a href="https://x.com/TukTuk_Academy" target="_blank" rel="noopener noreferrer" className={styles.link}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{display:'inline',marginRight:6}}>
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.738l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            TukTuk (Twitter / X)
          </a>
          <a href="https://www.instagram.com/tuktuk__academy?igsh=MTE4amUyYzNsdWhtYQ==" target="_blank" rel="noopener noreferrer" className={styles.link}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{display:'inline',marginRight:6}}>
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
            Instagram
          </a>
        </div>

      </div>

      <div className={styles.bottom}>
        <div className={styles.copyright}>
          <span className={styles.copyrightFull}>Â© {new Date().getFullYear()} TukTuk &amp; Run Machine Academy. Satire/Parody- just for fun</span>
          <span className={styles.copyrightShort}>Â© {new Date().getFullYear()} TukTuk Academy Â· Satire/Parody</span>
        </div>
        <span className={styles.dataTag}>IPL 2026</span>
      </div>
    </footer>
  );
}
