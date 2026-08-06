import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ApiError,
  createEntry,
  deleteEntry,
  exportUrl,
  generateEntries,
  getAdminMeta,
  getAdminStats,
  importEntries,
  searchEntries,
  updateEntry,
  validateDatabase,
} from './api';
import type { AdminMeta, AdminStats, Entry } from './types';

const PAGE_SIZE = 25;

export default function AdminPanel() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [meta, setMeta] = useState<AdminMeta | null>(null);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [tag, setTag] = useState('');
  const [items, setItems] = useState<Entry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [editing, setEditing] = useState<Entry | 'new' | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const refreshStats = useCallback(async () => {
    try {
      setStats(await getAdminStats());
    } catch {
      /* ignore */
    }
  }, []);

  const load = useCallback(async () => {
    setBusy(true);
    try {
      const res = await searchEntries({ query, category, tag, limit: PAGE_SIZE, offset: page * PAGE_SIZE });
      setItems(res.items);
      setTotal(res.total);
    } catch (err) {
      setMessage(err instanceof ApiError ? err.message : 'Kunde inte hämta poster.');
    } finally {
      setBusy(false);
    }
  }, [query, category, tag, page]);

  useEffect(() => {
    getAdminMeta().then(setMeta).catch(() => undefined);
    refreshStats();
  }, [refreshStats]);

  useEffect(() => {
    const t = setTimeout(load, 200);
    return () => clearTimeout(t);
  }, [load]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const onSaved = useCallback(async () => {
    setEditing(null);
    await Promise.all([load(), refreshStats()]);
  }, [load, refreshStats]);

  const remove = useCallback(
    async (entry: Entry) => {
      if (!confirm(`Ta bort "${entry.name}"?`)) return;
      try {
        await deleteEntry(entry.id);
        setMessage(`Tog bort ${entry.name}.`);
        await Promise.all([load(), refreshStats()]);
      } catch (err) {
        setMessage(err instanceof ApiError ? err.message : 'Kunde inte ta bort.');
      }
    },
    [load, refreshStats],
  );

  const onImport = useCallback(
    async (file: File) => {
      try {
        const text = await file.text();
        const parsed = JSON.parse(text);
        const entries: Entry[] = Array.isArray(parsed) ? parsed : parsed.entries;
        if (!Array.isArray(entries)) throw new Error('Ogiltigt format');
        const res = await importEntries(entries);
        setMessage(`Importerade ${res.imported} poster. Totalt: ${res.total}.`);
        await Promise.all([load(), refreshStats()]);
      } catch (err) {
        setMessage(err instanceof Error ? `Import misslyckades: ${err.message}` : 'Import misslyckades.');
      }
    },
    [load, refreshStats],
  );

  const generate = useCallback(async () => {
    const count = Number(prompt('Hur många nya poster ska genereras?', '200'));
    if (!count || count < 1) return;
    setBusy(true);
    try {
      const res = await generateEntries(count);
      setMessage(`Genererade ${res.generated} nya poster (t.ex. ${res.sample.slice(0, 4).join(', ')}). Totalt: ${res.total}.`);
      await Promise.all([load(), refreshStats()]);
    } catch (err) {
      setMessage(err instanceof ApiError ? err.message : 'Generering misslyckades.');
    } finally {
      setBusy(false);
    }
  }, [load, refreshStats]);

  const validate = useCallback(async () => {
    try {
      const res = await validateDatabase();
      setMessage(res.ok ? `Validering OK — ${res.checked} poster utan fel.` : `${res.issues.length} problem hittades: ${res.issues.slice(0, 3).join('; ')}`);
    } catch {
      setMessage('Validering misslyckades.');
    }
  }, []);

  return (
    <div className="admin">
      <section className="admin-stats">
        <StatCard label="Poster totalt" value={stats?.total ?? '…'} highlight />
        <StatCard label="Kurerade" value={stats?.curated ?? '…'} />
        <StatCard label="Genererade" value={stats?.generated ?? '…'} />
        <StatCard label="Kategorier" value={stats ? Object.keys(stats.categories).length : '…'} />
      </section>

      <section className="card admin-toolbar">
        <div className="admin-filters">
          <input
            className="text-input"
            placeholder="Sök namn…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(0);
            }}
            aria-label="Sök"
          />
          <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(0); }} aria-label="Kategori">
            <option value="">Alla kategorier</option>
            {meta?.categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
          <select value={tag} onChange={(e) => { setTag(e.target.value); setPage(0); }} aria-label="Tagg">
            <option value="">Alla taggar</option>
            {meta?.tags.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div className="admin-actions">
          <button className="btn primary" onClick={() => setEditing('new')} type="button">
            + Ny post
          </button>
          <button className="btn" onClick={generate} disabled={busy} type="button">
            Generera
          </button>
          <button className="btn" onClick={() => fileRef.current?.click()} type="button">
            Importera
          </button>
          <a className="btn" href={exportUrl} download>
            Exportera
          </a>
          <button className="btn ghost" onClick={validate} type="button">
            Validera
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            style={{ display: 'none' }}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onImport(f);
              e.target.value = '';
            }}
          />
        </div>
      </section>

      {message && (
        <div className="admin-message" role="status">
          {message}
          <button className="dismiss" onClick={() => setMessage(null)} aria-label="Stäng">
            ×
          </button>
        </div>
      )}

      <section className="card admin-table-card">
        <div className="admin-table-head">
          <span>{total} poster matchar</span>
          <div className="pager">
            <button className="btn small" disabled={page === 0} onClick={() => setPage((p) => Math.max(0, p - 1))} type="button">
              ‹
            </button>
            <span>
              {page + 1} / {totalPages}
            </span>
            <button className="btn small" disabled={page + 1 >= totalPages} onClick={() => setPage((p) => p + 1)} type="button">
              ›
            </button>
          </div>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Namn</th>
                <th>Kategori</th>
                <th className="num">Skala</th>
                <th className="num">Kraft</th>
                <th>Taggar</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((e) => (
                <tr key={e.id}>
                  <td>
                    <strong>{e.name}</strong>
                    {!e.curated && <span className="gen-badge">gen</span>}
                  </td>
                  <td>{e.categories.join(', ')}</td>
                  <td className="num">{e.scale}</td>
                  <td className="num">{e.power}</td>
                  <td className="tags-cell">{e.tags.slice(0, 4).join(', ')}</td>
                  <td className="row-actions">
                    <button className="btn small" onClick={() => setEditing(e)} type="button">
                      Redigera
                    </button>
                    <button className="btn small danger" onClick={() => remove(e)} type="button">
                      Ta bort
                    </button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && !busy && (
                <tr>
                  <td colSpan={6} className="empty">
                    Inga poster matchar filtret.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {editing && meta && (
        <EntryEditor
          entry={editing === 'new' ? null : editing}
          meta={meta}
          onClose={() => setEditing(null)}
          onSaved={onSaved}
        />
      )}
    </div>
  );
}

function StatCard({ label, value, highlight }: { label: string; value: number | string; highlight?: boolean }) {
  return (
    <div className={`admin-stat ${highlight ? 'highlight' : ''}`}>
      <span className="admin-stat-value">{value}</span>
      <span className="admin-stat-label">{label}</span>
    </div>
  );
}

function EntryEditor({
  entry,
  meta,
  onClose,
  onSaved,
}: {
  entry: Entry | null;
  meta: AdminMeta;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState(() => ({
    name: entry?.name ?? '',
    aliases: (entry?.aliases ?? []).join(', '),
    categories: (entry?.categories ?? ['concepts']).join(', '),
    tags: (entry?.tags ?? []).join(', '),
    description: entry?.description ?? '',
    power: entry?.power ?? 50,
    speed: entry?.speed ?? 50,
    range: entry?.range ?? 50,
    intelligence: entry?.intelligence ?? 50,
    scale: entry?.scale ?? 50,
  }));
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const list = (s: string) => s.split(',').map((x) => x.trim()).filter(Boolean);

  const knownTags = useMemo(() => new Set(meta.tags.map((t) => t.id)), [meta]);
  const unknownTags = list(form.tags).filter((t) => !knownTags.has(t));

  const save = useCallback(async () => {
    if (!form.name.trim()) {
      setError('Namn krävs.');
      return;
    }
    setSaving(true);
    setError(null);
    const payload = {
      name: form.name.trim(),
      aliases: list(form.aliases),
      categories: list(form.categories),
      tags: list(form.tags),
      description: form.description,
      power: Number(form.power),
      speed: Number(form.speed),
      range: Number(form.range),
      intelligence: Number(form.intelligence),
      scale: Number(form.scale),
    };
    try {
      if (entry) await updateEntry(entry.id, payload);
      else await createEntry(payload);
      onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Kunde inte spara.');
    } finally {
      setSaving(false);
    }
  }, [form, entry, onSaved]);

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>{entry ? `Redigera: ${entry.name}` : 'Ny post'}</h3>
          <button className="dismiss" onClick={onClose} aria-label="Stäng">
            ×
          </button>
        </div>
        <div className="modal-body">
          <label className="editor-field">
            <span>Namn</span>
            <input className="text-input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </label>
          <label className="editor-field">
            <span>Alias (kommaseparerade)</span>
            <input className="text-input" value={form.aliases} onChange={(e) => setForm((f) => ({ ...f, aliases: e.target.value }))} />
          </label>
          <label className="editor-field">
            <span>Kategorier</span>
            <input className="text-input" value={form.categories} onChange={(e) => setForm((f) => ({ ...f, categories: e.target.value }))} />
          </label>
          <label className="editor-field">
            <span>Taggar</span>
            <input className="text-input" value={form.tags} onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))} />
          </label>
          {unknownTags.length > 0 && (
            <p className="editor-hint">Okända taggar (påverkar inte logiken): {unknownTags.join(', ')}</p>
          )}
          <div className="editor-stats">
            {(['power', 'speed', 'range', 'intelligence', 'scale'] as const).map((k) => (
              <label key={k} className="editor-stat">
                <span>{statLabel(k)}</span>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={form[k]}
                  onChange={(e) => setForm((f) => ({ ...f, [k]: Number(e.target.value) }))}
                />
              </label>
            ))}
          </div>
          <label className="editor-field">
            <span>Beskrivning</span>
            <textarea rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          </label>
          {error && <p className="error" role="alert">{error}</p>}
        </div>
        <div className="modal-foot">
          <button className="btn" onClick={onClose} type="button">
            Avbryt
          </button>
          <button className="btn primary" onClick={save} disabled={saving} type="button">
            {saving ? 'Sparar…' : 'Spara'}
          </button>
        </div>
      </div>
    </div>
  );
}

function statLabel(k: string): string {
  return { power: 'Kraft', speed: 'Snabbhet', range: 'Räckvidd', intelligence: 'Intelligens', scale: 'Skala' }[k] ?? k;
}
