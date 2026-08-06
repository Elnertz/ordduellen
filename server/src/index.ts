import express from 'express';
import cors from 'cors';
import { loadDictionary } from './dictionary.js';
import { createApiRouter } from './routes.js';

const PORT = Number(process.env.PORT ?? 4000);
const HOST = process.env.HOST ?? '0.0.0.0';

function main(): void {
  const dict = loadDictionary();
  // eslint-disable-next-line no-console
  console.log(`[ordduellen] Loaded dictionary with ${dict.size} Swedish words`);

  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use('/api', createApiRouter(dict));

  app.get('/', (_req, res) => {
    res.json({ name: 'Ordduellen API', endpoints: ['/api/health', '/api/games'] });
  });

  app.listen(PORT, HOST, () => {
    // eslint-disable-next-line no-console
    console.log(`[ordduellen] API listening on http://${HOST}:${PORT}`);
  });
}

main();
