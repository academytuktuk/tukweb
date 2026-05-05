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

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://tukweb-production.up.railway.app';

export default function PlayerCard({ potd, type }: Props) {
  const isTuktuk = type === 'tuktuk';
  const label = isTuktuk ? 'TukTuk Player of the Day' : 'Run Machine Player of the Day';

  if (!potd) {
    return (
      <div className={`${styles.placeholder} ${isTuktuk ? styles.tukPlaceholder : styles.dinPlaceholder}`}>
        <div className={styles.placeholderIcon}>{isTuktuk ? 'ðŸ' : 'ðŸŽ³'}</div>
        <p className={styles.placeholderTitle}>{label}</p>
        <p className={styles.placeholderSub}>Card will appear here once uploaded</p>
      </div>
    );
  }

  const imageUrl = potd.imageUrl.startsWith('http')
    ? potd.imageUrl
    : `${API_BASE}${potd.imageUrl}`;

  const date = new Date(potd.date).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  return (
    <div className={`${styles.wrapper} ${isTuktuk ? styles.tukWrapper : styles.dinWrapper}`}>
      <div className={styles.badge}>{label}</div>
      <div className={styles.cardOuter}>
        <img
          src={imageUrl}
          alt={`${potd.playerName} â€” ${label}`}
          className={`${styles.cardImg} float-anim`}
        />
      </div>
      <div className={styles.footer} style={{ justifyContent: 'flex-end' }}>
        <span className={styles.date}>{date}</span>
      </div>
    </div>
  );
}
