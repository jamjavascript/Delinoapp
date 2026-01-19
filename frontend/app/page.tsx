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
      console.log('Fetching products for category:', selectedCategory);
      const data: TrendingProductsResponse = await productApi.getTrendingProducts(selectedCategory);
      console.log('Products fetched:', data);
      setProducts(data.products);
      setLastUpdated(data.last_updated);
    } catch (err: any) {
      console.error('Error fetching products:', err);
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to fetch products';
      console.error('Error details:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };


  const loadSampleData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/sample-data`, {
        method: 'POST',
      });
      if (response.ok) {
        await fetchProducts();
        await fetchCategories();
      } else {
        throw new Error('Failed to load sample data');
      }
    } catch (err: any) {
      console.error('Error loading sample data:', err);
      setError('Failed to load sample data');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Delinoapp Products
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {lastUpdated && `Last updated: ${format(new Date(lastUpdated), 'MMM d, yyyy HH:mm')}`}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category Filter */}
        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
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
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg mt-6">
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

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-gray-500 text-sm">
            Built with Next.js and FastAPI
          </p>
        </div>
      </footer>
    </div>
  );
}
