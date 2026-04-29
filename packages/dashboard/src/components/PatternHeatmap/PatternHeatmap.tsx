import type { Session } from '../../types.js';
import './PatternHeatmap.css';

interface Props {
  sessions: Session[];
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function interpolateColor(intensity: number): string {
  const r = Math.round(30 + intensity * (255 - 107));
  const g = Math.round(37 + intensity * (107 - 107));
  const b = Math.round(53 + intensity * (107 - 107));
  return `rgb(${Math.round(30 + intensity * (255 - 30))}, ${Math.round(37 + intensity * (107 - 37))}, ${Math.round(53 + intensity * (107 - 53))})`;
}

export function PatternHeatmap({ sessions }: Props) {
  const categories = Array.from(new Set(sessions.map((s) => s.category))).sort();

  const grid: Record<string, Record<number, number>> = {};
  for (const cat of categories) grid[cat] = {};

  for (const s of sessions) {
    const dow = new Date(s.created_at).getDay();
    const waste = (s.waste_breakdown ?? []).reduce((sum, w) => sum + w.tokensSaved, 0);
    grid[s.category] = grid[s.category] ?? {};
    grid[s.category]![dow] = (grid[s.category]![dow] ?? 0) + waste;
  }

  const allValues = categories.flatMap((cat) => DAYS.map((_, d) => grid[cat]?.[d] ?? 0));
  const maxVal = Math.max(...allValues, 1);

  if (categories.length === 0) {
    return <div className="heatmap__empty">No session data to display.</div>;
  }

  return (
    <div className="heatmap animate-in">
      <div className="heatmap__title">Tokens Wasted by Category × Day</div>
      <div className="heatmap__grid" style={{ gridTemplateColumns: `120px repeat(7, 1fr)` }}>
        <div />
        {DAYS.map((d) => <div key={d} className="heatmap__day-label">{d}</div>)}
        {categories.map((cat) => (
          <>
            <div key={`${cat}-label`} className="heatmap__cat-label">{cat}</div>
            {DAYS.map((_, d) => {
              const val = grid[cat]?.[d] ?? 0;
              const intensity = val / maxVal;
              return (
                <div
                  key={`${cat}-${d}`}
                  className="heatmap__cell"
                  style={{ background: val === 0 ? 'var(--bg-elevated)' : interpolateColor(intensity) }}
                  title={`${cat} / ${DAYS[d]}: ${val} tokens`}
                />
              );
            })}
          </>
        ))}
      </div>
    </div>
  );
}
