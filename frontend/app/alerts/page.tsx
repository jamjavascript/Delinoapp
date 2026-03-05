'use client';

import { useEffect, useState } from 'react';
import { alertsApi } from '@/lib/api';
import { PriceAlert } from '@/types/product';
import Link from 'next/link';

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    setIsLoading(true);
    try {
      const data = await alertsApi.list();
      setAlerts(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load alerts');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAlert = async (id: number, isActive: boolean) => {
    try {
      await alertsApi.update(id, { is_active: !isActive });
      setAlerts((prev) =>
        prev.map((a) => (a.id === id ? { ...a, is_active: !isActive } : a))
      );
    } catch {
      // ignore
    }
  };

  const deleteAlert = async (id: number) => {
    try {
      await alertsApi.delete(id);
      setAlerts((prev) => prev.filter((a) => a.id !== id));
    } catch {
      // ignore
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Price Alerts</h1>
        <span className="text-sm text-gray-500">{alerts.length} alert{alerts.length !== 1 ? 's' : ''}</span>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
      )}

      {alerts.length === 0 ? (
        <div className="bg-white rounded-2xl border shadow-sm p-12 text-center">
          <svg className="h-12 w-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <p className="text-gray-500 mb-2">No price alerts set</p>
          <p className="text-sm text-gray-400">Visit a product page to set a price alert.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`bg-white rounded-lg border shadow-sm p-4 flex items-center gap-4 ${
                alert.triggered_at ? 'border-green-300 bg-green-50' : ''
              } ${!alert.is_active ? 'opacity-60' : ''}`}
            >
              {alert.product_image && (
                <img src={alert.product_image} alt="" className="h-14 w-14 object-contain rounded" />
              )}
              <div className="flex-1 min-w-0">
                <Link href={`/product/${alert.product_id}`} className="text-sm font-medium text-gray-900 hover:text-blue-600 line-clamp-1">
                  {alert.product_title || `Product #${alert.product_id}`}
                </Link>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-gray-500">
                    Target: <span className="font-medium">${alert.target_price.toFixed(2)}</span>
                  </span>
                  {alert.product_price && (
                    <span className="text-xs text-gray-500">
                      Current: <span className="font-medium">${alert.product_price.toFixed(2)}</span>
                    </span>
                  )}
                  {alert.triggered_at && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                      Triggered
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleAlert(alert.id, alert.is_active)}
                  className={`text-xs px-3 py-1 rounded-full font-medium ${
                    alert.is_active ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {alert.is_active ? 'Active' : 'Paused'}
                </button>
                <button
                  onClick={() => deleteAlert(alert.id)}
                  className="text-gray-400 hover:text-red-500 p-1"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
