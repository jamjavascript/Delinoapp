'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { favoritesApi } from '@/lib/api';
import { Product } from '@/types/product';
import ProductGrid from '@/components/ProductGrid';
import { useRouter } from 'next/navigation';

export default function FavoritesPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }
    if (isAuthenticated) {
      fetchFavorites();
    }
  }, [authLoading, isAuthenticated, router]);

  const fetchFavorites = async () => {
    setIsLoading(true);
    try {
      const data = await favoritesApi.list();
      setProducts(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load favorites');
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Favorites</h1>
        <span className="text-sm text-gray-500">{products.length} product{products.length !== 1 ? 's' : ''}</span>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
      )}

      {!isLoading && products.length === 0 && !error && (
        <div className="bg-white rounded-2xl border shadow-sm p-12 text-center">
          <svg className="h-12 w-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <p className="text-gray-500 mb-2">No favorites yet</p>
          <p className="text-sm text-gray-400">Click the heart icon on products to save them here.</p>
        </div>
      )}

      <ProductGrid products={products} isLoading={isLoading} />
    </div>
  );
}
