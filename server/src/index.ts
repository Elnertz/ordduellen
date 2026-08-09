import { createServer } from 'node:http';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import express from 'express';
import cors from 'cors';
import { getDatabase } from './database.js';
import { GameManager } from './game.js';
import { getStore } from './store.js';
import { createGameRouter } from './routes/game.js';
import { createAdminRouter } from './routes/admin.js';
import { createOnlineRouter } from './routes/online.js';
import { createDailyRouter } from './routes/daily.js';
import { attachRealtime } from './realtime.js';

const PORT = Number(process.env.PORT ?? 4000);
const HOST = process.env.HOST ?? '0.0.0.0';
const __dirname = dirname(fileURLToPath(import.meta.url));

// Locate the built web client so a single service can serve UI + API + WS.
function findClientDist(): string | null {
  const candidates = [
    resolve(__dirname, '../../client/dist'),
    resolve(__dirname, '../client/dist'),
    resolve(process.cwd(), 'client/dist'),
  ];
  return candidates.find((p) => existsSync(resolve(p, 'index.html'))) ?? null;
}

function main(): void {
  const db = getDatabase();
  // eslint-disable-next-line no-console
  console.log(`[ordduellen] Databas genererad: ${db.size} poster (${db.curatedCount} kurerade)`);

  const manager = new GameManager(db);
  const store = getStore();
  const app = express();
  app.use(cors());
  app.use(express.json({ limit: '25mb' }));

  app.get('/api', (_req, res) => {
    res.json({
      name: 'Ordduellen API',
      databaseSize: db.size,
      endpoints: ['/api/health', '/api/games', '/api/judge', '/api/admin/stats', '/api/online/leaderboard', '/ws'],
    });
  });

  app.use('/api', createGameRouter(db, manager));
  app.use('/api/admin', createAdminRouter(db));
  app.use('/api/online', createOnlineRouter(store));
  app.use('/api', createDailyRouter(store));

  // Production / single-origin: serve the built web client and let client-side
  // routing fall back to index.html (API and WS paths are excluded).
  const serveClient = process.env.NODE_ENV === 'production' || process.env.SERVE_CLIENT === 'true';
  const clientDist = serveClient ? findClientDist() : null;
  if (clientDist) {
    app.use(express.static(clientDist));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api') || req.path.startsWith('/ws')) return next();
      return res.sendFile(resolve(clientDist, 'index.html'));
    });
    // eslint-disable-next-line no-console
    console.log(`[ordduellen] Serverar webbklienten från ${clientDist}`);
  } else if (!serveClient) {
    app.get('/', (_req, res) => res.redirect('/api'));
  }

  const server = createServer(app);
  attachRealtime(server, db, store);

  server.listen(PORT, HOST, () => {
    // eslint-disable-next-line no-console
    console.log(`[ordduellen] API lyssnar på http://${HOST}:${PORT}`);
  });
}

main();
