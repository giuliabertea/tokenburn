import { useState } from 'react';
import { SessionList } from '../components/SessionList/SessionList.js';
import { RadialGauge } from '../components/RadialGauge/RadialGauge.js';
import { WasteBreakdown } from '../components/WasteBreakdown/WasteBreakdown.js';
import { useSessionData } from '../hooks/useSessionData.js';
import type { Session } from '../types.js';
import './Sessions.css';

function savingsPct(s: Session): number {
  if (s.tokens_sent === 0) return 0;
  return Math.max(0, Math.round((1 - s.tokens_optimal / s.tokens_sent) * 100));
}

function StarRating({ quality, sessionId, onRate }: { quality: number | null; sessionId: string; onRate: () => void }) {
  const rate = async (q: number) => {
    await fetch(`/api/sessions/${sessionId}/quality`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quality: q }),
    });
    onRate();
  };
  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map((q) => (
        <button key={q} className={`star${quality !== null && q <= quality ? ' star--active' : ''}`} onClick={() => rate(q)}>★</button>
      ))}
    </div>
  );
}

export function Sessions() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const { data: sessions, loading } = useSessionData<Session[]>(`/api/sessions?_k=${refreshKey}`);
  const selected = sessions?.find((s) => s.id === selectedId) ?? null;

  const refresh = () => setRefreshKey((k) => k + 1);

  return (
    <div className="sessions-view animate-in">
      <div className="sessions-view__list">
        {loading ? (
          <div className="loading">Loading…</div>
        ) : (
          <SessionList sessions={sessions ?? []} selectedId={selectedId} onSelect={setSelectedId} />
        )}
      </div>

      <div className="sessions-view__detail animate-in">
        {!selected ? (
          <div className="sessions-view__placeholder">Select a session to view details</div>
        ) : (
          <div className="session-detail">
            <div className="session-detail__header">
              <div>
                <div className="session-detail__task">{selected.task}</div>
                <div className="session-detail__meta">
                  <span className="badge">{selected.category}</span>
                  <span className="text-muted">{selected.date}</span>
                </div>
              </div>
              <StarRating quality={selected.quality} sessionId={selected.id} onRate={refresh} />
            </div>

            <div className="session-detail__body">
              <RadialGauge value={savingsPct(selected)} />

              <div className="session-detail__tokens">
                <div className="kv"><span className="kv__label">Tokens sent</span><span className="kv__value mono">{selected.tokens_sent.toLocaleString()}</span></div>
                <div className="kv"><span className="kv__label">Tokens optimal</span><span className="kv__value mono success">{selected.tokens_optimal.toLocaleString()}</span></div>
              </div>
            </div>

            {selected.waste_breakdown && (
              <WasteBreakdown results={selected.waste_breakdown} />
            )}

            {selected.insight && (
              <div className="insight-card">
                <div className="insight-card__icon">💡</div>
                <div className="insight-card__text">{selected.insight}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
