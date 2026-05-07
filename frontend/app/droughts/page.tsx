'use client';
import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import styles from './page.module.css';

const TEAMS = [
  { id: 'RCB', name: 'Royal Challengers Bengaluru', date: '2025-05-25T23:00:00+05:30', color: '#ec1c24', trophies: 1 },
  { id: 'DC', name: 'Delhi Capitals', date: '2008-04-18T00:00:00+05:30', color: '#2561e8', trophies: 0 },
  { id: 'PBKS', name: 'Punjab Kings', date: '2008-04-18T00:00:00+05:30', color: '#ed1b24', trophies: 0 },
  { id: 'RR', name: 'Rajasthan Royals', date: '2008-06-01T23:00:00+05:30', color: '#ea1a85', trophies: 1 },
  { id: 'SRH', name: 'Sunrisers Hyderabad', date: '2016-05-29T23:00:00+05:30', color: '#ff822a', trophies: 1 },
  { id: 'MI', name: 'Mumbai Indians', date: '2020-11-10T23:00:00+05:30', color: '#0077ff', trophies: 5 },
  { id: 'LSG', name: 'Lucknow Super Giants', date: '2022-03-28T00:00:00+05:30', color: '#de457f', trophies: 0 },
  { id: 'GT', name: 'Gujarat Titans', date: '2022-05-29T23:00:00+05:30', color: '#5b95ea', trophies: 1 },
  { id: 'CSK', name: 'Chennai Super Kings', date: '2023-05-29T23:00:00+05:30', color: '#f9cd05', trophies: 5 },
  { id: 'KKR', name: 'Kolkata Knight Riders', date: '2024-05-26T23:00:00+05:30', color: '#9d66e5', trophies: 3 },
];

// Sort teams by drought duration ascending (most recent date first)
const SORTED_TEAMS = [...TEAMS].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

function calculateDrought(dateStr: string) {
  const past = new Date(dateStr);
  const now = new Date();

  let seasons = now.getFullYear() - past.getFullYear();
  let anniversary = new Date(past.getTime());
  anniversary.setFullYear(now.getFullYear());
  
  if (now < anniversary) {
    seasons--;
    anniversary.setFullYear(now.getFullYear() - 1);
  }
  
  let months = 0;
  while (true) {
    const nextMonth = new Date(anniversary.getTime());
    nextMonth.setMonth(anniversary.getMonth() + 1);
    if (nextMonth > now) break;
    months++;
    anniversary = nextMonth;
  }
  
  const diffMs = now.getTime() - anniversary.getTime();
  
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diffMs / 1000 / 60) % 60);
  const seconds = Math.floor((diffMs / 1000) % 60);

  return { seasons, months, days, hours, minutes, seconds };
}

export default function DroughtsPage() {
  const [tick, setTick] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const timer = setInterval(() => {
      setTick(t => t + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!isMounted) return null;

  return (
    <>
      <Header />
      <main className={styles.page}>
      <h1 className={styles.title}>Trophy Droughts</h1>
      <p className={styles.subtitle}>
        A live tracker documenting exactly how long each franchise has been waiting to lift the coveted IPL trophy. 
        (Yes, we acknowledge RCB finally won it last year! Unbelievable, we know.)
      </p>

      <div className={styles.list}>
        {SORTED_TEAMS.map(team => {
          const d = calculateDrought(team.date);
          return (
            <div 
              key={team.id} 
              className={styles.listItem} 
              style={{ '--team-color': team.color } as React.CSSProperties}
            >
              <div className={styles.teamInfo}>
                <h2 className={styles.teamName}>{team.name}</h2>
                <div className={styles.trophyCount}>
                  {team.trophies === 0 && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      Trophyless Lmao 
                      <img src="https://em-content.zobj.net/source/apple/391/index-pointing-at-the-viewer_1faf5.png" alt="🫵" width="16" height="16" />
                      <img src="https://em-content.zobj.net/source/apple/391/rolling-on-the-floor-laughing_1f923.png" alt="🤣" width="16" height="16" />
                    </span>
                  )}
                  {team.id === 'RR' && '1 time Champions from dinosaur era'}
                  {team.trophies === 1 && team.id !== 'RR' && '1 time champion'}
                  {team.trophies > 1 && `${team.trophies} times champion`}
                </div>
              </div>
              <div className={styles.timer}>
                <div className={styles.timeBlock}>
                  <span className={styles.value}>{d.seasons}</span>
                  <span className={styles.label}>YRS</span>
                </div>
                <div className={styles.timeBlock}>
                  <span className={styles.value}>{d.months}</span>
                  <span className={styles.label}>MOS</span>
                </div>
                <div className={styles.timeBlock}>
                  <span className={styles.value}>{d.days}</span>
                  <span className={styles.label}>D</span>
                </div>
                <div className={styles.timeBlock}>
                  <span className={styles.value}>{d.hours.toString().padStart(2, '0')}</span>
                  <span className={styles.label}>H</span>
                </div>
                <div className={styles.timeBlock}>
                  <span className={styles.value}>{d.minutes.toString().padStart(2, '0')}</span>
                  <span className={styles.label}>M</span>
                </div>
                <div className={styles.timeBlock}>
                  <span className={styles.value}>{d.seconds.toString().padStart(2, '0')}</span>
                  <span className={styles.label}>S</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </main>
    <Footer />
  </>
  );
}
