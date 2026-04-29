import { useEffect, useRef } from 'react';
import type { WasteResult } from '../../types.js';
import './WasteBreakdown.css';

interface Props {
  results: WasteResult[];
}

function barColor(pattern: string): string {
  if (pattern === 'verbose_spec_style') return 'var(--danger)';
  if (pattern === 'redundant_context') return 'var(--warning)';
  if (pattern === 'repeated_instructions') return 'var(--accent)';
  return 'var(--text-muted)';
}

export function WasteBreakdown({ results }: Props) {
  const barRefs = useRef<(HTMLDivElement | null)[]>([]);
  const max = Math.max(...results.map((r) => r.tokensSaved), 1);

  useEffect(() => {
    barRefs.current.forEach((el, i) => {
      if (!el) return;
      const target = (results[i]?.tokensSaved ?? 0) / max * 100;
      el.style.width = '0%';
      const raf = requestAnimationFrame(() => {
        el.style.transition = `width ${600 + i * 100}ms cubic-bezier(0.4, 0, 0.2, 1)`;
        el.style.width = `${target}%`;
      });
      return () => cancelAnimationFrame(raf);
    });
  }, [results, max]);

  return (
    <div className="waste-breakdown">
      <div className="waste-breakdown__title">Waste Breakdown</div>
      {results.length === 0 && (
        <div className="waste-breakdown__empty">No waste detected</div>
      )}
      {results.map((r, i) => (
        <div key={r.pattern} className="waste-breakdown__row">
          <div className="waste-breakdown__label">{r.pattern.replace(/_/g, ' ')}</div>
          <div className="waste-breakdown__track">
            <div
              ref={(el) => { barRefs.current[i] = el; }}
              className="waste-breakdown__bar"
              style={{ background: barColor(r.pattern) }}
            />
          </div>
          <div className="waste-breakdown__tokens">{r.tokensSaved}t</div>
        </div>
      ))}
    </div>
  );
}
