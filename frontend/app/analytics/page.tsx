'use client';

import { useEffect, useState } from 'react';
import { analyticsApi } from '@/lib/api';
import { DealProduct, TrendingAnalyticsProduct, AnalyticsSummary } from '@/types/product';
import TopDealsSection from '@/components/analytics/TopDealsSection';
import PriceSummaryChart from '@/components/analytics/PriceSummaryChart';
import TrendIndicator from '@/components/analytics/TrendIndicator';
import Link from 'next/link';

export default function AnalyticsPage() {
  const [deals, setDeals] = useState<DealProduct[]>([]);
  const [trending, setTrending] = useState<TrendingAnalyticsProduct[]>([]);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setIsLoading(true);
    try {
      const [dealsRes, trendsRes, summaryRes] = await Promise.allSettled([
        analyticsApi.getDeals(8),
        analyticsApi.getTrends(8),
        analyticsApi.getSummary(),
      ]);
      if (dealsRes.status === 'fulfilled') setDeals(dealsRes.value.deals);
      if (trendsRes.status === 'fulfilled') setTrending(trendsRes.value.trending);
      if (summaryRes.status === 'fulfilled') setSummary(summaryRes.value);
    } catch (err: any) {
      setError(err.message || 'Failed to load analytics');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Analytics & Insights</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
      )}

      {/* Platform Stats */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border shadow-sm p-4">
            <p className="text-sm text-gray-500">Products Tracked</p>
            <p className="text-2xl font-bold text-gray-900">{summary.total_products}</p>
          </div>
          <div className="bg-white rounded-lg border shadow-sm p-4">
            <p className="text-sm text-gray-500">Categories</p>
            <p className="text-2xl font-bold text-gray-900">{summary.total_categories}</p>
          </div>
          <div className="bg-white rounded-lg border shadow-sm p-4">
            <p className="text-sm text-gray-500">Avg Deal Score</p>
            <p className="text-2xl font-bold text-gray-900">{summary.average_deal_score.toFixed(0)}</p>
          </div>
          <div className="bg-white rounded-lg border shadow-sm p-4">
            <p className="text-sm text-gray-500">Active Alerts</p>
            <p className="text-2xl font-bold text-gray-900">{summary.total_alerts}</p>
          </div>
        </div>
      )}

      {/* Top Deals */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Deals</h2>
        <TopDealsSection deals={deals} />
      </div>

      {/* Trending (Price Drops) */}
      {trending.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Trending Price Drops</h2>
          <div className="space-y-3">
            {trending.map((item) => (
              <Link key={item.product_id} href={`/product/${item.product_id}`}>
                <div className="bg-white rounded-lg border shadow-sm p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
                  {item.image_url && (
                    <img src={item.image_url} alt="" className="h-12 w-12 object-contain rounded" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 line-clamp-1">{item.title}</p>
                    {item.category_name && (
                      <p className="text-xs text-gray-400">{item.category_name}</p>
                    )}
                  </div>
                  <div className="text-right">
                    {item.current_price != null && (
                      <p className="text-sm font-bold text-gray-900">${item.current_price.toFixed(2)}</p>
                    )}
                    {item.previous_price != null && (
                      <p className="text-xs text-gray-400 line-through">${item.previous_price.toFixed(2)}</p>
                    )}
                  </div>
                  <TrendIndicator trend="down" percentage={item.drop_percentage} size="sm" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Category Chart */}
      {summary && summary.categories.length > 0 && (
        <PriceSummaryChart categories={summary.categories} />
      )}
    </div>
  );
}
