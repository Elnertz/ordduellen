import { useCallback, useState } from 'react';
import { ApiError, createGame, getHint, submitWord } from './api';
import type { Difficulty, GameState, RoundResult } from './types';

const LETTER_VALUES: Record<string, number> = {
  A: 1, E: 1, I: 1, N: 1, R: 1, S: 1, T: 1, D: 1, L: 1,
  O: 2, G: 2, K: 2, M: 2, H: 2, U: 4,
  F: 3, V: 3, P: 3, B: 3, J: 7, Y: 7, C: 8, X: 8, Z: 10,
  Å: 4, Ä: 4, Ö: 4,
};

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: 'Lätt',
  medium: 'Medel',
  hard: 'Svår',
};

function scoreWord(word: string): number {
  let sum = 0;
  for (const ch of word.toUpperCase()) sum += LETTER_VALUES[ch] ?? 0;
  const len = word.length;
  const bonus = len >= 7 ? 20 : len >= 6 ? 12 : len >= 5 ? 6 : 0;
  return sum + bonus;
}

interface Settings {
  rounds: number;
  rackSize: number;
  difficulty: Difficulty;
}

export default function App() {
  const [settings, setSettings] = useState<Settings>({ rounds: 5, rackSize: 8, difficulty: 'medium' });
  const [game, setGame] = useState<GameState | null>(null);
  const [typed, setTyped] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [lastRound, setLastRound] = useState<RoundResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [hint, setHint] = useState<string | null>(null);

  const start = useCallback(async () => {
    setBusy(true);
    setError(null);
    setLastRound(null);
    setHint(null);
    setTyped('');
    try {
      const state = await createGame(settings);
      setGame(state);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kunde inte starta spelet.');
    } finally {
      setBusy(false);
    }
  }, [settings]);

  const submit = useCallback(async () => {
    if (!game) return;
    setBusy(true);
    setError(null);
    try {
      const res = await submitWord(game.id, typed);
      setGame(res.state);
      setLastRound(res.round);
      setTyped('');
      setHint(null);
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError('Något gick fel.');
    } finally {
      setBusy(false);
    }
  }, [game, typed]);

  const pass = useCallback(async () => {
    if (!game) return;
    setTyped('');
    setBusy(true);
    setError(null);
    try {
      const res = await submitWord(game.id, '');
      setGame(res.state);
      setLastRound(res.round);
      setHint(null);
    } catch {
      setError('Något gick fel.');
    } finally {
      setBusy(false);
    }
  }, [game]);

  const askHint = useCallback(async () => {
    if (!game) return;
    try {
      const h = await getHint(game.id);
      setHint(h);
    } catch {
      setHint(null);
    }
  }, [game]);

  const addLetter = (letter: string) => {
    if (busy) return;
    setError(null);
    setTyped((prev) => prev + letter);
  };

  const previewScore = typed ? scoreWord(typed) : 0;

  return (
    <div className="page">
      <header className="header">
        <h1>
          <span className="logo">🔤</span> Ordduellen
        </h1>
        <p className="tagline">Ett strategiskt svenskt ordspel — du mot datorn</p>
      </header>

      {!game && (
        <StartCard
          settings={settings}
          setSettings={setSettings}
          onStart={start}
          busy={busy}
          error={error}
        />
      )}

      {game && (
        <main className="board">
          <Scoreboard game={game} />

          {game.status === 'playing' ? (
            <section className="play">
              <div className="round-label">
                Runda {game.currentRound} av {game.rounds} · Svårighet: {DIFFICULTY_LABELS[game.difficulty]}
              </div>

              <div className="rack" aria-label="Bokstäver">
                {game.rack.map((letter, i) => (
                  <button
                    key={`${letter}-${i}`}
                    className="tile"
                    onClick={() => addLetter(letter)}
                    disabled={busy}
                    type="button"
                  >
                    <span className="tile-letter">{letter}</span>
                    <span className="tile-value">{LETTER_VALUES[letter] ?? 0}</span>
                  </button>
                ))}
              </div>

              <div className="word-builder">
                <input
                  className="word-input"
                  value={typed}
                  onChange={(e) => {
                    setTyped(e.target.value.replace(/[^a-zA-ZåäöÅÄÖ]/g, '').toUpperCase());
                    setError(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && typed && !busy) submit();
                  }}
                  placeholder="Skriv eller klicka på bokstäver…"
                  aria-label="Ditt ord"
                  autoFocus
                />
                <span className="preview" title="Poäng för ordet">
                  {previewScore} p
                </span>
              </div>

              <div className="actions">
                <button className="btn primary" onClick={submit} disabled={busy || !typed} type="button">
                  Spela ord
                </button>
                <button className="btn" onClick={() => setTyped('')} disabled={busy || !typed} type="button">
                  Rensa
                </button>
                <button className="btn" onClick={pass} disabled={busy} type="button">
                  Passa
                </button>
                <button className="btn ghost" onClick={askHint} disabled={busy} type="button">
                  Ledtråd
                </button>
              </div>

              {hint && (
                <p className="hint">
                  Tips: prova <strong>{hint.toUpperCase()}</strong>
                </p>
              )}
              {error && <p className="error">{error}</p>}
            </section>
          ) : (
            <GameOver game={game} onRestart={() => setGame(null)} />
          )}

          {lastRound && game.status === 'playing' && <RoundSummary round={lastRound} />}
          {game.history.length > 0 && <History rounds={game.history} />}
        </main>
      )}

      <footer className="footer">
        Ordlista: ~91 000 svenska ord från SAOL · byggd som demo för Cloud Agent-miljön
      </footer>
    </div>
  );
}

