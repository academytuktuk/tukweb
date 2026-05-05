'use client';
import { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import styles from './page.module.css';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://tukweb-production.up.railway.app';

export default function SuggestPage() {
  const [form, setForm] = useState({ username: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.username.trim() || !form.message.trim()) return;
    setStatus('loading');
    try {
      const res = await fetch(`${API_BASE}/api/suggest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) { setStatus('success'); setForm({ username: '', message: '' }); }
      else setStatus('error');
    } catch { setStatus('error'); }
  };

  return (
    <>
      <Header />
      <div className="page-wrapper">
        <main className="main-content">

          <div className={styles.pageHeader}>
            <div className={styles.headerAccent} />
            <div className={styles.headerContent}>
              <p className="section-label">Community</p>
              <h1 className={styles.pageTitle}>SUGGESTIONS</h1>
              <p className={styles.pageSubtitle}>
                Got a roast idea? A feature request? A player we missed?
                Drop it here we read everything.
              </p>
            </div>
          </div>

          <div className="section-divider" />

          <section className={`section ${styles.formSection}`}>
            <div className={styles.formCard}>
              {status === 'success' ? (
                <div className={styles.success}>
                  <div className={styles.successIcon}>âœ“</div>
                  <h3 className={styles.successTitle}>Suggestion Received!</h3>
                  <p className={styles.successSub}>Thanks. We'll review it.</p>
                  <button className="btn btn-tuktuk" onClick={() => setStatus('idle')}>Submit Another</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate>
                  <div className="form-group">
                    <label className="form-label" htmlFor="username">Username to give credit for good suggestions</label>
                    <input id="username" type="text" className="form-input"
                      placeholder="@your_handle" value={form.username}
                      onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                      maxLength={64} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="message">Your Suggestion</label>
                    <textarea id="message" className="form-textarea"
                      placeholder="Idea, roast, feature request, player nomination..."
                      value={form.message}
                      onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                      maxLength={1000} required rows={6} />
                    <div className={styles.charCount}>{form.message.length}/1000</div>
                  </div>
                  {status === 'error' && <p className={styles.errorMsg}>Something went wrong. Try again.</p>}
                  <button type="submit" className="btn btn-tuktuk"
                    disabled={status === 'loading' || !form.username.trim() || !form.message.trim()}
                    style={{ width: '100%', justifyContent: 'center' }}>
                    {status === 'loading' ? 'Submitting...' : 'Submit Suggestion'}
                  </button>
                </form>
              )}
            </div>

            <div className={styles.infoBox}>
              <h3 className={styles.infoTitle}>What we're looking for</h3>
              <ul className={styles.infoList}>
                <li>Player nominations for TukTuk / Run Machine of the day</li>
                <li>Feature requests for new stats or filters</li>
                <li>Bug reports or data discrepancies</li>
                <li>Roast suggestions for the feed</li>
                <li>General ideas to improve the Academy</li>
              </ul>
              <p className={styles.infoNote}>
                All submissions are read. Not all will be actioned but the best ones will.
              </p>
            </div>
          </section>

          <Footer />
        </main>
      </div>
    </>
  );
}
