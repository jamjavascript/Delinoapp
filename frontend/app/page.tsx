'use client';

import { useEffect, useState } from 'react';
import { productApi } from '@/lib/api';
import { Product, Category, TrendingProductsResponse } from '@/types/product';
import ProductGrid from '@/components/ProductGrid';
import CategoryFilter from '@/components/CategoryFilter';
import { format } from 'date-fns';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory]);

  const fetchCategories = async () => {
    try {
      const data = await productApi.getCategories();
      setCategories(data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchProducts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data: TrendingProductsResponse = await productApi.getTrendingProducts(selectedCategory);
      setProducts(data.products);
      setLastUpdated(data.last_updated);
    } catch (err: any) {
      console.error('Error fetching products:', err);
      const errorMessage = err.message || 'Failed to fetch products';
      console.error('Error details:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshProducts = async () => {
    setIsRefreshing(true);
    setError(null);
    try {
      await productApi.refreshProducts();
      await fetchProducts();
      await fetchCategories();
    } catch (err: any) {
      console.error('Error refreshing products:', err);
      setError(err.message || 'Failed to refresh products');
    } finally {
      setIsRefreshing(false);
    }
  };

  const loadSampleData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await productApi.loadSampleData();
      await fetchProducts();
      await fetchCategories();
    } catch (err: any) {
      console.error('Error loading sample data:', err);
      setError('Failed to load sample data');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl border shadow-sm p-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Delinoapp Products</h1>
          <p className="text-sm text-gray-500 mt-1">
            {lastUpdated && `Last updated: ${format(new Date(lastUpdated), 'MMM d, yyyy HH:mm')}`}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={refreshProducts}
            disabled={isRefreshing}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            {isRefreshing ? 'Refreshing...' : 'Refresh Products'}
          </button>
          <button
            onClick={loadSampleData}
            className="bg-white border border-gray-200 hover:border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium"
          >
            Load Sample Data
          </button>
        </div>
      </div>

      <main className="space-y-6">
        {/* Category Filter */}
        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <p className="font-medium">Error</p>
            <p className="text-sm">{error}</p>
            <p className="text-xs mt-2">
              Make sure the backend server is running.
            </p>
          </div>
        )}

        {/* Product Grid */}
        <ProductGrid products={products} isLoading={isLoading} />

        {/* Info Message */}
        {!isLoading && products.length === 0 && !error && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg">
            <p className="font-medium">No data available</p>
            <p className="text-sm mb-3">
              No products found. Load sample data to get started.
            </p>
            <button
              onClick={loadSampleData}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
            >
              Load Sample Data
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
