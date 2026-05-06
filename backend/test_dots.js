const AdmZip = require('adm-zip');
const axios = require('axios');

async function test() {
  console.log('Downloading zip...');
  const res = await axios.get('https://cricsheet.org/downloads/ipl_json.zip', { responseType: 'arraybuffer' });
  const zip = new AdmZip(res.data);
  const entries = zip.getEntries().filter(e => e.name.endsWith('.json'));
  
  let matchCount = 0;
  let dotCount = 0;
  
  for (const entry of entries) {
    const matchData = JSON.parse(entry.getData().toString('utf8'));
    if (matchData?.info?.season === 2024 || matchData?.info?.season === '2024') {
      matchCount++;
      let matchDots = 0;
      const innings = matchData.innings || [];
      for (const inning of innings) {
        const overs = inning.overs || [];
        for (const over of overs) {
          const deliveries = over.deliveries || [];
          for (const delivery of deliveries) {
            if (delivery.runs && delivery.runs.total === 0) {
              matchDots++;
            }
          }
        }
      }
      dotCount += matchDots;
    }
  }
  
  console.log('Total 2024 Matches:', matchCount);
  console.log('Total 2024 Dots:', dotCount);
  console.log('Avg Dots/Match:', dotCount / matchCount);
}

test().catch(console.error);
