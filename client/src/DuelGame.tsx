import { useCallback, useEffect, useMemo, useRef, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react';
import { ApiError, createGame, getRandomWord, playTurn } from './api';
import type { Difficulty, GameMode, GameState, JudgeResult, WinCondition } from './types';
import { StatBars } from './components/StatBars';

interface Settings {
  mode: GameMode;
  winCondition: WinCondition;
  difficulty: Difficulty;
  targetScore: number;
  startWord: string;
  player1: string;
  player2: string;
}

const DEFAULT_SETTINGS: Settings = {
  mode: 'vsComputer',
  winCondition: 'points',
  difficulty: 'medium',
  targetScore: 5,
  startWord: '',
  player1: 'Spelare 1',
  player2: 'Spelare 2',
};

export default function DuelGame() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [game, setGame] = useState<GameState | null>(null);
  const [word, setWord] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [lastJudgements, setLastJudgements] = useState<JudgeResult[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const start = useCallback(async () => {
    setBusy(true);
    setError(null);
    setLastJudgements([]);
    try {
      const state = await createGame({
        mode: settings.mode,
        winCondition: settings.winCondition,
        difficulty: settings.difficulty,
        targetScore: settings.targetScore,
        startWord: settings.startWord.trim() || undefined,
        playerNames:
          settings.mode === 'twoPlayer'
            ? [settings.player1 || 'Spelare 1', settings.player2 || 'Spelare 2']
            : ['Du', 'Datorn'],
      });
      setGame(state);
      setWord('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kunde inte starta spelet.');
    } finally {
      setBusy(false);
    }
  }, [settings]);

  const submit = useCallback(async () => {
    if (!game || !word.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const res = await playTurn(game.id, word.trim());
      setGame(res.state);
      setLastJudgements(res.judgements);
      setWord('');
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError('Något gick fel.');
    } finally {
      setBusy(false);
    }
  }, [game, word]);

  const randomize = useCallback(async () => {
    try {
      const r = await getRandomWord();
      setSettings((s) => ({ ...s, startWord: r.word }));
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (game?.status === 'playing') inputRef.current?.focus();
  }, [game?.target.name, game?.status]);

  if (!game) {
    return <StartScreen settings={settings} setSettings={setSettings} onStart={start} onRandom={randomize} busy={busy} error={error} />;
  }

  const currentPlayer = game.players[game.currentPlayerIndex];
  const humanTurn = !currentPlayer.isComputer && game.status === 'playing';

  return (
    <div className="board">
      <Scoreboard game={game} />

      {game.status === 'finished' ? (
        <GameOver game={game} onRestart={() => setGame(null)} />
      ) : (
        <section className="duel-area">
          <p className="prompt">
            <strong>{currentPlayer.name}</strong>, vad besegrar
          </p>
          <TargetCard game={game} />

          <div className="attack-row">
            <input
              ref={inputRef}
              className="word-input"
              value={word}
              onChange={(e) => {
                setWord(e.target.value);
                setError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && word.trim() && !busy) submit();
              }}
              placeholder={`Vad slår ${game.target.name}?`}
              aria-label={`Ditt svar mot ${game.target.name}`}
              disabled={busy || !humanTurn}
              autoFocus
            />
            <button className="btn primary" onClick={submit} disabled={busy || !word.trim() || !humanTurn} type="button">
              Attackera
            </button>
          </div>
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
        </section>
      )}

      <VerdictFeed judgements={lastJudgements} />
      {game.chain.length > 0 && <ChainHistory game={game} />}
      <StatsPanel game={game} />
    </div>
  );
}

function StartScreen({
  settings,
  setSettings,
  onStart,
  onRandom,
  busy,
  error,
}: {
  settings: Settings;
  setSettings: Dispatch<SetStateAction<Settings>>;
  onStart: () => void;
  onRandom: () => void;
  busy: boolean;
  error: string | null;
}) {
  return (
    <section className="card start-card">
      <h2>Ny duell</h2>

      <div className="field">
        <label>Spelläge</label>
        <div className="chips">
          <Chip active={settings.mode === 'vsComputer'} onClick={() => setSettings((s) => ({ ...s, mode: 'vsComputer' }))}>
            Mot datorn
          </Chip>
          <Chip active={settings.mode === 'twoPlayer'} onClick={() => setSettings((s) => ({ ...s, mode: 'twoPlayer' }))}>
            Två spelare
          </Chip>
        </div>
      </div>

      {settings.mode === 'twoPlayer' && (
        <div className="field two-cols">
          <div>
            <label htmlFor="p1">Spelare 1</label>
            <input id="p1" className="text-input" value={settings.player1} onChange={(e) => setSettings((s) => ({ ...s, player1: e.target.value }))} />
          </div>
          <div>
            <label htmlFor="p2">Spelare 2</label>
            <input id="p2" className="text-input" value={settings.player2} onChange={(e) => setSettings((s) => ({ ...s, player2: e.target.value }))} />
          </div>
        </div>
      )}

      {settings.mode === 'vsComputer' && (
        <div className="field">
          <label>Datorns svårighet</label>
          <div className="chips">
            {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
              <Chip key={d} active={settings.difficulty === d} onClick={() => setSettings((s) => ({ ...s, difficulty: d }))}>
                {d === 'easy' ? 'Lätt' : d === 'medium' ? 'Medel' : 'Svår'}
              </Chip>
            ))}
          </div>
        </div>
      )}

      <div className="field">
        <label>Vinstvillkor</label>
        <div className="chips">
          <Chip active={settings.winCondition === 'points'} onClick={() => setSettings((s) => ({ ...s, winCondition: 'points' }))}>
            Först till {settings.targetScore} poäng
          </Chip>
          <Chip active={settings.winCondition === 'endless'} onClick={() => setSettings((s) => ({ ...s, winCondition: 'endless' }))}>
            Oändligt
          </Chip>
        </div>
      </div>

      {settings.winCondition === 'points' && (
        <div className="field">
          <label htmlFor="ts">Poäng att vinna: {settings.targetScore}</label>
          <input
            id="ts"
            type="range"
            min={1}
            max={15}
            value={settings.targetScore}
            onChange={(e) => setSettings((s) => ({ ...s, targetScore: Number(e.target.value) }))}
          />
        </div>
      )}

      <div className="field">
        <label htmlFor="start">Startord (valfritt)</label>
        <div className="attack-row">
          <input
            id="start"
            className="text-input"
            value={settings.startWord}
            onChange={(e) => setSettings((s) => ({ ...s, startWord: e.target.value }))}
            placeholder="Slumpas automatiskt om tomt"
          />
          <button className="btn ghost" type="button" onClick={onRandom}>
            Slumpa
          </button>
        </div>
      </div>

      <button className="btn primary big" onClick={onStart} disabled={busy} type="button">
        {busy ? 'Startar…' : 'Starta duellen'}
      </button>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" className={`chip ${active ? 'chip-active' : ''}`} onClick={onClick} aria-pressed={active}>
      {children}
    </button>
  );
}

