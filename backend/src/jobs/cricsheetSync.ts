import cron from 'node-cron';
import axios from 'axios';
import AdmZip from 'adm-zip';
import { prisma } from '../lib/prisma';

export async function syncCricsheetDotBalls(): Promise<void> {
  console.log('🌳 [Cricsheet Sync] Starting dot ball sync...');

  try {
    // 1. Download the IPL JSON zip
    console.log('   Downloading ipl_json.zip from Cricsheet...');
    const response = await axios.get('https://cricsheet.org/downloads/ipl_json.zip', {
      responseType: 'arraybuffer'
    });

    const zip = new AdmZip(response.data);
    const zipEntries = zip.getEntries().filter((e: any) => e.name.endsWith('.json'));
    
    let totalIPL2026DotBalls = 0;
    let matchesProcessed = 0;

    // 2. Iterate through all JSON files
    for (const entry of zipEntries) {
      const matchData = JSON.parse(entry.getData().toString('utf8'));
      
      // Filter for IPL 2026 season
      if (matchData?.info?.season === 2026 || matchData?.info?.season === '2026') {
        matchesProcessed++;
        let matchDotBalls = 0;

        // 3. Parse ball-by-ball data
        const innings = matchData.innings || [];
        for (const inning of innings) {
          const overs = inning.overs || [];
          for (const over of overs) {
            const deliveries = over.deliveries || [];
            for (const delivery of deliveries) {
              // A dot ball is any delivery where total runs scored is 0
              if (delivery.runs && delivery.runs.total === 0) {
                matchDotBalls++;
              }
            }
          }
        }
        
        totalIPL2026DotBalls += matchDotBalls;
      }
    }

    // 4. Update the database
    if (matchesProcessed > 0) {
      await prisma.treeTracker.upsert({
        where: { id: 1 },
        create: { id: 1, totalDotBalls: totalIPL2026DotBalls, matchesProcessed },
        update: { totalDotBalls: totalIPL2026DotBalls, matchesProcessed }
      });
      console.log(`✅ [Cricsheet Sync] Complete! Processed ${matchesProcessed} IPL 2026 matches. Total Dot Balls: ${totalIPL2026DotBalls}`);
    } else {
      console.log('⚠️ [Cricsheet Sync] No IPL 2026 matches found in the Cricsheet dump yet.');
    }

  } catch (error: any) {
    console.error('❌ [Cricsheet Sync] Failed to sync dot balls:', error.message);
  }
}

export function startCricsheetSyncJob(): void {
  // Run every 12 hours (e.g. 04:00 and 16:00)
  cron.schedule('0 4,16 * * *', () => {
    syncCricsheetDotBalls();
  });

  // Also run immediately on startup
  syncCricsheetDotBalls();
  console.log('⏱  Cricsheet sync cron started (every 12 hours)');
}
