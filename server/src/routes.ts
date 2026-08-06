import { Router, type Request, type Response } from 'express';
import { Dictionary } from './dictionary.js';
import {
  GameManager,
  GameNotFoundError,
  type CreateGameOptions,
  type Difficulty,
} from './game.js';

const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard'];

export function createApiRouter(dict: Dictionary): Router {
  const router = Router();
  const manager = new GameManager(dict);

  router.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', dictionarySize: dict.size });
  });

  router.post('/games', (req: Request, res: Response) => {
    const body = (req.body ?? {}) as Record<string, unknown>;
    const options: CreateGameOptions = {};
    if (typeof body.rounds === 'number') options.rounds = body.rounds;
    if (typeof body.rackSize === 'number') options.rackSize = body.rackSize;
    if (typeof body.seed === 'number') options.seed = body.seed;
    if (typeof body.difficulty === 'string' && DIFFICULTIES.includes(body.difficulty as Difficulty)) {
      options.difficulty = body.difficulty as Difficulty;
    }
    const state = manager.createGame(options);
    res.status(201).json(state);
  });

  router.get('/games/:id', (req: Request, res: Response) => {
    const state = manager.getGame(req.params.id);
    if (!state) return res.status(404).json({ error: 'Spelet hittades inte.' });
    return res.json(state);
  });

  router.get('/games/:id/hint', (req: Request, res: Response) => {
    const state = manager.getGame(req.params.id);
    if (!state) return res.status(404).json({ error: 'Spelet hittades inte.' });
    const hint = manager.getHint(req.params.id);
    return res.json({ hint });
  });

  router.post('/games/:id/moves', (req: Request, res: Response) => {
    const body = (req.body ?? {}) as Record<string, unknown>;
    const word = typeof body.word === 'string' ? body.word : '';
    try {
      const result = manager.submitWord(req.params.id, word);
      if (!result.ok) {
        return res.status(400).json({ error: result.error, state: result.state });
      }
      return res.json({ round: result.round, state: result.state });
    } catch (err) {
      if (err instanceof GameNotFoundError) {
        return res.status(404).json({ error: 'Spelet hittades inte.' });
      }
      throw err;
    }
  });

  router.post('/games/:id/pass', (req: Request, res: Response) => {
    try {
      const result = manager.submitWord(req.params.id, '');
      return res.json({ round: result.round, state: result.state });
    } catch (err) {
      if (err instanceof GameNotFoundError) {
        return res.status(404).json({ error: 'Spelet hittades inte.' });
      }
      throw err;
    }
  });

  return router;
}