function Scoreboard({ game }: { game: GameState }) {
  return (
    <section className="scoreboard" aria-label="Ställning">
      {game.players.map((p, i) => (
        <div key={i} className={`score ${game.currentPlayerIndex === i && game.status === 'playing' ? 'active-turn' : ''} ${game.winner === i ? 'winner' : ''}`}>
          <span className="score-name">
            {p.name}
            {p.isComputer ? ' 🤖' : ''}
          </span>
          <span className="score-value">{p.score}</span>
          {game.winCondition === 'points' && <span className="score-goal">mål: {game.targetScore}</span>}
        </div>
      ))}
    </section>
  );
}

function TargetCard({ game }: { game: GameState }) {
  const t = game.target;
  return (
    <div className="target-card" key={t.name}>
      <div className="target-word">{t.name}</div>
      <div className="target-cats">
        {t.categoryLabels.map((c) => (
          <span key={c} className="cat-badge">
            {c}
          </span>
        ))}
        <span className="scale-badge" title="Existensskala">
          skala {t.scale}
        </span>
      </div>
      <p className="target-desc">{t.description}</p>
      <StatBars stats={t.stats} />
      {t.tagLabels.length > 0 && (
        <div className="tag-row">
          {t.tagLabels.slice(0, 8).map((tag) => (
            <span key={tag} className="tag-pill">
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function VerdictFeed({ judgements }: { judgements: JudgeResult[] }) {
  if (judgements.length === 0) return null;
  return (
    <section className="verdict-feed" aria-live="polite">
      {judgements.map((j, i) => (
        <div key={i} className={`verdict ${j.verdict}`}>
          <div className="verdict-head">
            <span className="verdict-badge">{j.verdict === 'approved' ? '✓ Godkänt' : '✗ Nekat'}</span>
            <span className="verdict-word">
              {j.answer.name}
              {j.answer.matchType === 'inferred' && <span className="inferred-note"> (gissad)</span>}
            </span>
            <span className="verdict-conf">{Math.round(j.confidence * 100)}% säker</span>
          </div>
          <p className="verdict-text">{j.explanation}</p>
        </div>
      ))}
    </section>
  );
}

function ChainHistory({ game }: { game: GameState }) {
  return (
    <section className="card chain">
      <h3>Duellkedja</h3>
      <ol className="chain-list">
        {game.chain.map((link) => (
          <li key={link.turn} className={`chain-item ${link.verdict}`}>
            <span className="chain-turn">#{link.turn}</span>
            <span className="chain-player">{link.playerName}</span>
            <span className="chain-move">
              {link.fromTarget} <span className="arrow">→</span> <strong>{link.word}</strong>
            </span>
            <span className={`chain-verdict ${link.verdict}`}>
              {link.verdict === 'approved' ? `+1` : '✗'}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

function StatsPanel({ game }: { game: GameState }) {
  const s = game.stats;
  const approvalRate = s.turns > 0 ? Math.round((s.approvals / s.turns) * 100) : 0;
  const items = useMemo(
    () => [
      { label: 'Turer', value: s.turns },
      { label: 'Godkända', value: s.approvals },
      { label: 'Nekade', value: s.rejections },
      { label: 'Träffsäkerhet', value: `${approvalRate}%` },
      { label: 'Längsta kedja', value: s.longestChain },
      { label: 'Starkaste ord', value: s.strongestWord ? `${s.strongestWord.name} (${s.strongestWord.scale})` : '—' },
    ],
    [s, approvalRate],
  );
  return (
    <section className="card stats-panel">
      <h3>Statistik</h3>
      <div className="stats-grid">
        {items.map((it) => (
          <div key={it.label} className="stat-box">
            <span className="stat-value">{it.value}</span>
            <span className="stat-label">{it.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function GameOver({ game, onRestart }: { game: GameState; onRestart: () => void }) {
  const winner = game.winner !== null ? game.players[game.winner] : null;
  return (
    <section className="card game-over">
      <h2>{winner ? `${winner.name} vinner! 🎉` : 'Duellen är slut'}</h2>
      <p className="final-score">
        {game.players.map((p) => `${p.name} ${p.score}`).join('  —  ')}
      </p>
      <button className="btn primary big" onClick={onRestart} type="button">
        Spela igen
      </button>
    </section>
  );
}
