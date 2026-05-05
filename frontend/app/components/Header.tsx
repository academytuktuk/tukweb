'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useTheme } from './ThemeProvider';
import LiveDroughtTracker from './LiveDroughtTracker';
import styles from './Header.module.css';

const NAV_LINKS = [
  { label: 'Home',            href: '/' },
  { label: 'TukTuk Academy',  href: '/tuktuk' },
  { label: 'Run Machine Academy',   href: '/run-machine' },
  { label: 'Trophy Droughts', href: '/droughts' },
  { label: 'Hall of Fame',    href: '/hall-of-fame' },
  { label: 'Suggestions',     href: '/suggest' },
  { label: 'Contact Us',      href: '/contact' },
];

const MENU_ITEMS = [
  { label: 'Home',          href: '/' },
  { label: 'TukTuk Academy', href: '/tuktuk' },
  { label: 'Run Machine Academy',  href: '/run-machine' },
  { label: 'Trophy Droughts', href: '/droughts' },
  { label: 'Hall of Fame',  href: '/hall-of-fame' },
  { label: 'Suggestions',   href: '/suggest' },
  { label: 'Contact',       href: '/contact' },
  { label: 'Disclaimer',    href: '/disclaimer' },
];

export default function Header() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { theme, toggle } = useTheme();

  useEffect(() => { setIsOpen(false); }, [pathname]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsOpen(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <>
      <header className={styles.header}>
        <div className={styles.inner}>

          {/* Hamburger */}
          <button
            className={`${styles.hamburger} ${isOpen ? styles.open : ''}`}
            onClick={() => setIsOpen(v => !v)}
            aria-label="Toggle menu"
            aria-expanded={isOpen}
          >
            <span />
            <span />
            <span />
          </button>

          {/* Logo */}
          <Link href="/" className={styles.logo}>
            <span className={styles.logoTuk}>TUK</span>
            <span className={styles.logoTuk2}>TUK</span>
            <span className={styles.logoDivider}>&amp;</span>
            <span className={styles.logoDinda}>RUN MACHINE</span>
            <span className={styles.logoAcademy}>ACADEMY</span>
          </Link>

          {/* Nav */}
          <nav className={styles.nav} aria-label="Main navigation">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`${styles.navLink} ${pathname === link.href ? styles.active : ''}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className={styles.rightSlot}>
            <div className={styles.iplBadge}>
              <span className={styles.badgeDot} />
              IPL 2026
            </div>
          </div>
        </div>
      </header>

      {/* Live Boundary Drought Tracker */}
      <LiveDroughtTracker />

      {/* Overlay */}
      <div
        className={`${styles.overlay} ${isOpen ? styles.overlayOpen : ''}`}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      {/* Slide-in panel */}
      <nav
        className={`${styles.sidePanel} ${isOpen ? styles.sidePanelOpen : ''}`}
        aria-label="Side navigation"
      >
        <div className={styles.sidePanelHeader}>
          <span className={styles.sidePanelTitle}>Menu</span>
        </div>

        <div className={styles.sidePanelItems}>
          {MENU_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.sideItem} ${isActive ? styles.sideItemActive : ''}`}
                onClick={() => setIsOpen(false)}
              >
                {item.label}
                {isActive && <span className={styles.activeIndicator} />}
              </Link>
            );
          })}
        </div>

        {/* Theme toggle */}
        <div className={styles.sidePanelFooter}>
          <span className={styles.themeLabel}>Appearance</span>
          <button
            className={styles.themeToggle}
            onClick={toggle}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            <span className={styles.themeIcon}>
              {theme === 'dark' ? '☀' : '☽'}
            </span>
            <span className={styles.themeText}>
              {theme === 'dark' ? 'Light mode' : 'Dark mode'}
            </span>
          </button>
        </div>
      </nav>
    </>
  );
}
