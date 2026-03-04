'use client';

import Link from 'next/link';
import { DealProduct } from '@/types/product';

interface DealScoreCardProps {
  deal: DealProduct;
}

function getScoreColor(score: number): string {
  if (score >= 70) return 'bg-green-100 text-green-700 border-green-300';
  if (score >= 40) return 'bg-yellow-100 text-yellow-700 border-yellow-300';
  return 'bg-red-100 text-red-700 border-red-300';
}

function getTrendIcon(trend: string): string {
  if (trend === 'down') return '\u2193';
  if (trend === 'up') return '\u2191';
  return '\u2192';
}

function getTrendColor(trend: string): string {
  if (trend === 'down') return 'text-green-600';
  if (trend === 'up') return 'text-red-600';
  return 'text-gray-500';
}

export default function DealScoreCard({ deal }: DealScoreCardProps) {
  return (
    <Link href={`/product/${deal.product_id}`}>
      <div className="bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow p-4 h-full flex flex-col">
        {deal.image_url && (
          <div className="h-32 bg-gray-50 rounded flex items-center justify-center mb-3">
            <img src={deal.image_url} alt={deal.title} className="max-h-full max-w-full object-contain p-2" />
          </div>
        )}

        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-sm font-medium text-gray-900 line-clamp-2 flex-1">{deal.title}</h3>
          <span className={`text-xs font-bold px-2 py-1 rounded-full border whitespace-nowrap ${getScoreColor(deal.deal_score)}`}>
            {deal.deal_score}
          </span>
        </div>

        {deal.category_name && (
          <p className="text-xs text-gray-400 mb-2">{deal.category_name}</p>
        )}

        <div className="mt-auto flex items-end justify-between">
          <div>
            {deal.current_price != null && (
              <p className="text-lg font-bold text-gray-900">${deal.current_price.toFixed(2)}</p>
            )}
            {deal.average_price != null && (
              <p className="text-xs text-gray-500">Avg: ${deal.average_price.toFixed(2)}</p>
            )}
          </div>
          <span className={`text-sm font-medium ${getTrendColor(deal.price_trend)}`}>
            {getTrendIcon(deal.price_trend)} {Math.abs(deal.trend_percentage).toFixed(1)}%
          </span>
        </div>
      </div>
    </Link>
  );
}
