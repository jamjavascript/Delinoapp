'use client';

import { Suspense, useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { productApi } from '@/lib/api';
import { Product, Category, PaginatedProductResponse } from '@/types/product';
import ProductGrid from '@/components/ProductGrid';
import SearchBar from '@/components/SearchBar';
import SortDropdown from '@/components/SortDropdown';
import FilterPanel from '@/components/FilterPanel';
import Pagination from '@/components/Pagination';
import { format } from 'date-fns';

export default function Home() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}

function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [totalResults, setTotalResults] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Read state from URL params
  const query = searchParams.get('q') || '';
  const selectedCategory = searchParams.get('category') || undefined;
  const sortBy = searchParams.get('sort') || 'newest';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const minPrice = searchParams.get('min_price') ? parseFloat(searchParams.get('min_price')!) : undefined;
  const maxPrice = searchParams.get('max_price') ? parseFloat(searchParams.get('max_price')!) : undefined;

  const updateParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value === undefined || value === '') {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });
      // Reset page to 1 when filters change (unless page itself is being set)
      if (!('page' in updates)) {
        params.delete('page');
      }
      router.push(`?${params.toString()}`, { scroll: false });
    },
    [searchParams, router]
  );

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [query, selectedCategory, sortBy, page, minPrice, maxPrice]);

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
      // Use search endpoint when any filter/search is active
      const hasFilters = query || selectedCategory || minPrice !== undefined || maxPrice !== undefined || sortBy !== 'newest' || page > 1;

      if (hasFilters) {
        const data: PaginatedProductResponse = await productApi.searchProducts({
          q: query || undefined,
          category: selectedCategory,
          min_price: minPrice,
          max_price: maxPrice,
          sort_by: sortBy,
          page,
          limit: 20,
        });
        setProducts(data.results);
        setTotalResults(data.total);
        setTotalPages(data.total_pages);
      } else {
        const data = await productApi.getTrendingProducts(selectedCategory);
        setProducts(data.products);
        setTotalResults(data.total);
        setTotalPages(1);
        setLastUpdated(data.last_updated);
      }
    } catch (err: any) {
      console.error('Error fetching products:', err);
      setError(err.message || 'Failed to fetch products');
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
      setError('Failed to load sample data');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
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

      <main className="space-y-4">
        {/* Search + Sort Row */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <SearchBar
              value={query}
              onChange={(val) => updateParams({ q: val })}
              resultCount={query ? totalResults : undefined}
            />
          </div>
          <SortDropdown value={sortBy} onChange={(val) => updateParams({ sort: val })} />
        </div>

        {/* Filters */}
        <FilterPanel
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={(cat) => updateParams({ category: cat })}
          minPrice={minPrice}
          maxPrice={maxPrice}
          onPriceChange={(min, max) =>
            updateParams({
              min_price: min?.toString(),
              max_price: max?.toString(),
            })
          }
        />

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <p className="font-medium">Error</p>
            <p className="text-sm">{error}</p>
            <p className="text-xs mt-2">Make sure the backend server is running.</p>
          </div>
        )}

        {/* Product Grid */}
        <ProductGrid products={products} isLoading={isLoading} />

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            total={totalResults}
            limit={20}
            onPageChange={(p) => updateParams({ page: p.toString() })}
          />
        )}

        {/* Empty State */}
        {!isLoading && products.length === 0 && !error && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg">
            <p className="font-medium">No data available</p>
            <p className="text-sm mb-3">No products found. Load sample data to get started.</p>
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
