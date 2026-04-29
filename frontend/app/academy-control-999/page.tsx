'use client';
import { useState, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';
import styles from './page.module.css';

const roastDb = {
  batter: {
      "0-50": ["Legendary commitment to the dot ball strategy.", "Gavaskar is crying tears of joy at this masterpiece.", "Saving the test match spirit in a T20 game.", "Absolute wall. No runs, no risks, just pure meditation."],
      "50-55": ["Exhibiting the movement speed of a majestic statue.", "Respecting the red ball in a white ball world.", "Mastering the art of making the crowd fall asleep."],
      "55-60": ["The TukTuk academy's valedictorian has arrived.", "A performance so slow, it’s legally considered art.", "Blocking like his life depends on the zero boundary count."],
      "60-65": ["Solid contribution to the opposition's winning chances.", "Modern day wall, though cement seems to be missing.", "Wait, is this a highlight reel in 0.25x speed?"],
      "65-70": ["Elite concentration on strictly avoiding any risk.", "Classical era 1975 cricket is back, thanks to you.", "Perfectly preserving the pitch for the next generation."],
      "70-75": ["A bit too aggressive for a burial ground, isn't it?", "Taking 'Playing for the draw' to a whole new level.", "The bowlers are thanking you for the extra rest."],
      "75-80": ["Playing for the draw in a format where draws don't exist.", "Masterclass in how to stay till the end without scoring.", "Solid defense. If only we were playing Test cricket."],
      "80-85": ["Too fast for a turtle, too slow for a fan.", "Almost reached the speed of a brisk walk.", "Generously letting the fielders stay in their positions."],
      "85-90": ["A truly selfless innings for the opposition economy.", "Nearly visible to the naked eye. Impressive pace.", "The king of the single and the master of peace."],
      "90-95": ["Consistent 0.9 runs per ball. Thanos loves this balance.", "Calculated approach to keep the scorecard boring.", "Almost looking like a T20 player... almost."],
      "95-100": ["Perfectly balanced strike rate, as all things should be.", "One run per ball: The ultimate peace treaty with bowlers.", "Masterclass in the 'Better Safe than Sorry' philosophy."],
      "100-105": ["Daring to hit a boundary every 12 balls. Bold choice.", "Slightly above the legal speed limit for a TukTuk.", "Wait, did he just try to hit a six? We are worried."],
      "105-110": ["A high-speed TukTuk on the highway. Dangerous pace.", "Calculated risks that only bother the fielders slightly.", "Mastering the art of the 'Aggressive Single'."],
      "110-115": ["Almost hitting at the rate of a normal human.", "Breaking the core values of the TukTuk Academy.", "An innings so decent, it's actually hard to roast."],
      "115-120": ["Aggressive enough to wake up the 3rd row crowd.", "Is this a glitch in the defensive matrix?", "Decent, but where is the commitment to blocking?"],
      "120-125": ["Borderline useful innings. We are highly confused.", "Masterclass in 'Accidental Hitting'. Please focus.", "Almost reached a strike rate that matters. Almost."],
      "125-130": ["Disappointing the Academy with this much intent.", "Actually hitting boundaries? Who allowed this?", "A very unsafe way to play a safe game."],
      "130-135": ["Almost reached the 140 mark. You're losing your touch.", "A suspiciously good innings. Check his bat for energy.", "Wait, is he actually trying to win the game?"],
      "135-140": ["Are you actually a T20 player? Get out of the Academy.", "Mastering the art of 'Accidentally Winning'.", "Is this a masterclass or just a very lucky day?"],
      "140+": ["Accidental aggression. Return to blocking immediately.", "You have failed the TukTuk Academy. This is too fast.", "Hitting boundaries is for amateurs. Pros stick to 100 SR."]
  },
  bowler: {
      "danger": ["Run Machine Academy Platinum Membership Unlocked.", "Generously donating runs to the needy opposition.", "Breaking the speed limit... of runs conceded per over."],
      "warning": ["Providing a very comfortable batting experience.", "The batsmen are considering you their best friend.", "Almost a decent spell, just missing the 'wickets' part."],
      "success": ["Wait, why are you actually bowling well?", "Unfair to the batsmen. Where is the charity?", "A spell so good it doesn't belong on this card."]
  }
};

const TEAMS = [
  { id: 'MI', name: 'Mumbai Indians', color: '#00d4ff' },
  { id: 'CSK', name: 'Chennai Super Kings', color: '#ffff00' },
  { id: 'RCB', name: 'Royal Challengers Bengaluru', color: '#ec1c24' },
  { id: 'KKR', name: 'Kolkata Knight Riders', color: '#622b82' },
  { id: 'GT', name: 'Gujarat Titans', color: '#1c2d5e' },
  { id: 'SRH', name: 'Sunrisers Hyderabad', color: '#fe5217' },
  { id: 'DC', name: 'Delhi Capitals', color: '#ef4123' },
  { id: 'LSG', name: 'Lucknow Super Giants', color: '#005ea8' },
  { id: 'PBKS', name: 'Punjab Kings', color: '#d11a2a' },
  { id: 'RR', name: 'Rajasthan Royals', color: '#004ba0' },
];

export default function AdminGenerator() {
  const [mode, setMode] = useState<'batter' | 'bowler'>('batter');
  const [playerName, setPlayerName] = useState('');
  const [matchCtx, setMatchCtx] = useState('');
  const [team, setTeam] = useState(TEAMS[0]);
  const [photo, setPhoto] = useState('https://via.placeholder.com/800x800?text=Player+Photo');
  const [customRoast, setCustomRoast] = useState('');
  const [adminPwd, setAdminPwd] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [unlockError, setUnlockError] = useState(false);
  const [adminTab, setAdminTab] = useState<'generator' | 'suggestions'>('generator');
  const [suggestions, setSuggestions] = useState<any[]>([]);

  const fetchSuggestions = async (pwd: string) => {
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const res = await fetch(`${API_BASE}/api/suggest/admin`, { headers: { 'x-admin-password': pwd }});
      if (res.ok) {
        const data = await res.json();
        setSuggestions(data);
      }
    } catch {}
  };

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const res = await fetch(`${API_BASE}/api/potd/verify`, {
        method: 'POST',
        headers: { 'x-admin-password': adminPwd }
      });
      if (res.ok) {
        setIsUnlocked(true);
        fetchSuggestions(adminPwd);
      } else {
        setUnlockError(true);
      }
    } catch {
      setUnlockError(true);
    }
  };

  // Batter
  const [runs, setRuns] = useState(30);
  const [balls, setBalls] = useState(40);

  // Bowler
  const [overs, setOvers] = useState(4);
  const [maidens, setMaidens] = useState(0);
  const [runsLeaked, setRunsLeaked] = useState(55);
  const [wickets, setWickets] = useState(0);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const cardRef = useRef<HTMLDivElement>(null);
  const hiddenCardRef = useRef<HTMLDivElement>(null);
  const [customCardFile, setCustomCardFile] = useState<File | null>(null);

  // Computed Stats
  const sr = balls > 0 ? ((runs / balls) * 100) : 0;
  const eco = overs > 0 ? (runsLeaked / overs) : 0;

  // Auto roast
  const getAutoRoast = () => {
    if (mode === 'bowler') {
      const category = eco > 12 ? 'danger' : eco > 9 ? 'warning' : 'success';
      const options = roastDb.bowler[category];
      return options[Math.floor(Math.random() * options.length)];
    }
    let key = "140+";
    if (sr <= 50) key = "0-50";
    else if (sr <= 140) {
      const step = 5;
      const lower = Math.floor(sr / step) * step;
      key = `${lower}-${lower + step}`;
    }
    const options = roastDb.batter[key as keyof typeof roastDb.batter] || roastDb.batter["140+"];
    return options[Math.floor(Math.random() * options.length)];
  };

  const finalRoast = mounted ? (customRoast.trim() || getAutoRoast()) : '';
  const themeColor = team.color;

  // Colors
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : null;
  };
  const rgb = hexToRgb(themeColor) || { r: 0, g: 212, b: 255 };
  const darkBg = `rgb(${Math.max(rgb.r * 0.05, 5)}, ${Math.max(rgb.g * 0.05, 6)}, ${Math.max(rgb.b * 0.05, 10)})`;
  const teamGlow = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)`;

  // Generate Image
  const handleExport = async (publish: boolean) => {
    if (!publish && !hiddenCardRef.current) return;
    setLoading(true);
    setStatusMsg(publish ? 'Publishing...' : 'Downloading...');

    try {
      let blob: Blob;

      if (publish && customCardFile) {
        // User provided a manually generated card, skip html2canvas completely
        blob = customCardFile;
      } else {
        // Generate via html2canvas
        if (!hiddenCardRef.current) throw new Error('Ref missing');
        const canvas = await html2canvas(hiddenCardRef.current, { width: 1200, height: 675, scale: 2, useCORS: true, backgroundColor: null });
        const dataUrl = canvas.toDataURL('image/png');
        
        if (!publish) {
          const link = document.createElement('a');
          link.download = `POTD_${Date.now()}.png`;
          link.href = dataUrl;
          link.click();
          setStatusMsg('Downloaded!');
          setLoading(false);
          setTimeout(() => setStatusMsg(''), 5000);
          return;
        }

        // Convert base64 to blob robustly for publishing
        const byteString = atob(dataUrl.split(',')[1]);
        const mimeString = dataUrl.split(',')[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
        blob = new Blob([ab], { type: mimeString });
      }

      const fd = new FormData();
      fd.append('card', blob, 'card.png');
      fd.append('type', mode === 'batter' ? 'tuktuk' : 'run-machine');
      fd.append('playerName', playerName || 'PLAYER NAME');
      fd.append('stats', JSON.stringify(mode === 'batter' ? { runs, balls, sr } : { overs, maidens, runs: runsLeaked, wickets, eco }));

      const res = await fetch('http://localhost:4000/api/potd/upload', {
        method: 'POST',
        headers: { 'x-admin-password': adminPwd },
        body: fd
      });
      
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server returned ${res.status}`);
      }
      setStatusMsg('Published to Website!');
    } catch (e: any) {
      console.error(e);
      setStatusMsg(`Error: ${e.message}`);
    } finally {
      setLoading(false);
      setTimeout(() => setStatusMsg(''), 5000);
    }
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setPhoto(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const renderCard = (ref: React.RefObject<HTMLDivElement>) => (
    <div 
      ref={ref} 
      className={styles.cardPreview} 
      style={{ 
        '--team-color': themeColor,
        '--dark-bg': darkBg,
        '--team-glow': teamGlow,
        background: `radial-gradient(circle at 20% 20%, ${teamGlow} 0%, ${darkBg} 100%)`
      } as React.CSSProperties}
    >
      <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&family=Inter:wght@400;600;800&display=swap" rel="stylesheet" />

      <div className={`${styles.glowSpot} ${styles.gs1}`} style={{ background: themeColor }}></div>
      <div className={`${styles.glowSpot} ${styles.gs2}`} style={{ background: themeColor }}></div>
      
      <div className={styles.visualOverlay}>
        <svg width="100%" height="100%" viewBox="0 0 1200 675" preserveAspectRatio="none">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" opacity="0.1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          <path d="M-100,200 L400,-50 L350,150 Z" fill={themeColor} opacity="0.15" />
          <path d="M800,700 L1300,400 L1100,800 Z" fill={themeColor} opacity="0.1" />
          <path d="M1000,-100 L1250,200 L1100,50 Z" fill="white" opacity="0.05" />
          <circle cx="1100" cy="550" r="300" stroke={themeColor} strokeWidth="1" fill="none" opacity="0.1" />
          <circle cx="1100" cy="550" r="250" stroke={themeColor} strokeWidth="3" strokeDasharray="20 40" fill="none" opacity="0.2" />
        </svg>
      </div>

      <div className={styles.playerPhoto} style={{ backgroundImage: `url(${photo})` }}></div>
      <div className={styles.cardFade} style={{ background: `linear-gradient(to right, ${darkBg} 35%, rgba(${rgb.r},${rgb.g},${rgb.b},0) 100%)` }}></div>
      
      <div className={styles.cardBody}>
        <div>
          <div className={styles.awardTitle} style={{ background: mode === 'batter' ? '#ff4757' : '#6a1b9a' }}>
            {mode === 'batter' ? 'TUKTUK PLAYER OF THE DAY' : 'RUN MACHINE PLAYER OF THE DAY'}
          </div>
          <div className={styles.cardHeader} style={{ borderLeftColor: themeColor }}>
            <div className={styles.teamText} style={{ color: themeColor }}>{team.name}</div>
            <div className={styles.playerName}>{playerName || 'PLAYER NAME'}</div>
            <div className={styles.matchText}>{matchCtx || 'MATCH CONTEXT'}</div>
          </div>
        </div>

        <div className={styles.statsMain}>
          {mode === 'batter' ? (
            <div className={styles.scoreRow}>{runs} <span className={styles.scoreBalls}>({balls})</span></div>
          ) : (
            <div className={`${styles.scoreRow} ${styles.bowlerSpell}`}>{overs}-{maidens}-{runsLeaked}-{wickets}</div>
          )}
          <div className={styles.roastBadge} style={{ color: mode === 'batter' && sr < 80 ? '#ff4757' : '#ffa502', borderLeftColor: mode === 'batter' && sr < 80 ? '#ff4757' : '#ffa502' }}>
            "{finalRoast}"
          </div>
        </div>
      </div>

      <div className={styles.statSidebar}>
        <span className={styles.statLabel}>{mode === 'batter' ? 'STRIKE RATE' : 'ECONOMY'}</span>
        <div className={styles.statValue}>{mode === 'batter' ? sr.toFixed(1) : eco.toFixed(1)}</div>
        <div className={styles.progressContainer}>
          <div className={styles.progressFill} style={{ 
            width: `${Math.min(mode === 'batter' ? sr / 2 : eco * 6, 100)}%`,
            backgroundColor: mode === 'batter' ? (sr < 80 ? '#ff4757' : sr < 110 ? '#ffa502' : '#2ed573') : (eco > 12 ? '#ff4757' : eco > 9 ? '#ffa502' : '#2ed573')
          }}></div>
        </div>
      </div>

      <div className={styles.footerText}>IPL 2026</div>
    </div>
  );

  if (!isUnlocked) {
    return (
      <div className={styles.adminPage} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'var(--bg-primary)' }}>
        <form onSubmit={handleUnlock} style={{ background: 'var(--bg-card)', padding: 40, borderRadius: 12, textAlign: 'center', border: '1px solid var(--border-strong)', width: '100%', maxWidth: 400 }}>
          <h2 style={{ marginBottom: 20, fontFamily: 'var(--font-display)', letterSpacing: '0.05em' }}>Admin Access</h2>
          <input 
            type="password" 
            placeholder="Admin Password" 
            value={adminPwd} 
            onChange={e => { setAdminPwd(e.target.value); setUnlockError(false); }}
            style={{ padding: '12px 16px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-elevated)', color: 'var(--text-primary)', marginBottom: 15, width: '100%', fontSize: 16 }}
          />
          {unlockError && <p style={{ color: 'var(--error)', marginBottom: 15, fontSize: 13, fontWeight: 500 }}>Incorrect password</p>}
          <button type="submit" style={{ padding: '12px 20px', borderRadius: 6, background: 'var(--tuk-accent)', color: '#fff', border: 'none', cursor: 'pointer', width: '100%', fontWeight: 'bold', fontSize: 15 }}>
            Unlock Generator
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className={styles.adminPage}>
      {/* Hidden pristine card used exclusively for perfectly unscaled html2canvas captures */}
      <div style={{ position: 'absolute', top: 0, left: 0, zIndex: -100, pointerEvents: 'none', overflow: 'hidden', width: 1200, height: 675 }}>
        {renderCard(hiddenCardRef)}
      </div>
      <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap" rel="stylesheet" />
      
      <h1>Admin Dashboard</h1>

      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 30 }}>
        <button 
          onClick={() => setAdminTab('generator')} 
          style={{ padding: '8px 16px', borderRadius: 20, background: adminTab === 'generator' ? 'var(--tuk-accent)' : 'var(--bg-elevated)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
          Card Generator
        </button>
        <button 
          onClick={() => { setAdminTab('suggestions'); fetchSuggestions(adminPwd); }} 
          style={{ padding: '8px 16px', borderRadius: 20, background: adminTab === 'suggestions' ? 'var(--tuk-accent)' : 'var(--bg-elevated)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
          Suggestions Inbox
        </button>
      </div>
      
      {adminTab === 'generator' && (
        <>
          <div className={styles.modeToggle}>
        <button className={mode === 'batter' ? styles.active : ''} onClick={() => setMode('batter')}>TukTuk Mode</button>
        <button className={mode === 'bowler' ? styles.active : ''} onClick={() => setMode('bowler')}>Run Machine Mode</button>
      </div>

      <div className={styles.mainContainer}>
        <div className={styles.controls}>
          <div className={styles.inputGroup}>
            <label>Player Name</label>
            <input value={playerName} onChange={e => setPlayerName(e.target.value)} placeholder="Name" />
          </div>
          <div className={styles.inputGroup}>
            <label>Team</label>
            <select onChange={e => setTeam(TEAMS.find(t => t.name === e.target.value) || TEAMS[0])}>
              {TEAMS.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
            </select>
          </div>
          <div className={styles.inputGroup}>
            <label>Match Context</label>
            <input value={matchCtx} onChange={e => setMatchCtx(e.target.value)} placeholder="vs CSK" />
          </div>

          {mode === 'batter' ? (
            <div className={styles.flexRow}>
              <div className={styles.inputGroup}>
                <label>Runs</label>
                <input type="number" value={runs} onChange={e => setRuns(Number(e.target.value))} />
              </div>
              <div className={styles.inputGroup}>
                <label>Balls</label>
                <input type="number" value={balls} onChange={e => setBalls(Number(e.target.value))} />
              </div>
            </div>
          ) : (
            <>
              <div className={styles.flexRow}>
                <div className={styles.inputGroup}>
                  <label>Overs</label>
                  <input type="number" value={overs} onChange={e => setOvers(Number(e.target.value))} />
                </div>
                <div className={styles.inputGroup}>
                  <label>Maidens</label>
                  <input type="number" value={maidens} onChange={e => setMaidens(Number(e.target.value))} />
                </div>
              </div>
              <div className={styles.flexRow}>
                <div className={styles.inputGroup}>
                  <label>Runs Leaked</label>
                  <input type="number" value={runsLeaked} onChange={e => setRunsLeaked(Number(e.target.value))} />
                </div>
                <div className={styles.inputGroup}>
                  <label>Wickets</label>
                  <input type="number" value={wickets} onChange={e => setWickets(Number(e.target.value))} />
                </div>
              </div>
            </>
          )}

          <div className={styles.inputGroup}>
            <label>Custom Roast</label>
            <textarea value={customRoast} onChange={e => setCustomRoast(e.target.value)} />
          </div>

          <div className={styles.inputGroup}>
            <label>Player Photo</label>
            <input type="file" accept="image/*" onChange={handleFile} />
          </div>

          <div className={styles.inputGroup}>
            <label>Admin Password</label>
            <input type="password" value={adminPwd} onChange={e => setAdminPwd(e.target.value)} placeholder="Required to publish" />
          </div>

          <hr style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '20px 0' }} />

          <div className={styles.inputGroup}>
            <label style={{ color: '#00d4ff' }}>Manual Upload (Overrides Generator)</label>
            <span style={{ fontSize: '0.8rem', color: '#888', marginBottom: '8px', display: 'block' }}>If generator fails, upload your final image here directly.</span>
            <input type="file" accept="image/png, image/jpeg" onChange={e => setCustomCardFile(e.target.files?.[0] || null)} />
          </div>

          <div className={styles.actions}>
            <button className={styles.btnSecondary} onClick={() => handleExport(false)} disabled={loading}>
              {loading ? 'Wait...' : 'Download Card'}
            </button>
            <button onClick={() => handleExport(true)} disabled={loading} className={styles.btnPrimary}>
              PUBLISH DIRECTLY
            </button>
          </div>
          {statusMsg && <div className={styles.statusMsg}>{statusMsg}</div>}
        </div>

        <div className={styles.previewWrap}>
          <div className={styles.scaler}>
            {renderCard(cardRef)}
          </div>
        </div>
      </div>
      </>
      )}

      {adminTab === 'suggestions' && (
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'left' }}>
          {suggestions.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No suggestions yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {suggestions.map(s => (
                <div key={s.id} style={{ background: 'var(--bg-card)', padding: 20, borderRadius: 12, border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                    <strong style={{ color: 'var(--tuk-accent)' }}>{s.username}</strong>
                    <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{new Date(s.createdAt).toLocaleString()}</span>
                  </div>
                  <p style={{ color: 'var(--text-primary)', whiteSpace: 'pre-wrap', margin: 0, lineHeight: 1.5 }}>{s.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
