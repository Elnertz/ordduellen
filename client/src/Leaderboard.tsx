import { useCallback, useEffect, useState } from 'react';
import { getLeaderboard } from './api';
import type { LeaderboardRow } from './types';

function myId(): string | undefined {
  try {
    const raw = localStorage.getItem('ordduellen_player');
    return raw ? (JSON.parse(raw) as { id?: string }).id : undefined;
  } catch {
    return undefined;
  }
}

export default function Leaderboard() {
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [me, setMe] = useState<LeaderboardRow | null>(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const meId = myId();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getLeaderboard(meId, 50, 0);
      setRows(res.rows);
      setMe(res.me);
      setTotal(res.total);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [meId]);

  useEffect(() => {
    load();
  }, [load]);

  const inTop = me && rows.some((r) => r.id === me.id);

  return (
    <div className="board">
      <section className="card">
        <div className="admin-table-head">
          <span>Topplista · {total} spelare</span>
          <button className="btn small" type="button" onClick={load}>
            Uppdatera
          </button>
        </div>
        {loading && <p className="prompt">Laddar…</p>}
        {!loading && rows.length === 0 && (
          <p className="empty">Inga rankade matcher spelade ännu. Spela en match online för att hamna på listan!</p>
        )}
        {rows.length > 0 && (
          <div className="admin-table-wrap">
            <table className="admin-table leaderboard-table">
              <thead>
                <tr>
                  <th className="num">#</th>
                  <th>Spelare</th>
                  <th className="num">Rating</th>
                  <th className="num">V</th>
                  <th className="num">F</th>
                  <th className="num">O</th>
                  <th className="num">Längsta kedja</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className={r.id === meId ? 'me-row' : ''}>
                    <td className="num rank">{medal(r.rank)}</td>
                    <td>
                      <strong>{r.name}</strong>
                      {r.id === meId && <span className="you-badge">Du</span>}
                    </td>
                    <td className="num rating-cell">{r.rating}</td>
                    <td className="num">{r.wins}</td>
                    <td className="num">{r.losses}</td>
                    <td className="num">{r.draws}</td>
                    <td className="num">{r.longestChain}</td>
                  </tr>
                ))}
                {me && !inTop && (
                  <tr className="me-row separated">
                    <td className="num rank">{me.rank ?? '—'}</td>
                    <td>
                      <strong>{me.name}</strong>
                      <span className="you-badge">Du</span>
                    </td>
                    <td className="num rating-cell">{me.rating}</td>
                    <td className="num">{me.wins}</td>
                    <td className="num">{me.losses}</td>
                    <td className="num">{me.draws}</td>
                    <td className="num">{me.longestChain}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function medal(rank: number): string {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return String(rank);
}
