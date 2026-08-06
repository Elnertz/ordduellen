import type { Stats } from '../types';

const LABELS: Array<{ key: keyof Stats; label: string }> = [
  { key: 'power', label: 'Kraft' },
  { key: 'toughness', label: 'Tålighet' },
  { key: 'speed', label: 'Snabbhet' },
  { key: 'range', label: 'Räckvidd' },
  { key: 'intelligence', label: 'Intelligens' },
];

export function StatBars({ stats }: { stats: Stats }) {
  return (
    <div className="stat-bars" role="group" aria-label="Egenskaper">
      {LABELS.map(({ key, label }) => (
        <div key={key} className="stat-bar-row">
          <span className="stat-bar-label">{label}</span>
          <div className="stat-bar-track">
            <div
              className={`stat-bar-fill ${key}`}
              style={{ width: `${stats[key]}%` }}
              role="meter"
              aria-valuenow={stats[key]}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={label}
            />
          </div>
          <span className="stat-bar-num">{stats[key]}</span>
        </div>
      ))}
    </div>
  );
}
