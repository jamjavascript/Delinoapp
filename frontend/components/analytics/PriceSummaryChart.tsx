'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CategoryStats } from '@/types/product';

interface PriceSummaryChartProps {
  categories: CategoryStats[];
}

export default function PriceSummaryChart({ categories }: PriceSummaryChartProps) {
  if (!categories || categories.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <p className="text-gray-500 text-sm">No category data available</p>
      </div>
    );
  }

  const data = categories.map((c) => ({
    name: c.category_name,
    avgPrice: parseFloat(c.average_price.toFixed(2)),
    count: c.product_count,
  }));

  return (
    <div className="bg-white rounded-lg border shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Average Price by Category</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip
            formatter={(value, name) =>
              name === 'avgPrice' ? [`$${value}`, 'Avg Price'] : [value, 'Products']
            }
          />
          <Bar dataKey="avgPrice" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
