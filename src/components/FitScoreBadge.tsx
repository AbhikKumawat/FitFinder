import React from 'react';
import { cn } from '../lib/utils';

interface FitScoreBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export const FitScoreBadge: React.FC<FitScoreBadgeProps> = ({
  score,
  size = 'md',
  showLabel = true,
  className,
}) => {
  const getColor = (s: number) => {
    if (s >= 90) return { ring: '#8BC58D', text: '#8BC58D', bg: 'rgba(139,197,141,0.15)' };
    if (s >= 75) return { ring: '#FFD67E', text: '#FFD67E', bg: 'rgba(255,214,126,0.15)' };
    return { ring: '#F49BC1', text: '#F49BC1', bg: 'rgba(244,155,193,0.15)' };
  };

  const colors = getColor(score);
  // circumference/offset computed per size below

  const sizeMap = {
    sm: { container: 'w-14 h-14', text: 'text-xs', label: 'text-[9px]', svgSize: 56, r: 20, cx: 28, cy: 28 },
    md: { container: 'w-20 h-20', text: 'text-sm', label: 'text-[10px]', svgSize: 80, r: 28, cx: 40, cy: 40 },
    lg: { container: 'w-24 h-24', text: 'text-base', label: 'text-xs', svgSize: 96, r: 36, cx: 48, cy: 48 },
  };

  const s = sizeMap[size];
  const circum = 2 * Math.PI * s.r;
  const off = circum - (score / 100) * circum;

  return (
    <div className={cn('flex flex-col items-center gap-1', className)}>
      <div className={cn('relative flex items-center justify-center', s.container)}>
        <svg
          width={s.svgSize}
          height={s.svgSize}
          className="absolute inset-0 -rotate-90"
          viewBox={`0 0 ${s.svgSize} ${s.svgSize}`}
        >
          <circle
            cx={s.cx}
            cy={s.cy}
            r={s.r}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="4"
          />
          <circle
            cx={s.cx}
            cy={s.cy}
            r={s.r}
            fill="none"
            stroke={colors.ring}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circum}
            strokeDashoffset={off}
            style={{ transition: 'stroke-dashoffset 1s ease-out' }}
          />
        </svg>
        <div className="flex flex-col items-center z-10">
          <span className={cn('font-bold leading-none', s.text)} style={{ color: colors.text }}>
            {score}%
          </span>
        </div>
      </div>
      {showLabel && (
        <span className={cn('font-semibold', s.label)} style={{ color: colors.text }}>
          Fit Match
        </span>
      )}
    </div>
  );
};
