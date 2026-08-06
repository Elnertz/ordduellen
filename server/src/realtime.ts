// Server-authoritative realtime multiplayer over WebSockets: private rooms with
// codes, quickmatch, presence, reconnect, per-turn timeout, forfeit, idempotent
// moves and Elo-rated results. All game state lives on the server — clients only
// send intents (create/join/start/move/leave) and render what the server sends.

import { WebSocketServer, WebSocket } from 'ws';
import type { Server } from 'node:http';
import { Database } from './database.js';
import { GameManager, GameNotFoundError, type WinCondition } from './game.js';
import { Store } from './store.js';

const TURN_MS = 60_000;
const DISCONNECT_GRACE_MS = 45_000;
const ROOM_TTL_MS = 30 * 60_000;

interface Conn {
  ws: WebSocket;
  playerId: string | null;
  name: string;
  code: string | null;
  alive: boolean;
}

interface RoomPlayer {
  playerId: string;
  name: string;
  index: number;
  connected: boolean;
  wantsRematch: boolean;
  disconnectTimer: ReturnType<typeof setTimeout> | null;
}

interface RoomSettings {
  winCondition: WinCondition;
  targetScore: number;
  startWord?: string;
  ranked: boolean;
}

interface Room {
  code: string;
  hostId: string;
  players: RoomPlayer[];
  status: 'lobby' | 'playing' | 'finished';
  gameId: string | null;
  settings: RoomSettings;
  turnTimer: ReturnType<typeof setTimeout> | null;
  turnDeadline: number | null;
  recorded: boolean;
  createdAt: number;
  lastActivity: number;
}

