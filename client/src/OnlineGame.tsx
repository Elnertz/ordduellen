import { useEffect, useMemo, useState } from 'react';
import { useOnline, type RoomSettingsInput } from './online/useOnline';
import { StatBars } from './components/StatBars';
import type { GameState, JudgeResult, RoomView } from './types';

export default function OnlineGame() {
  const online = useOnline();
  const [name, setName] = useState('');
  const [word, setWord] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [settings, setSettings] = useState<RoomSettingsInput>({ winCondition: 'points', targetScore: 5, ranked: true });
  const [pendingRoom, setPendingRoom] = useState<string | null>(() => new URLSearchParams(location.search).get('rum'));

  useEffect(() => {
    // Pre-fill the saved name if present.
    try {
      const raw = localStorage.getItem('ordduellen_player');
      if (raw) setName((JSON.parse(raw) as { name?: string }).name ?? '');
    } catch {
      /* ignore */
    }
  }, []);

  const { player, room, game, result, connection } = online;

  // Auto-join a room from a shared deep link (?rum=CODE) once connected.
  useEffect(() => {
    if (player && !room && pendingRoom) {
      online.joinRoom(pendingRoom);
      setPendingRoom(null);
    }
  }, [player, room, pendingRoom, online]);

  if (!player) {
    return (
      <section className="card start-card">
        <h2>Spela online</h2>
        <p className="prompt">Välj ett namn så kopplar vi upp dig mot andra spelare.</p>
        <div className="field">
          <label htmlFor="oname">Ditt namn</label>
          <input
            id="oname"
            className="text-input"
            value={name}
            maxLength={24}
            placeholder="t.ex. Ordmästaren"
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && online.connect(name)}
          />
        </div>
        <button className="btn primary big" type="button" onClick={() => online.connect(name)}>
          {connection === 'connecting' ? 'Ansluter…' : 'Anslut'}
        </button>
        {online.error && <p className="error" role="alert">{online.error}</p>}
      </section>
    );
  }

  return (
    <div className="board">
      {connection === 'reconnecting' && (
        <div className="reconnect-banner" role="status">Återansluter…</div>
      )}

      <OnlineHeader player={player} onLeave={room ? online.leave : undefined} />

      {online.error && (
        <p className="error" role="alert" onAnimationEnd={online.clearError}>
          {online.error}
        </p>
      )}

      {!room && (
        <Menu
          online={online}
          settings={settings}
          setSettings={setSettings}
          joinCode={joinCode}
          setJoinCode={setJoinCode}
        />
      )}

      {room && !game && <Lobby room={room} online={online} />}

      {room && game && (
        <LiveDuel
          room={room}
          game={game}
          judgements={online.judgements}
          result={result}
          word={word}
          setWord={setWord}
          online={online}
        />
      )}
    </div>
  );
}

type OnlineApi = ReturnType<typeof useOnline>;

function OnlineHeader({ player, onLeave }: { player: NonNullable<OnlineApi['player']>; onLeave?: () => void }) {
  return (
    <section className="online-header">
      <div>
        <span className="online-name">{player.name}</span>
        <span className="online-rating">{player.rating} i rating</span>
      </div>
      <span className="online-record">
        {player.wins} V · {player.losses} F · {player.draws} O
      </span>
      {onLeave && (
        <button className="btn small" type="button" onClick={onLeave}>
          Lämna
        </button>
      )}
    </section>
  );
}

