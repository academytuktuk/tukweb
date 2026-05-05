'use client';
import { useState, useEffect } from 'react';
import LeaderboardTable from './LeaderboardTable';
import styles from './PastGraduates.module.css';

interface Props {
  type: 'tuktuk' | 'run-machine';
}

export default function PastGraduates({ type }: Props) {
  const [historyData, setHistoryData] = useState<Record<string, any> | null>(null);
  const [selectedYear, setSelectedYear] = useState<string>('2025');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/data/historical_leaderboards.json')
      .then(res => res.json())
      .then(data => {
        setHistoryData(data);
        const years = Object.keys(data).sort((a, b) => parseInt(b) - parseInt(a));
        if (years.length > 0) {
          setSelectedYear(years[0]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load historical data', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className={styles.loading}><div className={styles.dot} /><div className={styles.dot} /><div className={styles.dot} /></div>;
  }

  if (!historyData) return null;

  const years = Object.keys(historyData).sort((a, b) => parseInt(b) - parseInt(a));
  const yearData = historyData[selectedYear]?.[type] || [];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.yearSelector}>
          <label>Select Season:</label>
          <select 
            value={selectedYear} 
            onChange={e => setSelectedYear(e.target.value)}
            className={styles.select}
          >
            {years.map(y => (
              <option key={y} value={y}>IPL {y}</option>
            ))}
          </select>
        </div>
      </div>
      
      {yearData.length > 0 ? (
        <LeaderboardTable type={type} top10={yearData} full={yearData} />
      ) : (
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0' }}>
          No data available for this season.
        </p>
      )}
    </div>
  );
}
