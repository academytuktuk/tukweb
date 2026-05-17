import cron from 'node-cron';
import axios from 'axios';
import AdmZip from 'adm-zip';
import { prisma } from '../lib/prisma';

// ─────────────────────────────────────────────────────────────────────────────
// DOT BALL DEFINITION (matches ESPNcricinfo / official T20 stats)
//
// A delivery is a dot ball if ALL of the following are true:
//   1. The batter scores 0 runs off the bat  (runs.batter === 0)
//   2. It is NOT a wide                       (!extras.wides)
//   3. It is NOT a no-ball                    (!extras.noballs)
//
// Leg-byes and byes DO count as dot balls from the batter's perspective
// because the batter scored 0 — this matches Cricinfo's dot-ball figures.
//
// Wides and no-balls are NEVER dot balls:
//   - They add runs to the team total and to the bowler's economy
//   - They don't count as a legal ball in the over for the batter
// ─────────────────────────────────────────────────────────────────────────────
function isDotBall(delivery: any): boolean {
  const extras = delivery.extras ?? {};

  // Skip wides — they're not faced by the batter and always add at least 1 run
  if (extras.wides) return false;

  // Skip no-balls — they're free hits and always add at least 1 penalty run
  if (extras.noballs) return false;

  // Dot if the batter scored 0 (leg-byes/byes are fine — batter still scored 0)
  const batterRuns = delivery.runs?.batter ?? 0;
  return batterRuns === 0;
}

export async function syncCricsheetDotBalls(): Promise<void> {
  console.log('🌳 [Cricsheet Sync] Starting dot ball sync...');

  try {
    console.log('   Downloading ipl_json.zip from Cricsheet...');
    const response = await axios.get('https://cricsheet.org/downloads/ipl_json.zip', {
      responseType: 'arraybuffer',
      timeout: 60000,
    });

    const zip = new AdmZip(response.data);
    const zipEntries = zip.getEntries().filter((e: any) => e.name.endsWith('.json'));

    let totalIPL2026DotBalls = 0;
    let matchesProcessed = 0;

    for (const entry of zipEntries) {
      let matchData: any;
      try {
        matchData = JSON.parse(entry.getData().toString('utf8'));
      } catch {
        continue; // skip malformed JSON
      }

      // Cricsheet stores IPL season as "2026" (string). Be robust to both.
      const season = String(matchData?.info?.season ?? '');

      // Accept "2026" or "2025/26" (T20I convention — IPL uses plain year)
      const isIPL2026 = season === '2026' || season === '2025/26';
      if (!isIPL2026) continue;

      matchesProcessed++;
      let matchDotBalls = 0;

      const innings: any[] = matchData.innings ?? [];
      for (const inning of innings) {
        const overs: any[] = inning.overs ?? [];
        for (const over of overs) {
          const deliveries: any[] = over.deliveries ?? [];
          for (const delivery of deliveries) {
            if (isDotBall(delivery)) {
              matchDotBalls++;
            }
          }
        }
      }

      totalIPL2026DotBalls += matchDotBalls;
      console.log(`   ✔ ${entry.name}: ${matchDotBalls} dot balls`);
    }

    // Write the absolute total — always SET (not increment) to avoid double-counting
    if (matchesProcessed > 0) {
      await prisma.treeTracker.upsert({
        where: { id: 1 },
        create: { id: 1, totalDotBalls: totalIPL2026DotBalls, matchesProcessed },
        update: { totalDotBalls: totalIPL2026DotBalls, matchesProcessed },
      });
      console.log(
        `✅ [Cricsheet Sync] ${matchesProcessed} IPL 2026 matches · ` +
        `${totalIPL2026DotBalls.toLocaleString()} dot balls (correct definition)`
      );
    } else {
      console.log('⚠️ [Cricsheet Sync] No IPL 2026 matches found in dump yet.');
    }

  } catch (error: any) {
    console.error('❌ [Cricsheet Sync] Failed:', error.message);
  }
}

export function startCricsheetSyncJob(): void {
  // Run every 6 hours so today's completed matches are picked up quickly
  cron.schedule('0 */6 * * *', () => {
    syncCricsheetDotBalls();
  });

  // Run immediately on startup
  syncCricsheetDotBalls();
  console.log('⏱  Cricsheet sync cron started (every 6 hours)');
}
