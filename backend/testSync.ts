require('dotenv').config();
import { syncMatches } from './src/jobs/matchSync';

syncMatches()
  .then(() => console.log('Done'))
  .catch(console.error);
