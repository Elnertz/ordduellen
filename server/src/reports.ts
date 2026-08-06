// Stores player-reported / disputed judgments so admins can review and correct
// relationships. Persisted to disk so reports survive restarts.

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = resolve(__dirname, '../../data');
const REPORTS_PATH = resolve(DATA_DIR, 'judgment-reports.json');

export type ReportStatus = 'open' | 'resolved';

export interface JudgmentReport {
  id: string;
  target: string;
  answer: string;
  verdict: 'approved' | 'rejected';
  confidence?: number;
  reason?: string;
  note?: string;
  votesAgree: number;
  votesDisagree: number;
  status: ReportStatus;
  resolution?: string;
  createdAt: number;
  updatedAt: number;
}

export interface CreateReportInput {
  target: string;
  answer: string;
  verdict: 'approved' | 'rejected';
  confidence?: number;
  reason?: string;
  note?: string;
}

export class ReportStore {
  private reports: JudgmentReport[] = [];

  constructor() {
    this.reports = load();
  }

  create(input: CreateReportInput): JudgmentReport {
    const now = Date.now();
    const report: JudgmentReport = {
      id: Math.random().toString(36).slice(2, 10),
      target: input.target.trim(),
      answer: input.answer.trim(),
      verdict: input.verdict,
      confidence: input.confidence,
      reason: input.reason,
      note: input.note?.slice(0, 500),
      votesAgree: 0,
      votesDisagree: 0,
      status: 'open',
      createdAt: now,
      updatedAt: now,
    };
    this.reports.unshift(report);
    this.persist();
    return report;
  }

  vote(id: string, agree: boolean): JudgmentReport | null {
    const report = this.reports.find((r) => r.id === id);
    if (!report) return null;
    if (agree) report.votesAgree += 1;
    else report.votesDisagree += 1;
    report.updatedAt = Date.now();
    this.persist();
    return report;
  }

  resolve(id: string, resolution: string): JudgmentReport | null {
    const report = this.reports.find((r) => r.id === id);
    if (!report) return null;
    report.status = 'resolved';
    report.resolution = resolution.slice(0, 500);
    report.updatedAt = Date.now();
    this.persist();
    return report;
  }

  list(status?: ReportStatus, limit = 100): JudgmentReport[] {
    const filtered = status ? this.reports.filter((r) => r.status === status) : this.reports;
    return filtered.slice(0, limit);
  }

  stats(): { total: number; open: number; resolved: number } {
    return {
      total: this.reports.length,
      open: this.reports.filter((r) => r.status === 'open').length,
      resolved: this.reports.filter((r) => r.status === 'resolved').length,
    };
  }

  private persist(): void {
    try {
      if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
      writeFileSync(REPORTS_PATH, JSON.stringify(this.reports.slice(0, 2000), null, 2), 'utf8');
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[ordduellen] Failed to persist reports:', err);
    }
  }
}

function load(): JudgmentReport[] {
  try {
    if (!existsSync(REPORTS_PATH)) return [];
    const parsed = JSON.parse(readFileSync(REPORTS_PATH, 'utf8'));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

let cached: ReportStore | null = null;
export function getReportStore(): ReportStore {
  if (!cached) cached = new ReportStore();
  return cached;
}
