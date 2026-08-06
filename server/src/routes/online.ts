import { Router } from 'express';
import { Store } from '../store.js';

export function createOnlineRouter(store: Store): Router {
  const router = Router();

  // Create a guest account (returns an id the client stores locally).
  router.post('/guest', (req, res) => {
    const body = (req.body ?? {}) as Record<string, unknown>;
    const name = typeof body.name === 'string' ? body.name : 'Spelare';
    const player = store.getOrCreateGuest(name);
    res.status(201).json({ player });
  });

  router.get('/player/:id', (req, res) => {
    const player = store.getPlayer(req.params.id);
    if (!player) return res.status(404).json({ error: 'Spelaren hittades inte.' });
    return res.json({ player, rank: store.rankOf(player.id), recent: store.recentMatches(player.id, 10) });
  });

  router.put('/player/:id/name', (req, res) => {
    const body = (req.body ?? {}) as Record<string, unknown>;
    const name = typeof body.name === 'string' ? body.name : '';
    const player = store.setName(req.params.id, name);
    if (!player) return res.status(404).json({ error: 'Spelaren hittades inte.' });
    return res.json({ player });
  });

  // Server-computed, paginated leaderboard (optionally with the caller's rank).
  router.get('/leaderboard', (req, res) => {
    const limit = req.query.limit ? Math.min(100, Number(req.query.limit)) : 50;
    const offset = req.query.offset ? Number(req.query.offset) : 0;
    const board = store.leaderboard(limit, offset);
    const meId = typeof req.query.me === 'string' ? req.query.me : undefined;
    const me = meId
      ? (() => {
          const p = store.getPlayer(meId);
          return p ? { ...p, rank: store.rankOf(p.id) } : null;
        })()
      : null;
    res.json({ ...board, me });
  });

  return router;
}
