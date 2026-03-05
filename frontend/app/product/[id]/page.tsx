'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { productApi, analyticsApi } from '@/lib/api';
import { ProductWithHistory, PriceHistoryPoint, ProductAnalytics } from '@/types/product';
import PriceChart from '@/components/PriceChart';
import PriceAlertButton from '@/components/PriceAlertButton';
import FavoriteButton from '@/components/FavoriteButton';
import TrendIndicator from '@/components/analytics/TrendIndicator';
import { format } from 'date-fns';

export default function ProductDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const numericId = Number(id);

  const [product, setProduct] = useState<ProductWithHistory | null>(null);
  const [priceHistory, setPriceHistory] = useState<PriceHistoryPoint[]>([]);
  const [analytics, setAnalytics] = useState<ProductAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (Number.isNaN(numericId)) {
      setError('Invalid product ID');
      setIsLoading(false);
      return;
    }

    if (id) {
      fetchProductDetails();
      fetchPriceHistory();
      fetchAnalytics();
    }
  }, [id, numericId]);

  const fetchProductDetails = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await productApi.getProductById(numericId);
      setProduct(data);
    } catch (err: any) {
      console.error('Error fetching product:', err);
      setError(err.message || 'Failed to fetch product details');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPriceHistory = async () => {
    try {
      const data = await productApi.getPriceHistory(numericId);
      setPriceHistory(data);
    } catch (err) {
      console.error('Error fetching price history:', err);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const data = await analyticsApi.getProductAnalytics(numericId);
      setAnalytics(data);
    } catch {
      // Analytics may not be available yet
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <p className="text-red-600 text-lg font-medium">{error || 'Product not found'}</p>
          <button
            onClick={() => router.back()}
            className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <button
        onClick={() => router.back()}
        className="text-blue-500 hover:text-blue-700 flex items-center gap-2"
      >
        &larr; Back to Products
      </button>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="md:flex">
          {/* Product Image */}
          <div className="md:w-1/3 bg-gray-100 p-8 flex items-center justify-center relative">
            <div className="absolute top-4 right-4">
              <FavoriteButton productId={product.id} />
            </div>
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.title}
                className="max-w-full max-h-96 object-contain"
              />
            ) : (
              <div className="text-gray-400">No image available</div>
            )}
          </div>

          {/* Product Details */}
          <div className="md:w-2/3 p-8">
            {/* Category */}
            {product.category && (
              <span className="inline-block bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full uppercase font-semibold mb-3">
                {product.category.name}
              </span>
            )}

            {/* Title */}
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {product.title}
            </h1>

            {/* Price + Alert */}
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                {product.current_price !== undefined && product.current_price !== null ? (
                  <div className="text-4xl font-bold text-gray-900">
                    ${product.current_price.toFixed(2)}
                    <span className="text-lg text-gray-500 ml-2">{product.currency}</span>
                  </div>
                ) : (
                  <div className="text-gray-500">Price not available</div>
                )}

                {/* Analytics Inline */}
                {analytics && (
                  <div className="flex items-center gap-3 mt-2">
                    <TrendIndicator trend={analytics.price_trend} percentage={analytics.trend_percentage} size="sm" />
                    {analytics.deal_score > 0 && (
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        analytics.deal_score >= 70 ? 'bg-green-100 text-green-700' :
                        analytics.deal_score >= 40 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        Deal Score: {analytics.deal_score}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <PriceAlertButton productId={product.id} currentPrice={product.current_price} />
            </div>

            {/* Analytics Details */}
            {analytics && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 p-4 bg-gray-50 rounded-lg">
                {analytics.average_price != null && (
                  <div>
                    <p className="text-xs text-gray-500">Avg Price</p>
                    <p className="text-sm font-semibold">${analytics.average_price.toFixed(2)}</p>
                  </div>
                )}
                {analytics.min_price != null && (
                  <div>
                    <p className="text-xs text-gray-500">Lowest</p>
                    <p className="text-sm font-semibold text-green-600">${analytics.min_price.toFixed(2)}</p>
                  </div>
                )}
                {analytics.max_price != null && (
                  <div>
                    <p className="text-xs text-gray-500">Highest</p>
                    <p className="text-sm font-semibold text-red-600">${analytics.max_price.toFixed(2)}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-gray-500">Data Points</p>
                  <p className="text-sm font-semibold">{analytics.data_points}</p>
                </div>
              </div>
            )}

            {/* Description */}
            {product.description && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Description</h2>
                <p className="text-gray-700 leading-relaxed">{product.description}</p>
              </div>
            )}

            {/* Metadata */}
            <div className="grid grid-cols-2 gap-4 py-4 border-t">
              <div>
                <p className="text-sm text-gray-500">Product ID</p>
                <p className="font-medium text-gray-900">{product.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Last Updated</p>
                <p className="font-medium text-gray-900">
                  {format(new Date(product.last_scraped_at), 'MMM d, yyyy HH:mm')}
                </p>
              </div>
            </div>

            {/* Product Link */}
            {product.product_url && (
              <a
                href={product.product_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-medium mt-4 transition-colors"
              >
                View Product &rarr;
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Price History Chart */}
      <PriceChart data={priceHistory} />
    </div>
  );
}
