import { Router } from 'express';
import { Database } from '../database.js';
import { generateExtra, normalizeName } from '../generator.js';
import { ALL_CATEGORIES, ALL_TAGS, CATEGORY_LABELS, TAG_LABELS } from '../taxonomy.js';
import { getReportStore, type ReportStatus } from '../reports.js';
import type { Entry } from '../types.js';

export function createAdminRouter(db: Database): Router {
  const router = Router();

  router.get('/meta', (_req, res) => {
    res.json({
      categories: ALL_CATEGORIES.map((c) => ({ id: c, label: CATEGORY_LABELS[c] })),
      tags: ALL_TAGS.map((t) => ({ id: t, label: TAG_LABELS[t] })),
    });
  });

  router.get('/stats', (_req, res) => {
    res.json({
      total: db.size,
      curated: db.curatedCount,
      generated: db.size - db.curatedCount,
      categories: db.categoryCounts(),
    });
  });

  router.get('/entries', (req, res) => {
    const query = typeof req.query.query === 'string' ? req.query.query : undefined;
    const category = typeof req.query.category === 'string' ? req.query.category : undefined;
    const tag = typeof req.query.tag === 'string' ? req.query.tag : undefined;
    const limit = req.query.limit ? Number(req.query.limit) : 50;
    const offset = req.query.offset ? Number(req.query.offset) : 0;
    const result = db.search({ query, category, tag, limit, offset });
    res.json(result);
  });

  router.get('/entries/:id', (req, res) => {
    const entry = db.getById(req.params.id);
    if (!entry) return res.status(404).json({ error: 'Posten hittades inte.' });
    return res.json(entry);
  });

  router.post('/entries', (req, res) => {
    const body = (req.body ?? {}) as Partial<Entry>;
    if (!body.name || typeof body.name !== 'string') {
      return res.status(400).json({ error: 'Namn krävs.' });
    }
    const entry = db.createEntry({ ...body, name: body.name });
    return res.status(201).json(entry);
  });

  router.put('/entries/:id', (req, res) => {
    const patch = (req.body ?? {}) as Partial<Entry>;
    delete (patch as { id?: string }).id;
    const updated = db.updateEntry(req.params.id, patch);
    if (!updated) return res.status(404).json({ error: 'Posten hittades inte.' });
    return res.json(updated);
  });

  router.delete('/entries/:id', (req, res) => {
    const ok = db.deleteEntry(req.params.id);
    if (!ok) return res.status(404).json({ error: 'Posten hittades inte.' });
    return res.json({ ok: true });
  });

  router.post('/import', (req, res) => {
    const body = (req.body ?? {}) as Record<string, unknown>;
    const list = Array.isArray(body.entries) ? (body.entries as Entry[]) : Array.isArray(body) ? (body as Entry[]) : [];
    if (list.length === 0) return res.status(400).json({ error: 'Inga poster att importera.' });
    const count = db.importEntries(list);
    return res.json({ imported: count, total: db.size });
  });

  router.get('/export', (_req, res) => {
    res.setHeader('Content-Disposition', 'attachment; filename="ordduellen-databas.json"');
    res.json({ version: 1, count: db.size, entries: db.all() });
  });

  router.post('/generate', (req, res) => {
    const body = (req.body ?? {}) as Record<string, unknown>;
    const count = Math.max(1, Math.min(2000, Number(body.count) || 100));
    const taken = new Set(db.all().map((e) => normalizeName(e.name)));
    const created = generateExtra(count, taken);
    const imported = db.importEntries(created);
    return res.json({ generated: imported, total: db.size, sample: created.slice(0, 8).map((e) => e.name) });
  });

  router.get('/validate', (_req, res) => {
    res.json(db.validate());
  });

  // Reported / disputed judgments for admin review and correction.
  router.get('/reports', (req, res) => {
    const status = req.query.status === 'open' || req.query.status === 'resolved'
      ? (req.query.status as ReportStatus)
      : undefined;
    const store = getReportStore();
    res.json({ stats: store.stats(), reports: store.list(status, 200) });
  });

  router.post('/reports/:id/resolve', (req, res) => {
    const body = (req.body ?? {}) as Record<string, unknown>;
    const resolution = typeof body.resolution === 'string' ? body.resolution : 'Åtgärdad';
    const report = getReportStore().resolve(req.params.id, resolution);
    if (!report) return res.status(404).json({ error: 'Rapporten hittades inte.' });
    return res.json({ ok: true, report });
  });

  return router;
}
