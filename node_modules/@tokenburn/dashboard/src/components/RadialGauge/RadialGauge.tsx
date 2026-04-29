import { useEffect, useRef } from 'react';
import './RadialGauge.css';

interface Props {
  value: number;
  size?: number;
}

function getColor(value: number): string {
  if (value >= 50) return 'var(--success)';
  if (value >= 25) return 'var(--warning)';
  return 'var(--danger)';
}

export function RadialGauge({ value, size = 140 }: Props) {
  const arcRef = useRef<SVGCircleElement>(null);
  const cx = size / 2;
  const r = (size - 20) / 2;
  const circumference = 2 * Math.PI * r;
  const targetOffset = circumference * (1 - value / 100);
  const color = getColor(value);

  useEffect(() => {
    const el = arcRef.current;
    if (!el) return;
    el.style.strokeDashoffset = String(circumference);
    const raf = requestAnimationFrame(() => {
      el.style.transition = 'stroke-dashoffset 800ms cubic-bezier(0.4, 0, 0.2, 1)';
      el.style.strokeDashoffset = String(targetOffset);
    });
    return () => cancelAnimationFrame(raf);
  }, [value, circumference, targetOffset]);

  return (
    <div className="radial-gauge">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={cx}
          cy={cx}
          r={r}
          fill="none"
          stroke="var(--bg-elevated)"
          strokeWidth={10}
        />
        <circle
          ref={arcRef}
          cx={cx}
          cy={cx}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={10}
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cx})`}
        />
      </svg>
      <div className="radial-gauge__label" style={{ color }}>
        <span className="radial-gauge__value">{value}%</span>
        <span className="radial-gauge__sub">saved</span>
      </div>
    </div>
  );
}
