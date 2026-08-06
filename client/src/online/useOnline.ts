import { useCallback, useEffect, useRef, useState } from 'react';
import type { GameState, JudgeResult, MatchResult, Player, RoomView, WinCondition } from '../types';

const STORAGE_KEY = 'ordduellen_player';

type ConnectionState = 'idle' | 'connecting' | 'connected' | 'reconnecting';

interface StoredPlayer {
  id: string;
  name: string;
}

function loadStored(): StoredPlayer | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredPlayer) : null;
  } catch {
    return null;
  }
}

export interface RoomSettingsInput {
  winCondition: WinCondition;
  targetScore: number;
  startWord?: string;
  ranked: boolean;
}

export interface OnlineApi {
  connection: ConnectionState;
  player: Player | null;
  room: RoomView | null;
  game: GameState | null;
  judgements: JudgeResult[];
  result: MatchResult | null;
  error: string | null;
  quickmatchWaiting: boolean;
  connect: (name: string) => void;
  createRoom: (settings: RoomSettingsInput) => void;
  joinRoom: (code: string) => void;
  quickmatch: () => void;
  cancelQuickmatch: () => void;
  start: () => void;
  move: (word: string) => void;
  rematch: () => void;
  leave: () => void;
  clearError: () => void;
}

export function useOnline(): OnlineApi {
  const wsRef = useRef<WebSocket | null>(null);
  const stored = useRef<StoredPlayer | null>(loadStored());
  const wantConnected = useRef(false);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [connection, setConnection] = useState<ConnectionState>('idle');
  const [player, setPlayer] = useState<Player | null>(null);
  const [room, setRoom] = useState<RoomView | null>(null);
  const [game, setGame] = useState<GameState | null>(null);
  const [judgements, setJudgements] = useState<JudgeResult[]>([]);
  const [result, setResult] = useState<MatchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [quickmatchWaiting, setQuickmatchWaiting] = useState(false);

  const send = useCallback((obj: Record<string, unknown>) => {
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(obj));
  }, []);

  const sayHello = useCallback(() => {
    send({ type: 'hello', playerId: stored.current?.id, name: stored.current?.name ?? 'Spelare' });
  }, [send]);

  const handle = useCallback((msg: Record<string, unknown>) => {
    switch (msg.type) {
      case 'hello_ok': {
        const p = msg.player as Player;
        setPlayer(p);
        stored.current = { id: p.id, name: p.name };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stored.current));
        break;
      }
      case 'room_created':
        setResult(null);
        setJudgements([]);
        break;
      case 'room_update':
        setRoom(msg.room as RoomView);
        break;
      case 'matched':
        setResult(null);
        setJudgements([]);
        setQuickmatchWaiting(false);
        break;
      case 'quickmatch_waiting':
        setQuickmatchWaiting(true);
        break;
      case 'quickmatch_cancelled':
        setQuickmatchWaiting(false);
        break;
      case 'game_update':
        setGame(msg.state as GameState);
        setJudgements((msg.judgements as JudgeResult[]) ?? []);
        setResult(null);
        break;
      case 'match_over':
        setGame(msg.state as GameState);
        setResult({
          winnerIndex: (msg.winnerIndex as number | null) ?? null,
          ranked: Boolean(msg.ranked),
          forfeit: Boolean(msg.forfeit),
          ratings: (msg.ratings as MatchResult['ratings']) ?? [],
        });
        break;
      case 'left':
        setRoom(null);
        setGame(null);
        setResult(null);
        break;
      case 'error':
        setError(String(msg.message ?? 'Fel'));
        break;
      default:
        break;
    }
  }, []);

  const openSocket = useCallback(() => {
    if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
      return;
    }
    const proto = location.protocol === 'https:' ? 'wss' : 'ws';
    const ws = new WebSocket(`${proto}://${location.host}/ws`);
    wsRef.current = ws;
    setConnection((c) => (c === 'connected' ? 'reconnecting' : 'connecting'));

    ws.onopen = () => {
      setConnection('connected');
      sayHello();
    };
    ws.onclose = () => {
      if (!wantConnected.current) {
        setConnection('idle');
        return;
      }
      setConnection('reconnecting');
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      reconnectTimer.current = setTimeout(openSocket, 1500);
    };
    ws.onerror = () => ws.close();
    ws.onmessage = (ev) => {
      let msg: Record<string, unknown>;
      try {
        msg = JSON.parse(ev.data as string);
      } catch {
        return;
      }
      handle(msg);
    };
  }, [sayHello, handle]);

  const connect = useCallback(
    (name: string) => {
      const trimmed = name.trim().slice(0, 24) || 'Spelare';
      stored.current = { id: stored.current?.id ?? '', name: trimmed };
      wantConnected.current = true;
      openSocket();
      // If already connected, refresh identity.
      if (wsRef.current?.readyState === WebSocket.OPEN) sayHello();
    },
    [openSocket, sayHello],
  );

  useEffect(() => {
    return () => {
      wantConnected.current = false;
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
    };
  }, []);

  return {
    connection,
    player,
    room,
    game,
    judgements,
    result,
    error,
    quickmatchWaiting,
    connect,
    createRoom: (settings) => { setGame(null); setResult(null); send({ type: 'create_room', settings }); },
    joinRoom: (code) => { setGame(null); setResult(null); send({ type: 'join_room', code: code.toUpperCase().trim() }); },
    quickmatch: () => send({ type: 'quickmatch' }),
    cancelQuickmatch: () => send({ type: 'cancel_quickmatch' }),
    start: () => send({ type: 'start' }),
    move: (word) => send({ type: 'move', word, seq: game?.stats.turns }),
    rematch: () => send({ type: 'rematch' }),
    leave: () => { send({ type: 'leave' }); setRoom(null); setGame(null); setResult(null); },
    clearError: () => setError(null),
  };
}