function Menu({
  online,
  settings,
  setSettings,
  joinCode,
  setJoinCode,
}: {
  online: OnlineApi;
  settings: RoomSettingsInput;
  setSettings: (s: RoomSettingsInput) => void;
  joinCode: string;
  setJoinCode: (s: string) => void;
}) {
  return (
    <div className="online-menu">
      <section className="card">
        <h3>Snabbmatch</h3>
        <p className="prompt">Matcha mot en slumpmässig motståndare direkt.</p>
        {online.quickmatchWaiting ? (
          <div className="queue">
            <span className="spinner" aria-hidden /> Söker motståndare…
            <button className="btn small" type="button" onClick={online.cancelQuickmatch}>
              Avbryt
            </button>
          </div>
        ) : (
          <button className="btn primary big" type="button" onClick={online.quickmatch}>
            Hitta match
          </button>
        )}
      </section>

      <section className="card">
        <h3>Spela med vänner</h3>
        <div className="field">
          <label>Vinstvillkor</label>
          <div className="chips">
            <button
              type="button"
              className={`chip ${settings.winCondition === 'points' ? 'chip-active' : ''}`}
              onClick={() => setSettings({ ...settings, winCondition: 'points' })}
            >
              Först till {settings.targetScore}
            </button>
            <button
              type="button"
              className={`chip ${settings.winCondition === 'endless' ? 'chip-active' : ''}`}
              onClick={() => setSettings({ ...settings, winCondition: 'endless' })}
            >
              Oändligt
            </button>
          </div>
        </div>
        {settings.winCondition === 'points' && (
          <div className="field">
            <label htmlFor="ots">Poäng att vinna: {settings.targetScore}</label>
            <input
              id="ots"
              type="range"
              min={1}
              max={15}
              value={settings.targetScore}
              onChange={(e) => setSettings({ ...settings, targetScore: Number(e.target.value) })}
            />
          </div>
        )}
        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={settings.ranked}
            onChange={(e) => setSettings({ ...settings, ranked: e.target.checked })}
          />
          Rankad match (påverkar rating)
        </label>
        <button className="btn primary big" type="button" onClick={() => online.createRoom(settings)}>
          Skapa rum
        </button>
      </section>

      <section className="card">
        <h3>Gå med via kod</h3>
        <div className="attack-row">
          <input
            className="text-input code-input"
            value={joinCode}
            maxLength={5}
            placeholder="RUMSKOD"
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === 'Enter' && online.joinRoom(joinCode)}
          />
          <button className="btn primary" type="button" onClick={() => online.joinRoom(joinCode)} disabled={joinCode.length < 4}>
            Gå med
          </button>
        </div>
      </section>
    </div>
  );
}

function Lobby({ room, online }: { room: RoomView; online: OnlineApi }) {
  const shareUrl = `${location.origin}/?rum=${room.code}`;
  return (
    <section className="card lobby">
      <h3>Väntrum</h3>
      <div className="room-code" aria-label="Rumskod">
        <span className="room-code-label">Rumskod</span>
        <span className="room-code-value">{room.code}</span>
        <button
          className="btn small"
          type="button"
          onClick={() => navigator.clipboard?.writeText(shareUrl).catch(() => undefined)}
        >
          Kopiera länk
        </button>
      </div>
      <ul className="lobby-players">
        {[0, 1].map((i) => {
          const p = room.players[i];
          return (
            <li key={i} className={`lobby-player ${p ? 'filled' : 'empty'}`}>
              {p ? (
                <>
                  <span className={`dot ${p.connected ? 'on' : 'off'}`} />
                  {p.name}
                  {i === room.youIndex && <span className="you-badge">Du</span>}
                  {room.hostId && i === 0 && <span className="host-badge">Värd</span>}
                </>
              ) : (
                <span className="waiting">Väntar på spelare…</span>
              )}
            </li>
          );
        })}
      </ul>
      <p className="prompt">
        {room.settings.ranked ? 'Rankad match' : 'Vänskapsmatch'} ·{' '}
        {room.settings.winCondition === 'points' ? `Först till ${room.settings.targetScore}` : 'Oändligt'}
      </p>
      {room.isHost ? (
        <button
          className="btn primary big"
          type="button"
          disabled={room.players.filter(Boolean).length < 2}
          onClick={online.start}
        >
          {room.players.filter(Boolean).length < 2 ? 'Väntar på motståndare…' : 'Starta matchen'}
        </button>
      ) : (
        <p className="prompt">Väntar på att värden startar…</p>
      )}
    </section>
  );
}

