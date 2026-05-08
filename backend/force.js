require('ts-node').register({ compilerOptions: { lib: ['es2018', 'dom'], types: ['node'] } });
const { processLiveMatches } = require('./src/jobs/liveSync.ts');
processLiveMatches().then(() => console.log('Done')).catch(console.error);
