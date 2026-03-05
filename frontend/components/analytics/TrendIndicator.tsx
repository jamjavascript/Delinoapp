'use client';

interface TrendIndicatorProps {
  trend: string;
  percentage: number;
  size?: 'sm' | 'md';
}

export default function TrendIndicator({ trend, percentage, size = 'md' }: TrendIndicatorProps) {
  const isDown = trend === 'down';
  const isUp = trend === 'up';

  const colorClass = isDown ? 'text-green-600' : isUp ? 'text-red-600' : 'text-gray-500';
  const bgClass = isDown ? 'bg-green-50' : isUp ? 'bg-red-50' : 'bg-gray-50';
  const arrow = isDown ? '\u2193' : isUp ? '\u2191' : '\u2192';

  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1';

  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-medium ${colorClass} ${bgClass} ${sizeClass}`}>
      {arrow} {Math.abs(percentage).toFixed(1)}%
    </span>
  );
}
