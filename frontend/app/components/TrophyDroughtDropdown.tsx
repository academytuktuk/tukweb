'use client';
import { useState, useEffect, useRef } from 'react';
import styles from './TrophyDrought.module.css';

const TEAMS = [
  { id: 'RCB', name: 'Royal Challengers Bengaluru', date: '2008-04-18T00:00:00+05:30' },
  { id: 'DC', name: 'Delhi Capitals', date: '2008-04-18T00:00:00+05:30' },
  { id: 'PBKS', name: 'Punjab Kings', date: '2008-04-18T00:00:00+05:30' },
  { id: 'RR', name: 'Rajasthan Royals', date: '2008-06-01T23:00:00+05:30' },
  { id: 'SRH', name: 'Sunrisers Hyderabad', date: '2016-05-29T23:00:00+05:30' },
  { id: 'MI', name: 'Mumbai Indians', date: '2020-11-10T23:00:00+05:30' },
  { id: 'LSG', name: 'Lucknow Super Giants', date: '2022-03-28T00:00:00+05:30' },
  { id: 'GT', name: 'Gujarat Titans', date: '2022-05-29T23:00:00+05:30' },
  { id: 'CSK', name: 'Chennai Super Kings', date: '2023-05-29T23:00:00+05:30' },
  { id: 'KKR', name: 'Kolkata Knight Riders', date: '2024-05-26T23:00:00+05:30' },
];

function calculateDrought(dateStr: string) {
  const past = new Date(dateStr);
  const now = new Date();

  let seasons = now.getFullYear() - past.getFullYear();
  let months = now.getMonth() - past.getMonth();
  let days = now.getDate() - past.getDate();
  let hours = now.getHours() - past.getHours();
  let minutes = now.getMinutes() - past.getMinutes();
  let seconds = now.getSeconds() - past.getSeconds();

  if (seconds < 0) {
    minutes -= 1;
    seconds += 60;
  }
  if (minutes < 0) {
    hours -= 1;
    minutes += 60;
  }
  if (hours < 0) {
    days -= 1;
    hours += 24;
  }
  if (days < 0) {
    months -= 1;
    const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    days += prevMonth.getDate();
  }
  if (months < 0) {
    seasons -= 1;
    months += 12;
  }

  return { seasons, months, days, hours, minutes, seconds };
}

export default function TrophyDroughtDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [tick, setTick] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Update timer every second
  useEffect(() => {
    if (!isOpen) return; // Only tick when open to save performance
    const timer = setInterval(() => {
      setTick(t => t + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className={styles.container} ref={dropdownRef}>
      <button 
        className={styles.triggerBtn} 
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span>ðŸ† Trophy Droughts</span>
      </button>

      <div className={`${styles.dropdown} ${isOpen ? styles.open : ''}`}>
        <div className={styles.header}>
          Time Since Last Trophy
        </div>
        <div className={styles.list}>
          {TEAMS.map(team => {
            const d = calculateDrought(team.date);
            return (
              <div key={team.id} className={styles.teamItem}>
                <div className={styles.teamName}>{team.name}</div>
                <div className={styles.timer}>
                  <span className={styles.highlight}>{d.seasons}</span> {d.seasons === 1 ? 'season' : 'seasons'},{' '}
                  <span className={styles.highlight}>{d.months}</span> {d.months === 1 ? 'month' : 'months'},{' '}
                  <span className={styles.highlight}>{d.days}</span> {d.days === 1 ? 'day' : 'days'},{' '}
                  <span className={styles.highlight}>{d.hours}</span> {d.hours === 1 ? 'hour' : 'hours'},{' '}
                  <span className={styles.highlight}>{d.minutes}</span> {d.minutes === 1 ? 'minute' : 'minutes'}, and{' '}
                  <span className={styles.highlight}>{d.seconds}</span> {d.seconds === 1 ? 'second' : 'seconds'}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
