import type { Session } from '../../types.js';
import './SessionList.css';

interface Props {
  sessions: Session[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

function savingsPct(s: Session): number {
  if (s.tokens_sent === 0) return 0;
  return Math.round((1 - s.tokens_optimal / s.tokens_sent) * 100);
}

function chipColor(pct: number): string {
  if (pct >= 50) return 'chip--success';
  if (pct >= 25) return 'chip--warning';
  return 'chip--danger';
}

export function SessionList({ sessions, selectedId, onSelect }: Props) {
  return (
    <div className="session-list animate-in">
      <div className="session-list__header">Sessions</div>
      {sessions.length === 0 && (
        <div className="session-list__empty">No sessions yet. Run <code>tburn record</code>.</div>
      )}
      {sessions.map((s) => {
        const pct = savingsPct(s);
        return (
          <button
            key={s.id}
            className={`session-list__item${selectedId === s.id ? ' session-list__item--active' : ''}`}
            onClick={() => onSelect(s.id)}
          >
            <div className="session-list__item-top">
              <span className="session-list__task">{s.task}</span>
              <span className={`chip ${chipColor(pct)}`}>{pct}%</span>
            </div>
            <div className="session-list__item-meta">
              <span>{s.date}</span>
              <span className="badge">{s.category}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
