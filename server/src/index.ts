import { createServer } from 'node:http';
import express from 'express';
import cors from 'cors';
import { getDatabase } from './database.js';
import { GameManager } from './game.js';
import { getStore } from './store.js';
import { createGameRouter } from './routes/game.js';
import { createAdminRouter } from './routes/admin.js';
import { createOnlineRouter } from './routes/online.js';
import { attachRealtime } from './realtime.js';

const PORT = Number(process.env.PORT ?? 4000);
const HOST = process.env.HOST ?? '0.0.0.0';

function main(): void {
  const db = getDatabase();
  // eslint-disable-next-line no-console
  console.log(`[ordduellen] Databas genererad: ${db.size} poster (${db.curatedCount} kurerade)`);

  const manager = new GameManager(db);
  const store = getStore();
  const app = express();
  app.use(cors());
  app.use(express.json({ limit: '25mb' }));

  app.use('/api', createGameRouter(db, manager));
  app.use('/api/admin', createAdminRouter(db));
  app.use('/api/online', createOnlineRouter(store));

  app.get('/', (_req, res) => {
    res.json({
      name: 'Ordduellen API',
      databaseSize: db.size,
      endpoints: ['/api/health', '/api/games', '/api/judge', '/api/admin/stats', '/api/online/leaderboard', '/ws'],
    });
  });

  const server = createServer(app);
  attachRealtime(server, db, store);

  server.listen(PORT, HOST, () => {
    // eslint-disable-next-line no-console
    console.log(`[ordduellen] API lyssnar på http://${HOST}:${PORT}`);
  });
}

main();
