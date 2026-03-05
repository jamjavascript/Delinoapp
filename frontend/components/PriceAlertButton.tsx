'use client';

import { useState } from 'react';
import { alertsApi } from '@/lib/api';

interface PriceAlertButtonProps {
  productId: number;
  currentPrice?: number;
}

export default function PriceAlertButton({ productId, currentPrice }: PriceAlertButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [targetPrice, setTargetPrice] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    const price = parseFloat(targetPrice);
    if (!price || price <= 0) {
      setError('Enter a valid price');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      await alertsApi.create(productId, price, 'below');
      setSuccess(true);
      setTimeout(() => {
        setIsOpen(false);
        setSuccess(false);
        setTargetPrice('');
      }, 1500);
    } catch {
      setError('Failed to create alert');
    } finally {
      setIsLoading(false);
    }
  };

  const setQuickPrice = (pct: number) => {
    if (currentPrice) {
      setTargetPrice((currentPrice * (1 - pct / 100)).toFixed(2));
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 border border-yellow-400 text-yellow-700 rounded-lg text-sm font-medium hover:bg-yellow-50 transition-colors"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        Set Price Alert
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50">
          {success ? (
            <div className="text-center py-2">
              <p className="text-green-600 font-medium">Alert created!</p>
            </div>
          ) : (
            <>
              <p className="text-sm font-medium text-gray-700 mb-2">Alert me when price drops to:</p>
              {currentPrice && (
                <p className="text-xs text-gray-500 mb-3">Current price: ${currentPrice.toFixed(2)}</p>
              )}

              <div className="flex gap-2 mb-3">
                <button onClick={() => setQuickPrice(10)} className="px-2 py-1 text-xs bg-gray-100 rounded hover:bg-gray-200">10% off</button>
                <button onClick={() => setQuickPrice(20)} className="px-2 py-1 text-xs bg-gray-100 rounded hover:bg-gray-200">20% off</button>
                <button onClick={() => setQuickPrice(30)} className="px-2 py-1 text-xs bg-gray-100 rounded hover:bg-gray-200">30% off</button>
              </div>

              <div className="flex gap-2">
                <input
                  type="number"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                  placeholder="Target price"
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  min="0"
                  step="0.01"
                />
                <button
                  onClick={handleCreate}
                  disabled={isLoading}
                  className="px-4 py-2 bg-yellow-500 text-white rounded-lg text-sm font-medium hover:bg-yellow-600 disabled:opacity-50"
                >
                  {isLoading ? '...' : 'Set'}
                </button>
              </div>
              {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
            </>
          )}
        </div>
      )}
    </div>
  );
}
