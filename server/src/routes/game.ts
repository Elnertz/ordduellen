import { Router, type Request, type Response } from 'express';
import { Database } from '../database.js';
import {
  GameManager,
  GameNotFoundError,
  type CreateGameOptions,
  type Difficulty,
  type GameMode,
  type WinCondition,
} from '../game.js';
import { judge } from '../judge.js';

const MODES: GameMode[] = ['twoPlayer', 'vsComputer'];
const WIN: WinCondition[] = ['points', 'endless'];
const DIFF: Difficulty[] = ['easy', 'medium', 'hard'];

export function createGameRouter(db: Database, manager: GameManager): Router {
  const router = Router();

  router.get('/health', (_req, res) => {
    res.json({ status: 'ok', databaseSize: db.size, curated: db.curatedCount });
  });

  router.get('/random-word', (_req, res) => {
    const e = db.randomEntry((x) => x.curated === true && x.scale >= 20 && x.scale <= 70);
    res.json({ word: e.name, description: e.description, categories: e.categories });
  });

  router.post('/games', (req: Request, res: Response) => {
    const body = (req.body ?? {}) as Record<string, unknown>;
    const options: CreateGameOptions = {};
    if (typeof body.mode === 'string' && MODES.includes(body.mode as GameMode)) options.mode = body.mode as GameMode;
    if (typeof body.winCondition === 'string' && WIN.includes(body.winCondition as WinCondition)) {
      options.winCondition = body.winCondition as WinCondition;
    }
    if (typeof body.difficulty === 'string' && DIFF.includes(body.difficulty as Difficulty)) {
      options.difficulty = body.difficulty as Difficulty;
    }
    if (typeof body.targetScore === 'number') options.targetScore = body.targetScore;
    if (typeof body.startWord === 'string') options.startWord = body.startWord;
    if (Array.isArray(body.playerNames)) {
      options.playerNames = body.playerNames.filter((n): n is string => typeof n === 'string');
    }
    res.status(201).json(manager.createGame(options));
  });

  router.get('/games/:id', (req, res) => {
    const state = manager.getGame(req.params.id);
    if (!state) return res.status(404).json({ error: 'Spelet hittades inte.' });
    return res.json(state);
  });

  router.post('/games/:id/turns', (req, res) => {
    const body = (req.body ?? {}) as Record<string, unknown>;
    const word = typeof body.word === 'string' ? body.word : '';
    try {
      const result = manager.playTurn(req.params.id, word);
      if (!result.ok) {
        return res.status(400).json({ error: result.error, state: result.state });
      }
      return res.json({ judgements: result.judgements, state: result.state });
    } catch (err) {
      if (err instanceof GameNotFoundError) return res.status(404).json({ error: 'Spelet hittades inte.' });
      throw err;
    }
  });

  // Standalone judge (useful for previews and testing).
  router.post('/judge', (req, res) => {
    const body = (req.body ?? {}) as Record<string, unknown>;
    const targetWord = typeof body.target === 'string' ? body.target : '';
    const answerWord = typeof body.answer === 'string' ? body.answer : '';
    if (!targetWord || !answerWord) {
      return res.status(400).json({ error: 'Ange både "target" och "answer".' });
    }
    const target = db.resolve(targetWord);
    const answer = db.resolve(answerWord);
    const result = judge(target.entry, answer.entry, answer.ref.matchType, answer.ref.resolved);
    return res.json(result);
  });

  return router;
}
