import { PatternHeatmap } from '../components/PatternHeatmap/PatternHeatmap.js';
import { SparkLine } from '../components/SparkLine/SparkLine.js';
import { WasteBreakdown } from '../components/WasteBreakdown/WasteBreakdown.js';
import { useSessionData } from '../hooks/useSessionData.js';
import type { Session, Pattern, KPIs } from '../types.js';
import './Patterns.css';

const TEMPLATE_MAP: Record<string, string> = {
  verbose_spec_style: 'templates/auth.md',
  redundant_context: 'templates/crud.md',
  repeated_instructions: 'templates/refactor.md',
  over_commented_spec: 'templates/testing.md',
};

export function Patterns() {
  const { data: sessions } = useSessionData<Session[]>('/api/sessions?limit=200');
  const { data: patterns } = useSessionData<Pattern[]>('/api/patterns');
  const { data: kpis } = useSessionData<KPIs>('/api/kpis');

  const topPattern = kpis?.topPattern;
  const templateSuggestion = topPattern ? (TEMPLATE_MAP[topPattern] ?? 'templates/crud.md') : null;

  const wasteResults = (patterns ?? []).map((p) => ({
    pattern: p.waste_type,
    tokensSaved: p.total_tokens,
    occurrences: p.occurrences,
  }));

  return (
    <div className="patterns-view animate-in">
      <div className="patterns-view__section">
        <PatternHeatmap sessions={sessions ?? []} />
      </div>

      <div className="patterns-view__section">
        <SparkLine sessions={sessions ?? []} />
      </div>

      <div className="patterns-view__section">
        <WasteBreakdown results={wasteResults.slice(0, 5)} />
      </div>

      {topPattern && (
        <div className="leak-card animate-in">
          <div className="leak-card__title">🔥 Your Biggest Leak</div>
          <div className="leak-card__pattern">{topPattern.replace(/_/g, ' ')}</div>
          <div className="leak-card__desc">
            This pattern has burned the most tokens across your sessions.
            {templateSuggestion && (
              <> Use <code>{templateSuggestion}</code> as your starting template to avoid it.</>
            )}
          </div>
          <div className="leak-card__stats">
            <div className="kv">
              <span className="kv__label">Total tokens</span>
              <span className="kv__value">{patterns?.find((p) => p.waste_type === topPattern)?.total_tokens.toLocaleString() ?? 0}</span>
            </div>
            <div className="kv">
              <span className="kv__label">Occurrences</span>
              <span className="kv__value">{patterns?.find((p) => p.waste_type === topPattern)?.occurrences ?? 0}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
