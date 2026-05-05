'use client';
import { useState, useEffect, useMemo } from 'react';
import styles from '../hall-of-fame/page.module.css';
import { formatPlayerName } from './LeaderboardTable';

function MiniTable({ title, data, type }: { title: string, data: any[], type: 'tuktuk' | 'run-machine' }) {
  if (!data || data.length === 0) return null;
  
  return (
    <div className="card" style={{ overflow: 'hidden', borderRadius: 'var(--radius-md)' }}>
      <h3 style={{ 
        padding: '16px 20px', 
        borderBottom: '1px solid var(--border)', 
        margin: 0, 
        fontFamily: 'var(--font-display)',
        letterSpacing: '0.05em',
        fontSize: '24px',
        color: type === 'tuktuk' ? 'var(--tuk-accent)' : 'var(--din-accent)' 
      }}>
        {title}
      </h3>
      <div className="table-wrapper">
        <table className={`lb-table ${type === 'run-machine' ? 'dinda-table' : ''}`} style={{ minWidth: '320px' }}>
          <thead>
            <tr>
              <th className="sticky-col rank-col">Rank</th>
              <th className="sticky-col player-col" style={{ minWidth: '120px' }}>Player</th>
              <th className="text-right">{type === 'tuktuk' ? 'Runs' : 'Overs'}</th>
              <th className="text-right">{type === 'tuktuk' ? 'Balls' : 'Runs Conceded'}</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row: any, i: number) => (
              <tr key={i} className={i === 0 ? 'rank-one' : ''}>
                <td className="sticky-col rank-col"><span style={{ fontFamily: 'var(--font-mono)', fontWeight: 'bold', color: 'var(--text-muted)' }}>#{row.rank || i + 1}</span></td>
                <td className="sticky-col player-col">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 600 }}>{formatPlayerName(row.name)}</span>
                    <span className="team-pill" style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}>{row.fixture || row.team}</span>
                    {row.season && <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{row.matchNumber ? `M${row.matchNumber}, ` : ''}{row.season}</span>}
                  </div>
                </td>
                <td className="stat text-right">{type === 'tuktuk' ? row.runs : row.overs}</td>
                <td className="score-col text-right">{type === 'tuktuk' ? row.balls : row.runs}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function HallOfFameSection() {
  // TukTuk State
  const [tuktukFullData, setTuktukFullData] = useState<Record<string, any[]>>({});
  const [displayedRunsCount, setDisplayedRunsCount] = useState(3);
  const [searchRuns, setSearchRuns] = useState('');
  const [searchPlayer, setSearchPlayer] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // Run Machine State
  const [runMachineHistory, setRunMachineHistory] = useState<any>(null);
  const [selectedSeason, setSelectedSeason] = useState<string>('2025');

  // Duck Masters State
  const [duckMasters, setDuckMasters] = useState<any[]>([]);
  const [expandedDuck, setExpandedDuck] = useState<string | null>(null);
  const [duckSearchPlayer, setDuckSearchPlayer] = useState('');
  const [showAllDucks, setShowAllDucks] = useState(false);

  // Fifty Plus Masters State
  const [fiftyPlusMasters, setFiftyPlusMasters] = useState<any[]>([]);
  const [expandedFiftyPlus, setExpandedFiftyPlus] = useState<string | null>(null);
  const [fiftyPlusSearchPlayer, setFiftyPlusSearchPlayer] = useState('');
  const [showAllFiftyPlus, setShowAllFiftyPlus] = useState(false);

  useEffect(() => {
    // Fetch all JSON files in parallel with cache-busting query parameter
    const cb = `?t=${new Date().getTime()}`;
    Promise.all([
      fetch(`/data/run_machine_spells.json${cb}`).then(r => r.json()),
      fetch(`/data/tuktuk_hall_of_fame.json${cb}`).then(r => r.json()),
      fetch(`/data/duck_masters.json${cb}`).then(r => r.json()),
      fetch(`/data/fifty_plus_masters.json${cb}`).then(r => r.json()).catch(() => []),
    ]).then(([runMachineData, tuktukData, duckData, fiftyPlusData]) => {
      setRunMachineHistory(runMachineData);
      const years = Object.keys(runMachineData).sort((a, b) => parseInt(b) - parseInt(a));
      if (years.length > 0) setSelectedSeason(years[0]);
      setTuktukFullData(tuktukData);
      setDuckMasters(duckData);
      setFiftyPlusMasters(fiftyPlusData);
    }).catch(console.error);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchRuns && !searchPlayer) {
      clearSearch();
      return;
    }
    
    setIsSearching(true);
    let results: any[] = [];
    
    if (searchRuns) {
      const dataForRuns = tuktukFullData[searchRuns] || [];
      results = dataForRuns.filter(r => !searchPlayer || r.name.toLowerCase().includes(searchPlayer.toLowerCase()));
    } else if (searchPlayer) {
      for (const [runAmt, records] of Object.entries(tuktukFullData)) {
        for (const record of records as any[]) {
          if (record.name.toLowerCase().includes(searchPlayer.toLowerCase())) {
            results.push(record);
          }
        }
      }
      results.sort((a, b) => b.balls - a.balls);
    }
    
    setSearchResults(results.slice(0, 20));
  };

  const clearSearch = () => {
    setSearchRuns('');
    setSearchPlayer('');
    setIsSearching(false);
    setSearchResults([]);
  };

  const runMachineYears = runMachineHistory ? Object.keys(runMachineHistory).sort((a, b) => parseInt(b) - parseInt(a)) : [];
  const currentRunMachineData = runMachineHistory?.[selectedSeason] || [];

  const runKeys = useMemo(
    () => Object.keys(tuktukFullData).map(Number).filter(n => !isNaN(n)).sort((a, b) => a - b),
    [tuktukFullData]
  );
  const displayedKeys = useMemo(
    () => runKeys.slice(0, displayedRunsCount),
    [runKeys, displayedRunsCount]
  );

  // Duck Masters Filtering
  const filteredDuckMasters = useMemo(() => {
    let filtered = duckMasters;
    if (duckSearchPlayer) {
      filtered = duckMasters.filter(d => d.name.toLowerCase().includes(duckSearchPlayer.toLowerCase()));
    }
    return showAllDucks || duckSearchPlayer ? filtered : filtered.slice(0, 10);
  }, [duckMasters, duckSearchPlayer, showAllDucks]);

  // Fifty Plus Filtering
  const filteredFiftyPlusMasters = useMemo(() => {
    let filtered = fiftyPlusMasters;
    if (fiftyPlusSearchPlayer) {
      filtered = fiftyPlusMasters.filter(f => f.name.toLowerCase().includes(fiftyPlusSearchPlayer.toLowerCase()));
    }
    return showAllFiftyPlus || fiftyPlusSearchPlayer ? filtered : filtered.slice(0, 10);
  }, [fiftyPlusMasters, fiftyPlusSearchPlayer, showAllFiftyPlus]);

  return (
    <>
      {/* TUKTUK HALL OF FAME */}
      <section className="section">
        <div className="section-label">TukTuk Academy</div>
        <h1 className="section-title tuktuk"><span>HALL OF</span> FAME</h1>
        <p className="section-subtitle">The absolute slowest innings in modern cricket history.</p>

        <form className={styles.searchContainer} onSubmit={handleSearch}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Runs Scored</label>
            <input 
              type="number" 
              className={styles.input} 
              placeholder="e.g. 1" 
              value={searchRuns}
              onChange={e => setSearchRuns(e.target.value)}
            />
          </div>
          <span className={styles.orDivider}>or</span>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Player Name</label>
            <input 
              type="text" 
              className={styles.input} 
              placeholder="e.g. Parag" 
              value={searchPlayer}
              onChange={e => setSearchPlayer(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className={styles.searchBtn}
            disabled={!searchRuns && !searchPlayer}
          >
            Search Records
          </button>
          {isSearching && (
            <button type="button" onClick={clearSearch} className={styles.clearBtn}>Clear</button>
          )}
        </form>

        <div className={styles.grid} style={isSearching ? { gridTemplateColumns: '1fr', maxWidth: '800px', margin: '0 auto 60px' } : {}}>
          {isSearching ? (
            <MiniTable
              title={searchRuns ? `${searchRuns}-Run Legends` : 'Search Results'}
              data={searchResults}
              type="tuktuk"
            />
          ) : (
            <>
              {displayedKeys.map(runs => (
                <MiniTable key={runs} title={`${runs}-Run Legends`} data={tuktukFullData[runs]} type="tuktuk" />
              ))}
            </>
          )}
        </div>

        {!isSearching && displayedRunsCount < runKeys.length && (
          <div style={{ textAlign: 'center', marginTop: '-20px', marginBottom: '24px' }}>
            <button 
              className="btn btn-ghost" 
              onClick={() => setDisplayedRunsCount(prev => Math.min(prev + 3, runKeys.length))}
            >
              Load More Legends
            </button>
          </div>
        )}
      </section>

      <div className="section-divider" style={{ margin: '24px 0' }} />

      {/* RUN MACHINE HALL OF FAME */}
      <section className="section">
        <div className="section-label dinda">Run Machine Academy</div>
        <div className={styles.headerRow}>
          <h1 className="section-title dinda" style={{ marginBottom: 0 }}><span>RUN MACHINE</span> HALL OF FAME</h1>
          <select 
            className={styles.seasonSelect}
            value={selectedSeason}
            onChange={e => setSelectedSeason(e.target.value)}
          >
            {runMachineYears.map(y => (
              <option key={y} value={y}>IPL {y}</option>
            ))}
          </select>
        </div>
        <p className="section-subtitle">The most outrageously expensive bowling spells of each season.</p>

        <div style={{ maxWidth: '800px' }}>
          <MiniTable 
            title={`Top 3 Most Expensive Spells - IPL ${selectedSeason}`} 
            data={currentRunMachineData} 
            type="run-machine" 
          />
        </div>
      </section>

      <div className="section-divider" style={{ margin: '40px 0' }} />

      {/* DUCK MASTERS */}
      <section className="section">
        <div className="section-label tuktuk">TukTuk Academy</div>
        <h1 className="section-title tuktuk"><span>DUCK</span> MASTERS</h1>
        <p className="section-subtitle">IPL's most prolific golden goose merchants — dismissed for zero, again and again.</p>

        <div style={{ maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
          
          <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
            <input 
              type="text" 
              className={styles.input} 
              style={{ flex: 1, maxWidth: '300px' }}
              placeholder="Search duck master..." 
              value={duckSearchPlayer}
              onChange={e => setDuckSearchPlayer(e.target.value)}
            />
          </div>

          {filteredDuckMasters.map((player) => (
            <div key={player.name} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
              <button
                onClick={() => setExpandedDuck(expandedDuck === player.name ? null : player.name)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
              >
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 'bold', color: 'var(--text-muted)', minWidth: '32px' }}>#{player.rank}</span>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)', flex: 1, fontSize: '15px' }}>{formatPlayerName(player.name)}</span>
                <span style={{ background: '#ff4757', color: '#fff', borderRadius: '20px', padding: '4px 14px', fontWeight: 700, fontSize: '14px', fontFamily: 'var(--font-mono)' }}>{player.totalDucks} ducks</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '18px', transition: 'transform 0.2s', transform: expandedDuck === player.name ? 'rotate(180deg)' : 'rotate(0deg)' }}>▾</span>
              </button>

              {expandedDuck === player.name && (
                <div style={{ borderTop: '1px solid var(--border)', padding: '0 20px 16px' }}>
                  <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', marginTop: '12px', minWidth: '360px' }}>
                    <thead>
                      <tr style={{ color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.08em' }}>
                        <th style={{ textAlign: 'left', padding: '6px 0', fontWeight: 600 }}>Match</th>
                        <th style={{ textAlign: 'left', padding: '6px 0', fontWeight: 600 }}>Season</th>
                        <th style={{ textAlign: 'right', padding: '6px 0', fontWeight: 600 }}>Balls Faced</th>
                      </tr>
                    </thead>
                    <tbody>
                      {player.innings.map((inn: any, i: number) => (
                        <tr key={i} style={{ borderTop: '1px solid var(--border)' }}>
                          <td style={{ padding: '8px 0', color: 'var(--text-secondary)' }}>
                            <span style={{ background: 'var(--bg-elevated)', padding: '2px 8px', borderRadius: '4px', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>{inn.fixture}</span>
                            {inn.matchNumber && <span style={{ marginLeft: '8px', color: 'var(--text-muted)', fontSize: '12px' }}>M{inn.matchNumber}</span>}
                          </td>
                          <td style={{ padding: '8px 0', color: 'var(--text-muted)' }}>{inn.season}</td>
                          <td style={{ padding: '8px 0', textAlign: 'right', fontFamily: 'var(--font-mono)', color: inn.balls === 1 ? '#ff4757' : 'var(--text-primary)', fontWeight: 600 }}>
                            {inn.balls === 1 ? 'Golden Duck' : inn.balls}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  </div>
                </div>
              )}
            </div>
          ))}

          {!duckSearchPlayer && duckMasters.length > 10 && (
            <div style={{ textAlign: 'center', marginTop: '12px' }}>
              <button 
                className="btn btn-ghost" 
                onClick={() => setShowAllDucks(!showAllDucks)}
              >
                {showAllDucks ? 'Show Top 10' : `Show All ${duckMasters.length} Masters`}
              </button>
            </div>
          )}
        </div>
      </section>

      <div className="section-divider" style={{ margin: '40px 0' }} />

      {/* FIFTY PLUS MASTERS */}
      <section className="section">
        <div className="section-label dinda">Run Machine Academy</div>
        <h1 className="section-title dinda"><span>FIFTY PLUS</span> MASTERS</h1>
        <p className="section-subtitle">Bowlers who consistently gave away 50+ runs in a single spell.</p>

        <div style={{ maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '60px' }}>
          
          <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
            <input 
              type="text" 
              className={styles.input} 
              style={{ flex: 1, maxWidth: '300px' }}
              placeholder="Search run machine..." 
              value={fiftyPlusSearchPlayer}
              onChange={e => setFiftyPlusSearchPlayer(e.target.value)}
            />
          </div>

          {filteredFiftyPlusMasters.map((player) => (
            <div key={player.name} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
              <button
                onClick={() => setExpandedFiftyPlus(expandedFiftyPlus === player.name ? null : player.name)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
              >
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 'bold', color: 'var(--text-muted)', minWidth: '32px' }}>#{player.rank}</span>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)', flex: 1, fontSize: '15px' }}>{formatPlayerName(player.name)}</span>
                <span style={{ background: 'var(--din-accent)', color: '#000', borderRadius: '20px', padding: '4px 14px', fontWeight: 700, fontSize: '14px', fontFamily: 'var(--font-mono)' }}>{player.totalSpells} spells</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '18px', transition: 'transform 0.2s', transform: expandedFiftyPlus === player.name ? 'rotate(180deg)' : 'rotate(0deg)' }}>▾</span>
              </button>

              {expandedFiftyPlus === player.name && (
                <div style={{ borderTop: '1px solid var(--border)', padding: '0 20px 16px' }}>
                  <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', marginTop: '12px', minWidth: '360px' }}>
                    <thead>
                      <tr style={{ color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.08em' }}>
                        <th style={{ textAlign: 'left', padding: '6px 0', fontWeight: 600 }}>Match</th>
                        <th style={{ textAlign: 'left', padding: '6px 0', fontWeight: 600 }}>Season</th>
                        <th style={{ textAlign: 'right', padding: '6px 0', fontWeight: 600 }}>Overs</th>
                        <th style={{ textAlign: 'right', padding: '6px 0', fontWeight: 600 }}>Runs Given</th>
                      </tr>
                    </thead>
                    <tbody>
                      {player.innings.map((inn: any, i: number) => (
                        <tr key={i} style={{ borderTop: '1px solid var(--border)' }}>
                          <td style={{ padding: '8px 0', color: 'var(--text-secondary)' }}>
                            <span style={{ background: 'var(--bg-elevated)', padding: '2px 8px', borderRadius: '4px', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>{inn.fixture}</span>
                          </td>
                          <td style={{ padding: '8px 0', color: 'var(--text-muted)' }}>{inn.season}</td>
                          <td style={{ padding: '8px 0', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{inn.overs}</td>
                          <td style={{ padding: '8px 0', textAlign: 'right', fontFamily: 'var(--font-mono)', color: inn.runs >= 60 ? '#ff4757' : 'var(--din-accent)', fontWeight: 600 }}>
                            {inn.runs}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  </div>
                </div>
              )}
            </div>
          ))}

          {!fiftyPlusSearchPlayer && fiftyPlusMasters.length > 10 && (
            <div style={{ textAlign: 'center', marginTop: '12px' }}>
              <button 
                className="btn btn-ghost" 
                onClick={() => setShowAllFiftyPlus(!showAllFiftyPlus)}
              >
                {showAllFiftyPlus ? 'Show Top 10' : `Show All ${fiftyPlusMasters.length} Masters`}
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
