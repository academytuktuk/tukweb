import styles from './TeamPointsTable.module.css';

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

interface TukTukTeamRow {
  rank: number;
  team: string;
  matchesPlayed: number;
  ballsFaced: number;
  runsBatted: number;
  teamSR: number;
  tuktukScore: number;
}

interface DindaTeamRow {
  rank: number;
  team: string;
  matchesPlayed: number;
  oversBowled: number;
  runsConceded: number;
  wicketsTaken: number;
  economy: number;
  wktsPerOver: number;
  runMachineScore: number;
}

interface Props {
  type: 'tuktuk' | 'run-machine';
  rows: TukTukTeamRow[] | DindaTeamRow[];
}

function TeamBadge({ team }: { team: string }) {
  const c = TEAM_COLORS[team] || { bg: '#333', text: '#fff' };
  return (
    <div className={styles.teamCell}>
      <span className={styles.teamPill} style={{ background: c.bg, color: c.text }}>
        {team}
      </span>
      <span className={styles.teamName}>{team}</span>
    </div>
  );
}

export default function TeamPointsTable({ type, rows }: Props) {
  const isTuktuk = type === 'tuktuk';

  return (
    <div className={`table-wrapper ${isTuktuk ? styles.tukBorder : styles.dinBorder}`}>
      <table className={`pts-table ${!isTuktuk ? 'dinda-pts' : ''}`}>
        <thead>
          <tr>
            <th>#</th>
            <th>Team</th>
            {isTuktuk ? (
              <>
                <th>Matches</th>
                <th>Total Runs</th>
                <th>Balls Faced</th>
                <th>Team SR</th>
                <th className={styles.scoreHead}>TukTuk Score ↓</th>
              </>
            ) : (
              <>
                <th>Matches</th>
                <th>Overs</th>
                <th>Runs Given</th>
                <th>Wkts</th>
                <th>Economy</th>
                <th>Wkts/Over</th>
                <th className={styles.scoreHead}>Run Machine Score ↓</th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={isTuktuk ? 7 : 9} className={styles.emptyCell}>
                No team data yet — matches will appear after sync
              </td>
            </tr>
          ) : isTuktuk ? (
            (rows as TukTukTeamRow[]).map((row) => (
              <tr key={row.team} className={row.rank === 1 ? styles.topRow : ''}>
                <td style={{ paddingRight: '16px' }}>
                  <span className={`${styles.rankNum} ${row.rank <= 3 ? styles[`rank${row.rank}`] : ''}`}>
                    {row.rank}
                  </span>
                </td>
                <td><TeamBadge team={row.team} /></td>
                <td>{row.matchesPlayed}</td>
                <td>{row.runsBatted.toLocaleString()}</td>
                <td>{row.ballsFaced.toLocaleString()}</td>
                <td>{row.teamSR.toFixed(1)}</td>
                <td className="score-col">{row.tuktukScore.toFixed(2)}</td>
              </tr>
            ))
          ) : (
            (rows as DindaTeamRow[]).map((row) => (
              <tr key={row.team} className={row.rank === 1 ? styles.topRow : ''}>
                <td style={{ paddingRight: '16px' }}>
                  <span className={`${styles.rankNum} ${row.rank <= 3 ? styles[`rank${row.rank}`] : ''}`}>
                    {row.rank}
                  </span>
                </td>
                <td><TeamBadge team={row.team} /></td>
                <td>{row.matchesPlayed}</td>
                <td>{row.oversBowled.toFixed(1)}</td>
                <td>{row.runsConceded}</td>
                <td>{row.wicketsTaken}</td>
                <td>{row.economy.toFixed(2)}</td>
                <td>{row.wktsPerOver.toFixed(3)}</td>
                <td className="score-col">{row.runMachineScore.toFixed(2)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
