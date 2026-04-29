import { useEffect, useRef } from 'react';
import type { Session } from '../../types.js';
import './SparkLine.css';

interface Props {
  sessions: Session[];
}

export function SparkLine({ sessions }: Props) {
  const pathRef = useRef<SVGPathElement>(null);
  const W = 320;
  const H = 80;
  const PAD = 8;

  const points = sessions
    .slice(-30)
    .reverse()
    .map((s, i, arr) => {
      const ratio = s.tokens_sent > 0 ? s.tokens_optimal / s.tokens_sent : 1;
      const efficiency = 1 - ratio;
      const x = PAD + (i / Math.max(arr.length - 1, 1)) * (W - PAD * 2);
      const y = H - PAD - efficiency * (H - PAD * 2);
      return { x, y };
    });

  const d = points.length < 2
    ? ''
    : points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');

  useEffect(() => {
    const el = pathRef.current;
    if (!el || !d) return;
    const len = el.getTotalLength();
    el.style.strokeDasharray = String(len);
    el.style.strokeDashoffset = String(len);
    const raf = requestAnimationFrame(() => {
      el.style.transition = 'stroke-dashoffset 1000ms ease-out';
      el.style.strokeDashoffset = '0';
    });
    return () => cancelAnimationFrame(raf);
  }, [d]);

  return (
    <div className="sparkline">
      <div className="sparkline__title">Efficiency Trend (last 30)</div>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <defs>
          <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {points.length >= 2 && (
          <>
            <path
              d={`${d} L ${points[points.length - 1]?.x ?? 0} ${H} L ${points[0]?.x ?? 0} ${H} Z`}
              fill="url(#sparkGrad)"
            />
            <path
              ref={pathRef}
              d={d}
              fill="none"
              stroke="var(--accent)"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </>
        )}
        {points.length === 0 && (
          <text x={W / 2} y={H / 2} textAnchor="middle" fill="var(--text-faint)" fontSize={12}>
            No data yet
          </text>
        )}
      </svg>
    </div>
  );
}
