'use client';

import { DealProduct } from '@/types/product';
import DealScoreCard from './DealScoreCard';

interface TopDealsSectionProps {
  deals: DealProduct[];
}

export default function TopDealsSection({ deals }: TopDealsSectionProps) {
  if (deals.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <p className="text-gray-500 text-sm">No deals available yet</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {deals.map((deal) => (
        <DealScoreCard key={deal.product_id} deal={deal} />
      ))}
    </div>
  );
}