export function attachRealtime(server: Server, db: Database, store: Store): void {
  const wss = new WebSocketServer({ server, path: '/ws' });
  const manager = new GameManager(db);

  const conns = new Map<WebSocket, Conn>();
  const connByPlayer = new Map<string, Conn>();
  const rooms = new Map<string, Room>();
  const quickQueue: string[] = [];

  // --- helpers ------------------------------------------------------------
  const send = (ws: WebSocket, obj: unknown): void => {
    if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(obj));
  };
  const sendToPlayer = (playerId: string, obj: unknown): void => {
    const c = connByPlayer.get(playerId);
    if (c) send(c.ws, obj);
  };
  const err = (ws: WebSocket, message: string): void => send(ws, { type: 'error', message });

  const publicPlayers = (room: Room) =>
    room.players.map((p) => ({
      name: p.name,
      index: p.index,
      connected: p.connected,
      rating: store.getPlayer(p.playerId)?.rating ?? 1000,
      wantsRematch: p.wantsRematch,
    }));

  const sendRoomUpdate = (room: Room): void => {
    for (const p of room.players) {
      sendToPlayer(p.playerId, {
        type: 'room_update',
        room: {
          code: room.code,
          status: room.status,
          hostId: room.hostId,
          isHost: p.playerId === room.hostId,
          settings: room.settings,
          players: publicPlayers(room),
          youIndex: p.index,
        },
      });
    }
  };

  const broadcastGame = (room: Room, judgements: unknown[] = []): void => {
    if (!room.gameId) return;
    const state = manager.getGame(room.gameId);
    const payload = {
      type: 'game_update',
      state,
      judgements,
      turnDeadline: room.turnDeadline,
      players: publicPlayers(room),
    };
    for (const p of room.players) sendToPlayer(p.playerId, payload);
  };

  const clearTurnTimer = (room: Room): void => {
    if (room.turnTimer) {
      clearTimeout(room.turnTimer);
      room.turnTimer = null;
    }
    room.turnDeadline = null;
  };

  const startTurnTimer = (room: Room): void => {
    clearTurnTimer(room);
    if (room.status !== 'playing' || !room.gameId) return;
    room.turnDeadline = Date.now() + TURN_MS;
    room.turnTimer = setTimeout(() => {
      if (!room.gameId) return;
      try {
        const res = manager.forfeitTurn(room.gameId);
        afterMove(room, res.state, []);
      } catch {
        /* game gone */
      }
    }, TURN_MS);
  };

  const finalize = (room: Room): void => {
    if (room.recorded || !room.gameId) return;
    const state = manager.getGame(room.gameId);
    if (!state) return;
    room.recorded = true;
    room.status = 'finished';
    clearTurnTimer(room);
    const [a, b] = room.players;
    const before = {
      a: store.getPlayer(a.playerId)?.rating ?? 1000,
      b: store.getPlayer(b?.playerId)?.rating ?? 1000,
    };
    if (a && b) {
      store.recordMatch({
        playerA: a.playerId,
        playerB: b.playerId,
        scoreA: state.players[0].score,
        scoreB: state.players[1].score,
        chainLength: state.stats.longestChain,
        ranked: room.settings.ranked,
      });
    }
    const after = {
      a: store.getPlayer(a.playerId)?.rating ?? before.a,
      b: store.getPlayer(b?.playerId)?.rating ?? before.b,
    };
    for (const p of room.players) {
      sendToPlayer(p.playerId, {
        type: 'match_over',
        state,
        winnerIndex: state.winner,
        ranked: room.settings.ranked,
        ratings: [
          { index: 0, rating: after.a, delta: after.a - before.a },
          { index: 1, rating: after.b, delta: after.b - before.b },
        ],
      });
    }
  };

  const afterMove = (room: Room, state: ReturnType<typeof manager.getGame>, judgements: unknown[]): void => {
    room.lastActivity = Date.now();
    if (state && state.status === 'finished') {
      broadcastGame(room, judgements);
      finalize(room);
    } else {
      startTurnTimer(room);
      broadcastGame(room, judgements);
    }
  };

  const forfeitToOpponent = (room: Room, leaverId: string): void => {
    if (room.recorded) return;
    const opponent = room.players.find((p) => p.playerId !== leaverId);
    if (room.status === 'playing' && room.gameId && opponent) {
      const state = manager.getGame(room.gameId);
      room.recorded = true;
      room.status = 'finished';
      clearTurnTimer(room);
      const before = new Map(room.players.map((p) => [p.playerId, store.getPlayer(p.playerId)?.rating ?? 1000]));
      store.recordMatch({
        playerA: room.players[0].playerId,
        playerB: room.players[1]?.playerId ?? opponent.playerId,
        scoreA: state?.players[0].score ?? 0,
        scoreB: state?.players[1].score ?? 0,
        chainLength: state?.stats.longestChain ?? 0,
        ranked: room.settings.ranked,
        winnerId: opponent.playerId,
      });
      for (const p of room.players) {
        sendToPlayer(p.playerId, {
          type: 'match_over',
          state,
          winnerIndex: opponent.index,
          forfeit: true,
          ranked: room.settings.ranked,
          ratings: room.players.map((pp) => ({
            index: pp.index,
            rating: store.getPlayer(pp.playerId)?.rating ?? 1000,
            delta: (store.getPlayer(pp.playerId)?.rating ?? 1000) - (before.get(pp.playerId) ?? 1000),
          })),
        });
      }
    }
  };

  const uniqueCode = (): string => {
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    do {
      code = Array.from({ length: 5 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('');
    } while (rooms.has(code));
    return code;
  };

  const addPlayerToRoom = (room: Room, conn: Conn): RoomPlayer => {
    const existing = room.players.find((p) => p.playerId === conn.playerId);
    if (existing) {
      existing.connected = true;
      existing.name = conn.name;
      if (existing.disconnectTimer) {
        clearTimeout(existing.disconnectTimer);
        existing.disconnectTimer = null;
      }
      conn.code = room.code;
      return existing;
    }
    const rp: RoomPlayer = {
      playerId: conn.playerId!,
      name: conn.name,
      index: room.players.length,
      connected: true,
      wantsRematch: false,
      disconnectTimer: null,
    };
    room.players.push(rp);
    conn.code = room.code;
    return rp;
  };

  const startGame = (room: Room): void => {
    const state = manager.createGame({
      mode: 'twoPlayer',
      winCondition: room.settings.winCondition,
      targetScore: room.settings.targetScore,
      startWord: room.settings.startWord,
      playerNames: room.players.map((p) => p.name),
    });
    room.gameId = state.id;
    room.status = 'playing';
    room.recorded = false;
    for (const p of room.players) p.wantsRematch = false;
    sendRoomUpdate(room);
    startTurnTimer(room);
    broadcastGame(room);
  };

  // --- message handling ---------------------------------------------------
  const handle = (conn: Conn, msg: Record<string, unknown>): void => {
    const type = msg.type;

    if (type === 'hello') {
      const name = typeof msg.name === 'string' ? msg.name : 'Spelare';
      const id = typeof msg.playerId === 'string' ? msg.playerId : undefined;
      const player = store.ensurePlayer(id, name);
      conn.playerId = player.id;
      conn.name = player.name;
      connByPlayer.set(player.id, conn);
      send(conn.ws, { type: 'hello_ok', player });
      // Reconnect into an existing room, if any.
      for (const room of rooms.values()) {
        if (room.players.some((p) => p.playerId === player.id)) {
          addPlayerToRoom(room, conn);
          sendRoomUpdate(room);
          if (room.status === 'playing' || room.status === 'finished') broadcastGame(room);
          break;
        }
      }
      return;
    }

    if (!conn.playerId) {
      err(conn.ws, 'Skicka hello först.');
      return;
    }

    switch (type) {
      case 'create_room': {
        const settings = readSettings(msg.settings);
        const room: Room = {
          code: uniqueCode(),
          hostId: conn.playerId,
          players: [],
          status: 'lobby',
          gameId: null,
          settings,
          turnTimer: null,
          turnDeadline: null,
          recorded: false,
          createdAt: Date.now(),
          lastActivity: Date.now(),
        };
        rooms.set(room.code, room);
        addPlayerToRoom(room, conn);
        send(conn.ws, { type: 'room_created', code: room.code });
        sendRoomUpdate(room);
        break;
      }
      case 'join_room': {
        const code = String(msg.code ?? '').toUpperCase().trim();
        const room = rooms.get(code);
        if (!room) return err(conn.ws, 'Ingen match med den koden.');
        const already = room.players.some((p) => p.playerId === conn.playerId);
        if (!already && room.players.length >= 2) return err(conn.ws, 'Rummet är fullt.');
        addPlayerToRoom(room, conn);
        sendRoomUpdate(room);
        if (room.status === 'playing') broadcastGame(room);
        break;
      }
      case 'quickmatch': {
        if (!quickQueue.includes(conn.playerId)) quickQueue.push(conn.playerId);
        tryQuickmatch();
        send(conn.ws, { type: 'quickmatch_waiting', size: quickQueue.length });
        break;
      }
      case 'cancel_quickmatch': {
        const i = quickQueue.indexOf(conn.playerId);
        if (i >= 0) quickQueue.splice(i, 1);
        send(conn.ws, { type: 'quickmatch_cancelled' });
        break;
      }
      case 'start': {
        const room = conn.code ? rooms.get(conn.code) : undefined;
        if (!room) return err(conn.ws, 'Du är inte i något rum.');
        if (room.hostId !== conn.playerId) return err(conn.ws, 'Bara värden kan starta.');
        if (room.players.length < 2) return err(conn.ws, 'Det behövs två spelare.');
        if (room.status === 'playing') return;
        startGame(room);
        break;
      }
      case 'move': {
        const room = conn.code ? rooms.get(conn.code) : undefined;
        if (!room || room.status !== 'playing' || !room.gameId) return err(conn.ws, 'Ingen aktiv match.');
        const state = manager.getGame(room.gameId);
        if (!state) return;
        const currentPlayerId = room.players[state.currentPlayerIndex]?.playerId;
        if (currentPlayerId !== conn.playerId) return err(conn.ws, 'Det är inte din tur.');
        // Idempotency: ignore stale/duplicate moves.
        const seq = typeof msg.seq === 'number' ? msg.seq : undefined;
        if (seq !== undefined && seq !== state.stats.turns) return;
        const word = typeof msg.word === 'string' ? msg.word : '';
        try {
          const res = manager.playTurn(room.gameId, word);
          if (!res.ok) return err(conn.ws, res.error ?? 'Ogiltigt drag.');
          afterMove(room, res.state, res.judgements);
        } catch (e) {
          if (e instanceof GameNotFoundError) return err(conn.ws, 'Matchen finns inte längre.');
          throw e;
        }
        break;
      }
      case 'rematch': {
        const room = conn.code ? rooms.get(conn.code) : undefined;
        if (!room || room.status !== 'finished') return;
        const me = room.players.find((p) => p.playerId === conn.playerId);
        if (me) me.wantsRematch = true;
        sendRoomUpdate(room);
        if (room.players.length === 2 && room.players.every((p) => p.wantsRematch)) {
          startGame(room);
        }
        break;
      }
      case 'leave': {
        leaveRoom(conn);
        send(conn.ws, { type: 'left' });
        break;
      }
      case 'ping':
        send(conn.ws, { type: 'pong' });
        break;
      default:
        err(conn.ws, `Okänt meddelande: ${String(type)}`);
    }
  };

  const tryQuickmatch = (): void => {
    while (quickQueue.length >= 2) {
      const aId = quickQueue.shift()!;
      const bId = quickQueue.shift()!;
      const aConn = connByPlayer.get(aId);
      const bConn = connByPlayer.get(bId);
      if (!aConn || !bConn || aConn.ws.readyState !== WebSocket.OPEN || bConn.ws.readyState !== WebSocket.OPEN) {
        // Requeue whichever is still connected.
        if (aConn && aConn.ws.readyState === WebSocket.OPEN) quickQueue.unshift(aId);
        if (bConn && bConn.ws.readyState === WebSocket.OPEN) quickQueue.unshift(bId);
        break;
      }
      const room: Room = {
        code: uniqueCode(),
        hostId: aId,
        players: [],
        status: 'lobby',
        gameId: null,
        settings: { winCondition: 'points', targetScore: 5, ranked: true },
        turnTimer: null,
        turnDeadline: null,
        recorded: false,
        createdAt: Date.now(),
        lastActivity: Date.now(),
      };
      rooms.set(room.code, room);
      addPlayerToRoom(room, aConn);
      addPlayerToRoom(room, bConn);
      send(aConn.ws, { type: 'matched', code: room.code });
      send(bConn.ws, { type: 'matched', code: room.code });
      startGame(room);
    }
  };

  const leaveRoom = (conn: Conn): void => {
    const code = conn.code;
    if (!code) return;
    const room = rooms.get(code);
    conn.code = null;
    if (!room) return;
    forfeitToOpponent(room, conn.playerId!);
    room.players = room.players.filter((p) => p.playerId !== conn.playerId);
    if (room.players.length === 0) {
      clearTurnTimer(room);
      rooms.delete(code);
    } else {
      room.players.forEach((p, i) => (p.index = i));
      sendRoomUpdate(room);
    }
  };

  const handleDisconnect = (conn: Conn): void => {
    conns.delete(conn.ws);
    const qi = conn.playerId ? quickQueue.indexOf(conn.playerId) : -1;
    if (qi >= 0) quickQueue.splice(qi, 1);
    if (conn.playerId && connByPlayer.get(conn.playerId) === conn) {
      connByPlayer.delete(conn.playerId);
    }
    const room = conn.code ? rooms.get(conn.code) : undefined;
    if (!room) return;
    const rp = room.players.find((p) => p.playerId === conn.playerId);
    if (!rp) return;
    rp.connected = false;
    sendRoomUpdate(room);
    // Grace period for reconnect; then forfeit an active match.
    if (room.status === 'playing') {
      rp.disconnectTimer = setTimeout(() => {
        if (!rp.connected) forfeitToOpponent(room, rp.playerId);
      }, DISCONNECT_GRACE_MS);
    }
  };

  wss.on('connection', (ws: WebSocket) => {
    const conn: Conn = { ws, playerId: null, name: 'Spelare', code: null, alive: true };
    conns.set(ws, conn);
    ws.on('message', (raw) => {
      let msg: Record<string, unknown>;
      try {
        msg = JSON.parse(raw.toString());
      } catch {
        return err(ws, 'Ogiltigt meddelande.');
      }
      try {
        handle(conn, msg);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('[ordduellen] WS handler error:', e);
        err(ws, 'Serverfel.');
      }
    });
    ws.on('pong', () => {
      conn.alive = true;
    });
    ws.on('close', () => handleDisconnect(conn));
    ws.on('error', () => handleDisconnect(conn));
  });

  // Keepalive ping + room GC.
  setInterval(() => {
    for (const conn of conns.values()) {
      if (!conn.alive) {
        conn.ws.terminate();
        continue;
      }
      conn.alive = false;
      try {
        conn.ws.ping();
      } catch {
        /* ignore */
      }
    }
    const now = Date.now();
    for (const [code, room] of rooms) {
      if (now - room.lastActivity > ROOM_TTL_MS && room.status !== 'playing') {
        clearTurnTimer(room);
        rooms.delete(code);
      }
    }
  }, 30_000).unref();

  // eslint-disable-next-line no-console
  console.log('[ordduellen] Realtime (WebSocket) redo på /ws');
}

function readSettings(raw: unknown): RoomSettings {
  const s = (raw ?? {}) as Record<string, unknown>;
  const winCondition: WinCondition = s.winCondition === 'endless' ? 'endless' : 'points';
  const targetScore = typeof s.targetScore === 'number' ? Math.min(15, Math.max(1, Math.round(s.targetScore))) : 5;
  const startWord = typeof s.startWord === 'string' && s.startWord.trim() ? s.startWord.trim() : undefined;
  const ranked = s.ranked !== false;
  return { winCondition, targetScore, startWord, ranked };
}