function LiveDuel({
  room,
  game,
  judgements,
  result,
  word,
  setWord,
  online,
}: {
  room: RoomView;
  game: GameState;
  judgements: JudgeResult[];
  result: OnlineApi['result'];
  word: string;
  setWord: (s: string) => void;
  online: OnlineApi;
}) {
  const you = room.youIndex;
  const yourTurn = game.status === 'playing' && game.currentPlayerIndex === you;
  const target = game.target;

  const submit = () => {
    if (!word.trim() || !yourTurn) return;
    online.move(word.trim());
    setWord('');
  };

  const turnLabel = useMemo(() => {
    if (game.status === 'finished') return 'Matchen är slut';
    return yourTurn ? 'Din tur' : `${game.players[game.currentPlayerIndex]?.name ?? 'Motståndaren'}s tur`;
  }, [game, yourTurn]);

  return (
    <>
      <section className="scoreboard">
        {game.players.map((p, i) => (
          <div key={i} className={`score ${game.currentPlayerIndex === i && game.status === 'playing' ? 'active-turn' : ''} ${result?.winnerIndex === i ? 'winner' : ''}`}>
            <span className="score-name">
              {p.name}
              {i === you ? ' (du)' : ''}
            </span>
            <span className="score-value">{p.score}</span>
          </div>
        ))}
      </section>

      {result ? (
        <section className="card game-over">
          <h2>
            {result.winnerIndex === you ? 'Du vann! 🎉' : result.winnerIndex === null ? 'Oavgjort' : 'Du förlorade'}
            {result.forfeit ? ' (motståndaren lämnade)' : ''}
          </h2>
          {result.ranked && result.ratings[you] && (
            <p className="final-score">
              Rating: {result.ratings[you].delta >= 0 ? '+' : ''}
              {result.ratings[you].delta} → {result.ratings[you].rating}
            </p>
          )}
          <div className="actions">
            <button className="btn primary" type="button" onClick={online.rematch}>
              {room.players[you]?.wantsRematch ? 'Väntar på motståndaren…' : 'Revansch'}
            </button>
            <button className="btn" type="button" onClick={online.leave}>
              Lämna
            </button>
          </div>
        </section>
      ) : (
        <section className="duel-area">
          <p className="prompt turn-indicator" data-your-turn={yourTurn}>
            {turnLabel}
          </p>
          <div className="target-card" key={target.name}>
            <div className="target-word">{target.name}</div>
            <div className="target-cats">
              {target.categoryLabels.map((c) => (
                <span key={c} className="cat-badge">{c}</span>
              ))}
              <span className="scale-badge">skala {target.scale}</span>
            </div>
            <p className="target-desc">{target.description}</p>
            <StatBars stats={target.stats} />
          </div>
          <div className="attack-row">
            <input
              className="word-input"
              value={word}
              disabled={!yourTurn}
              placeholder={yourTurn ? `Vad slår ${target.name}?` : 'Vänta på din tur…'}
              onChange={(e) => setWord(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submit()}
              autoFocus
            />
            <button className="btn primary" type="button" onClick={submit} disabled={!yourTurn || !word.trim()}>
              Attackera
            </button>
          </div>
        </section>
      )}

      {judgements.length > 0 && (
        <section className="verdict-feed" aria-live="polite">
          {judgements.map((j, i) => (
            <div key={i} className={`verdict ${j.verdict}`}>
              <div className="verdict-head">
                <span className="verdict-badge">{j.verdict === 'approved' ? '✓ Godkänt' : '✗ Nekat'}</span>
                <span className="verdict-word">{j.answer.name}</span>
                <span className="verdict-conf">{j.confidence}% säker</span>
              </div>
              <p className="verdict-text">{j.reason}</p>
            </div>
          ))}
        </section>
      )}

      {game.chain.length > 0 && (
        <section className="card chain">
          <h3>Duellkedja</h3>
          <ol className="chain-list">
            {game.chain.slice(0, 12).map((link) => (
              <li key={link.turn} className={`chain-item ${link.verdict}`}>
                <span className="chain-turn">#{link.turn}</span>
                <span className="chain-player">{link.playerName}</span>
                <span className="chain-move">
                  {link.fromTarget} <span className="arrow">→</span> <strong>{link.word || '—'}</strong>
                </span>
                <span className={`chain-verdict ${link.verdict}`}>{link.awardedPoint ? '+1' : '✗'}</span>
              </li>
            ))}
          </ol>
        </section>
      )}
    </>
  );
}
