require('ts-node').register({ compilerOptions: { lib: ['es2018', 'dom'], types: ['node'] } });
const { startMatchSyncJob } = require('./src/jobs/matchSync.ts');
startMatchSyncJob();
