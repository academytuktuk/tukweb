import styles from './PlayerCard.module.css';

interface POTD {
  id: number;
  type: string;
  imageUrl: string;
  playerName: string;
  stats: string;
  date: string;
}

interface Props {
  potd: POTD | null;
  type: 'tuktuk' | 'run-machine';
}

const API_BASE = (typeof window !== 'undefined' && window.location.hostname === 'localhost') ? 'http://localhost:4000' : '';

export default function PlayerCard({ potd, type }: Props) {
  const isTuktuk = type === 'tuktuk';
  const label = isTuktuk ? 'TukTuk Player of the Day' : 'Run Machine Player of the Day';

  if (!potd) {
    return (
      <div className={`${styles.placeholder} ${isTuktuk ? styles.tukPlaceholder : styles.dinPlaceholder}`}>
        <div className={styles.placeholderIcon}>{isTuktuk ? '🏏' : '🎳'}</div>
        <p className={styles.placeholderTitle}>{label}</p>
        <p className={styles.placeholderSub}>Card will appear here once uploaded</p>
      </div>
    );
  }

  const date = new Date(potd.date).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  // ── AUTO-GENERATED stat card (imageUrl === 'auto') ───────────────────────────
  if (potd.imageUrl === 'auto') {
    let parsed: Record<string, any> = {};
    try { parsed = JSON.parse(potd.stats); } catch {}

    if (isTuktuk) {
      const sr = parseFloat(parsed.sr ?? '0');
      const srColor = sr < 80 ? '#e53935' : sr < 100 ? '#ff6d00' : sr <= 130 ? '#fdd835' : '#00c853';
      const srBarPct = Math.min((sr / 200) * 100, 100);
      return (
        <div className={`${styles.autoCard} ${styles.autoCardTuk}`}>
          <div className={styles.autoBadge}>{label}</div>
          <div className={styles.autoNote}>Auto-selected · No admin card uploaded</div>
          <div className={styles.autoPlayerName}>{potd.playerName}</div>
          {parsed.team && <div className={styles.autoTeam}>{parsed.team}</div>}
          <div className={styles.autoStatRow}>
            <div className={styles.autoMainStat}>
              <span className={styles.autoRunsNum}>{parsed.runs ?? '–'}</span>
              <span className={styles.autoBallsNum}>({parsed.balls ?? '–'})</span>
            </div>
            <div className={styles.autoSrBlock}>
              <div className={styles.autoSrLabel}>STRIKE RATE</div>
              <div className={styles.autoSrValue} style={{ color: srColor }}>{parsed.sr ?? '–'}</div>
              <div className={styles.autoBar}>
                <div className={styles.autoBarFill} style={{ width: `${srBarPct}%`, background: srColor }} />
              </div>
            </div>
          </div>
          <div className={styles.autoFooter}>
            <span className={styles.autoScore}>TukTuk Score: <strong>{parsed.tuktukScore ?? '–'}</strong></span>
            <span className={styles.date}>{date}</span>
          </div>
        </div>
      );
    } else {
      const eco = parseFloat(parsed.economy ?? '0');
      const ecoColor = eco < 8 ? '#00c853' : eco <= 12 ? '#ff6d00' : '#e53935';
      const ecoBarPct = Math.min((eco / 20) * 100, 100);
      return (
        <div className={`${styles.autoCard} ${styles.autoCardDin}`}>
          <div className={`${styles.autoBadge} ${styles.autoBadgeDin}`}>{label}</div>
          <div className={styles.autoNote}>Auto-selected · No admin card uploaded</div>
          <div className={styles.autoPlayerName}>{potd.playerName}</div>
          {parsed.team && <div className={`${styles.autoTeam} ${styles.autoTeamDin}`}>{parsed.team}</div>}
          <div className={styles.autoStatRow}>
            <div className={styles.autoMainStat}>
              <span className={`${styles.autoRunsNum} ${styles.autoSpellNum}`}>{parsed.spell ?? '–'}</span>
            </div>
            <div className={styles.autoSrBlock}>
              <div className={styles.autoSrLabel}>ECONOMY</div>
              <div className={styles.autoSrValue} style={{ color: ecoColor }}>{parsed.economy ?? '–'}</div>
              <div className={styles.autoBar}>
                <div className={styles.autoBarFill} style={{ width: `${ecoBarPct}%`, background: ecoColor }} />
              </div>
            </div>
          </div>
          <div className={styles.autoFooter}>
            <span className={styles.autoScore}>Run Machine Score: <strong>{parsed.runMachineScore ?? '–'}</strong></span>
            <span className={styles.date}>{date}</span>
          </div>
        </div>
      );
    }
  }

  // ── ADMIN-UPLOADED image card (original behaviour) ───────────────────────────
  const imageUrl = potd.imageUrl.startsWith('http')
    ? potd.imageUrl
    : `${API_BASE}${potd.imageUrl}`;

  return (
    <div className={`${styles.wrapper} ${isTuktuk ? styles.tukWrapper : styles.dinWrapper}`}>
      <div className={styles.badge}>{label}</div>
      <div className={styles.cardOuter}>
        <img
          src={imageUrl}
          alt={`${potd.playerName} — ${label}`}
          className={`${styles.cardImg} float-anim`}
        />
      </div>
      <div className={styles.footer} style={{ justifyContent: 'flex-end' }}>
        <span className={styles.date}>{date}</span>
      </div>
    </div>
  );
}
