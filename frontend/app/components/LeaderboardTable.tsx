'use client';
import { useState } from 'react';
import styles from './LeaderboardTable.module.css';

interface TukTukRow {
  rank: number;
  playerId: number;
  name: string;
  team: string;
  innings: number;
  totalRuns: number;
  totalBalls: number;
  avgRuns: number;
  avgBalls: number;
  avgSR: number;
  tuktukScore: number;
}

interface RunMachineRow {
  rank: number;
  playerId: number;
  name: string;
  team: string;
  innings: number;
  totalOvers: number;
  totalRuns: number;
  totalWickets: number;
  economy: number;
  wktsPerOver: number;
  runMachineScore: number;
}

interface Props {
  type: 'tuktuk' | 'run-machine';
  top10: TukTukRow[] | RunMachineRow[];
  full: TukTukRow[] | RunMachineRow[];
}

// IPL team colors
const TEAM_COLORS: Record<string, { bg: string; text: string }> = {
  MI:   { bg: '#005DA0', text: '#FFFFFF' },
  CSK:  { bg: '#F5C518', text: '#000000' },
  RCB:  { bg: '#CC0000', text: '#FFFFFF' },
  KKR:  { bg: '#3A225D', text: '#F5C518' },
  DC:   { bg: '#17479E', text: '#FF6B6B' },
  PBKS: { bg: '#ED1B24', text: '#FFFFFF' },
  RR:   { bg: '#EA1A85', text: '#FFFFFF' },
  SRH:  { bg: '#FF5C00', text: '#FFFFFF' },
  GT:   { bg: '#1C3660', text: '#C7A84B' },
  LSG:  { bg: '#5BA3E8', text: '#1A2F5A' },
};

function TeamPill({ team }: { team: string }) {
  const colors = TEAM_COLORS[team] || { bg: '#333', text: '#fff' };
  return (
    <span
      className={styles.teamPill}
      style={{ background: colors.bg, color: colors.text }}
    >
      {team}
    </span>
  );
}

function RankBadge({ rank }: { rank: number }) {
  const cls = rank === 1 ? styles.rank1 : rank === 2 ? styles.rank2 : rank === 3 ? styles.rank3 : '';
  return <span className={`${styles.rankBadge} ${cls}`}>#{rank}</span>;
}

export function formatPlayerName(name: string): string {
  if (!name) return '';
  const parts = name.split(' ');
  if (parts.length > 1) {
    return `${parts[0].charAt(0)} ${parts.slice(1).join(' ')}`;
  }
  return name;
}

export default function LeaderboardTable({ type, top10, full }: Props) {
  const [showAll, setShowAll] = useState(false);
  const rows = showAll ? full : top10;
  const isTuktuk = type === 'tuktuk';

  return (
    <div className={styles.wrapper}>
      <div className={`table-wrapper ${isTuktuk ? styles.tukBorder : styles.dinBorder}`}>
        <table className={`lb-table ${!isTuktuk ? 'dinda-table' : ''}`}>
          <thead>
            <tr>
              <th className="sticky-col rank-col">Rank</th>
              <th className="sticky-col player-col">Player</th>
              {isTuktuk ? (
                <>
                  <th className="text-right">Inn</th>
                  <th className="text-right">Runs(Balls)</th>
                  <th className="text-right">SR</th>
                  <th className={`text-right ${styles.scoreHead}`}>TukTuk â†“</th>
                </>
              ) : (
                <>
                  <th className="text-right">Inn</th>
                  <th className="text-right">Overs</th>
                  <th className="text-right">Runs</th>
                  <th className="text-right">Wkts</th>
                  <th className="text-right">Econ</th>
                  <th className="text-right">W.Drought</th>
                  <th className={`text-right ${styles.scoreHead}`}>Score â†“</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={isTuktuk ? 7 : 9} className={styles.emptyCell}>
                  No qualifying data yet. Check back after matches are synced.
                </td>
              </tr>
            ) : isTuktuk ? (
              (rows as TukTukRow[]).map((row) => (
                <tr key={row.playerId} className={row.rank === 1 ? 'rank-one' : ''}>
                  <td className="sticky-col rank-col"><RankBadge rank={row.rank} /></td>
                  <td className="sticky-col player-col">
                    <div className={styles.playerCell}>
                      <span className={styles.playerName}>{formatPlayerName(row.name)}</span>
                      <TeamPill team={row.team} />
                    </div>
                  </td>
                  <td className="stat">{row.innings}</td>
                  <td className="stat">{row.totalRuns}<span style={{color:'var(--text-muted)',fontWeight:400}}>({row.totalBalls})</span></td>
                  <td className="stat">{row.avgSR.toFixed(1)}</td>
                  <td className="score-col text-right">{row.tuktukScore.toFixed(2)}</td>
                </tr>
              ))
            ) : (
              (rows as RunMachineRow[]).map((row) => (
                <tr key={row.playerId} className={row.rank === 1 ? 'rank-one' : ''}>
                  <td className="sticky-col rank-col"><RankBadge rank={row.rank} /></td>
                  <td className="sticky-col player-col">
                    <div className={styles.playerCell}>
                      <span className={styles.playerName}>{formatPlayerName(row.name)}</span>
                      <TeamPill team={row.team} />
                    </div>
                  </td>
                  <td className="stat">{row.innings}</td>
                  <td className="stat">{row.totalOvers.toFixed(1)}</td>
                  <td className="stat">{row.totalRuns}</td>
                  <td className="stat">{row.totalWickets}</td>
                  <td className="stat">{row.economy.toFixed(2)}</td>
                  <td className="stat">{row.wktsPerOver.toFixed(2)}</td>
                  <td className="score-col text-right">{row.runMachineScore.toFixed(2)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Show more / less toggle */}
      {full.length > 10 && (
        <div className={styles.toggleRow}>
          <button
            className={`btn ${isTuktuk ? 'btn-tuktuk' : 'btn-dinda'} ${styles.toggleBtn}`}
            onClick={() => setShowAll((v) => !v)}
          >
            {showAll ? 'â–² Show Less' : `â–¼ Show All (${full.length})`}
          </button>
          <span className={styles.totalCount}>
            {full.length} qualifying players
          </span>
        </div>
      )}
    </div>
  );
}