function StartCard({
  settings,
  setSettings,
  onStart,
  busy,
  error,
}: {
  settings: Settings;
  setSettings: (s: Settings) => void;
  onStart: () => void;
  busy: boolean;
  error: string | null;
}) {
  return (
    <section className="card start-card">
      <h2>Ny duell</h2>
      <div className="field">
        <label htmlFor="rounds">Antal rundor: {settings.rounds}</label>
        <input
          id="rounds"
          type="range"
          min={1}
          max={10}
          value={settings.rounds}
          onChange={(e) => setSettings({ ...settings, rounds: Number(e.target.value) })}
        />
      </div>
      <div className="field">
        <label htmlFor="rack">Bokstäver per runda: {settings.rackSize}</label>
        <input
          id="rack"
          type="range"
          min={5}
          max={10}
          value={settings.rackSize}
          onChange={(e) => setSettings({ ...settings, rackSize: Number(e.target.value) })}
        />
      </div>
      <div className="field">
        <label>Svårighet</label>
        <div className="difficulty">
          {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
            <button
              key={d}
              type="button"
              className={`chip ${settings.difficulty === d ? 'chip-active' : ''}`}
              onClick={() => setSettings({ ...settings, difficulty: d })}
            >
              {DIFFICULTY_LABELS[d]}
            </button>
          ))}
        </div>
      </div>
      <button className="btn primary big" onClick={onStart} disabled={busy} type="button">
        {busy ? 'Startar…' : 'Starta spelet'}
      </button>
      {error && <p className="error">{error}</p>}
    </section>
  );
}

function Scoreboard({ game }: { game: GameState }) {
  return (
    <section className="scoreboard">
      <div className="score you">
        <span className="score-name">Du</span>
        <span className="score-value">{game.scores.player}</span>
      </div>
      <div className="vs">vs</div>
      <div className="score ai">
        <span className="score-name">Datorn</span>
        <span className="score-value">{game.scores.ai}</span>
      </div>
    </section>
  );
}

function RoundSummary({ round }: { round: RoundResult }) {
  return (
    <section className="card round-summary">
      <h3>Runda {round.round} klar</h3>
      <div className="summary-grid">
        <div>
          <span className="summary-label">Ditt ord</span>
          <span className="summary-word">{round.playerWord ? round.playerWord.toUpperCase() : '— (passade)'}</span>
          <span className="summary-score">{round.playerScore} p</span>
        </div>
        <div>
          <span className="summary-label">Datorns ord</span>
          <span className="summary-word">{round.aiWord ? round.aiWord.toUpperCase() : '—'}</span>
          <span className="summary-score">{round.aiScore} p</span>
        </div>
        <div>
          <span className="summary-label">Bästa möjliga</span>
          <span className="summary-word">{round.bestPossibleWord.toUpperCase()}</span>
          <span className="summary-score">{round.bestPossibleScore} p</span>
        </div>
      </div>
    </section>
  );
}

function GameOver({ game, onRestart }: { game: GameState; onRestart: () => void }) {
  const title =
    game.winner === 'player' ? 'Du vann! 🎉' : game.winner === 'ai' ? 'Datorn vann' : 'Oavgjort';
  return (
    <section className={`card game-over ${game.winner}`}>
      <h2>{title}</h2>
      <p className="final-score">
        Du {game.scores.player} — {game.scores.ai} Datorn
      </p>
      <button className="btn primary big" onClick={onRestart} type="button">
        Spela igen
      </button>
    </section>
  );
}

function History({ rounds }: { rounds: RoundResult[] }) {
  return (
    <section className="card history">
      <h3>Historik</h3>
      <table>
        <thead>
          <tr>
            <th>Runda</th>
            <th>Ditt ord</th>
            <th>Du</th>
            <th>Datorns ord</th>
            <th>Datorn</th>
          </tr>
        </thead>
        <tbody>
          {rounds.map((r) => (
            <tr key={r.round}>
              <td>{r.round}</td>
              <td>{r.playerWord ? r.playerWord.toUpperCase() : '—'}</td>
              <td className={r.playerScore >= r.aiScore ? 'win' : ''}>{r.playerScore}</td>
              <td>{r.aiWord ? r.aiWord.toUpperCase() : '—'}</td>
              <td className={r.aiScore > r.playerScore ? 'win' : ''}>{r.aiScore}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
