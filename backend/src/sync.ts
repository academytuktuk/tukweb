import 'dotenv/config';
import { startMatchSyncJob } from './jobs/matchSync';

console.log('Starting manual match sync...');
startMatchSyncJob();
