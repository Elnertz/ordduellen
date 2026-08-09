import { Router } from 'express';
import { Store } from '../store.js';
import { dateKey, previousDateKey, levelProgress } from '../progression.js';
import { getDaily, getArchive, verifyChain, evaluateChallenge } from '../daily.js';
import { getReplayStore, type ReplayMove, type Visibility } from '../replays.js';

const XP_DAILY_WORD = 25;
const XP_CHALLENGE = 50;
const XP_MATCH = 15;

export function createDailyRouter(store: Store): Router {
  const router = Router();

  router.get('/daily', (req, res) => {
    const today = dateKey();
    const daily = getDaily(today);
    const playerId = typeof req.query.playerId === 'string' ? req.query.playerId : undefined;
    const player = playerId ? store.getPlayer(playerId) : undefined;
    const dailyDone = playerId ? Boolean(store.getDailyResult(today, playerId)) : false;
    res.json({
      ...daily,
      completed: { dagensOrd: dailyDone },
      streak: player
        ? { current: player.streakCurrent, longest: player.streakLongest, lastDate: player.streakLastDate }
        : null,
    });
  });

  router.get('/daily/archive', (req, res) => {
    const days = Math.min(30, Math.max(1, Number(req.query.days) || 7));
    const dates: string[] = [];
    let d = dateKey();
    for (let i = 0; i < days; i += 1) {
      dates.push(d);
      d = previousDateKey(d);
    }
    res.json({ archive: getArchive(dates) });
  });

  router.get('/daily/leaderboard', (req, res) => {
    const today = dateKey();
    const board = store.dailyLeaderboard(today, 50);
    const meId = typeof req.query.me === 'string' ? req.query.me : undefined;
    const me = meId ? store.getDailyResult(today, meId) ?? null : null;
    res.json({ date: today, ...board, me });
  });

  // Submit a "Dagens ord" attempt. One ranked attempt/day; practice is unlimited.
  router.post('/daily/attempt', (req, res) => {
    const body = (req.body ?? {}) as Record<string, unknown>;
    const playerId = typeof body.playerId === 'string' ? body.playerId : '';
    const answers = Array.isArray(body.answers) ? (body.answers as string[]).filter((w) => typeof w === 'string') : [];
    const practice = body.practice === true;
    const today = dateKey();
    const daily = getDaily(today);
    const stats = verifyChain(daily.word.name, answers);
    const payload = {
      chainLength: stats.chainLength,
      score: stats.score,
      categoriesUsed: stats.categoriesUsed.length,
      cosmicReached: stats.cosmicReached,
      validated: stats.validated.map((e) => e.name),
    };

    if (practice || !playerId) {
      return res.json({ ranked: false, result: payload });
    }
    const existing = store.getDailyResult(today, playerId);
    if (existing) {
      return res.json({ ranked: true, alreadyPlayed: true, result: existing });
    }
    const player = store.getPlayer(playerId);
    const name = player?.name ?? 'Spelare';
    const stored = store.recordDailyResult({ playerId, name, score: stats.score, chainLength: stats.chainLength, date: today, at: Date.now() });
    const xp = XP_DAILY_WORD + stats.chainLength * 2 + (stats.score >= 200 ? 20 : 0);
    const activity = store.awardActivity(playerId, xp, today);
    const rank = store.dailyLeaderboard(today, 1000).rows.find((r) => r.playerId === playerId)?.rank ?? null;
    return res.json({ ranked: true, result: { ...payload, stored }, rank, ...activitySummary(activity) });
  });

  // Submit a "Daglig utmaning" attempt.
  router.post('/daily/challenge/attempt', (req, res) => {
    const body = (req.body ?? {}) as Record<string, unknown>;
    const playerId = typeof body.playerId === 'string' ? body.playerId : '';
    const answers = Array.isArray(body.answers) ? (body.answers as string[]).filter((w) => typeof w === 'string') : [];
    const practice = body.practice === true;
    const today = dateKey();
    const daily = getDaily(today);
    const stats = verifyChain(daily.challenge.startWord, answers);
    const evalResult = evaluateChallenge(daily.challenge, stats);
    const base = { completed: evalResult.completed, progress: evalResult.progress, chainLength: stats.chainLength, score: stats.score };

    if (practice || !playerId || !evalResult.completed) {
      return res.json({ ranked: !practice && evalResult.completed, ...base });
    }
    const marker = `challenge:${today}`;
    if (store.getDailyResult(marker, playerId)) {
      return res.json({ ...base, alreadyPlayed: true });
    }
    store.recordDailyResult({ playerId, name: store.getPlayer(playerId)?.name ?? 'Spelare', score: stats.score, chainLength: stats.chainLength, date: marker, at: Date.now() });
    const activity = store.awardActivity(playerId, XP_CHALLENGE, today);
    return res.json({ ...base, ...activitySummary(activity) });
  });

  // Record a generic qualifying activity (e.g. finishing a local match) so the
  // streak/XP stay meaningful even outside online play.
  router.post('/activity', (req, res) => {
    const body = (req.body ?? {}) as Record<string, unknown>;
    const playerId = typeof body.playerId === 'string' ? body.playerId : '';
    if (!playerId) return res.status(400).json({ error: 'playerId krävs.' });
    const activity = store.awardActivity(playerId, XP_MATCH);
    if (!activity) return res.status(404).json({ error: 'Spelaren hittades inte.' });
    return res.json(activitySummary(activity));
  });

  // Create a shareable replay / match link.
  router.post('/replay', (req, res) => {
    const body = (req.body ?? {}) as Record<string, unknown>;
    const chain = Array.isArray(body.chain) ? (body.chain as ReplayMove[]) : [];
    if (chain.length === 0) return res.status(400).json({ error: 'Ingen kedja att spara.' });
    const visibility = (['private', 'friends', 'link'] as Visibility[]).includes(body.visibility as Visibility)
      ? (body.visibility as Visibility)
      : 'link';
    const replay = getReplayStore().create({
      mode: typeof body.mode === 'string' ? body.mode : 'match',
      players: Array.isArray(body.players) ? (body.players as string[]) : [],
      scores: Array.isArray(body.scores) ? (body.scores as number[]) : [],
      winnerIndex: typeof body.winnerIndex === 'number' ? body.winnerIndex : null,
      chain,
      visibility,
    });
    return res.status(201).json({ id: replay.id, url: `/match/${replay.id}` });
  });

  router.get('/replay/:id', (req, res) => {
    const replay = getReplayStore().get(req.params.id);
    if (!replay) return res.status(404).json({ error: 'Repriser hittades inte (eller är privat).' });
    return res.json(replay);
  });

  return router;
}

function activitySummary(activity: ReturnType<Store['awardActivity']>) {
  if (!activity) return { activity: null };
  const prog = levelProgress(activity.player.xp);
  return {
    activity: {
      xpGained: activity.xpGained,
      xp: activity.player.xp,
      level: activity.player.level,
      leveledUp: activity.leveledUp,
      fromLevel: activity.fromLevel,
      levelProgress: prog,
      streak: {
        current: activity.player.streakCurrent,
        longest: activity.player.streakLongest,
        newMilestones: activity.streak.newMilestones,
        isRecord: activity.streak.isRecord,
      },
    },
  };
}
