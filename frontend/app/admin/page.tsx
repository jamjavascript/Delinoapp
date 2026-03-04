'use client';

import { useEffect, useState } from 'react';
import { adminApi, productApi } from '@/lib/api';
import { AdminStats, Product, Category } from '@/types/product';

export default function AdminPage() {
  const [apiKey, setApiKey] = useState('');
  const [isAuthed, setIsAuthed] = useState(false);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleAuth = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await adminApi.getStats(apiKey);
      setStats(data);
      setIsAuthed(true);
      const cats = await productApi.getCategories();
      setCategories(cats);
      const prods = await productApi.getTrendingProducts(undefined, 100);
      setProducts(prods.products);
    } catch (err: any) {
      setError('Invalid API key or server error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setMessage('');
    try {
      await adminApi.triggerRefresh(apiKey);
      setMessage('Refresh triggered successfully');
      const data = await adminApi.getStats(apiKey);
      setStats(data);
    } catch {
      setMessage('Refresh failed');
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm('Delete this product?')) return;
    try {
      await adminApi.deleteProduct(apiKey, id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      setMessage('Product deleted');
    } catch {
      setMessage('Failed to delete product');
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm('Delete this category and its products?')) return;
    try {
      await adminApi.deleteCategory(apiKey, id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      setMessage('Category deleted');
    } catch {
      setMessage('Failed to delete category');
    }
  };

  if (!isAuthed) {
    return (
      <div className="max-w-md mx-auto mt-16">
        <div className="bg-white rounded-2xl border shadow-sm p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Admin Access</h1>
          <p className="text-sm text-gray-500 mb-4">Enter the admin API key to continue.</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>
          )}

          <div className="flex gap-2">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Admin API Key"
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
            />
            <button
              onClick={handleAuth}
              disabled={isLoading || !apiKey}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-6 py-2 rounded-lg text-sm font-medium"
            >
              {isLoading ? '...' : 'Enter'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <button
          onClick={handleRefresh}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          Trigger Refresh
        </button>
      </div>

      {message && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg text-sm">{message}</div>
      )}

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border shadow-sm p-4">
            <p className="text-sm text-gray-500">Products</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total_products}</p>
          </div>
          <div className="bg-white rounded-lg border shadow-sm p-4">
            <p className="text-sm text-gray-500">Categories</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total_categories}</p>
          </div>
          <div className="bg-white rounded-lg border shadow-sm p-4">
            <p className="text-sm text-gray-500">Alerts</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total_alerts}</p>
          </div>
          <div className="bg-white rounded-lg border shadow-sm p-4">
            <p className="text-sm text-gray-500">Last Refresh</p>
            <p className="text-sm font-medium text-gray-900">{stats.last_refresh || 'Never'}</p>
          </div>
        </div>
      )}

      {/* Categories */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Categories ({categories.length})</h2>
        <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-700">ID</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">Name</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">Description</th>
                <th className="text-right px-4 py-3 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {categories.map((cat) => (
                <tr key={cat.id}>
                  <td className="px-4 py-3 text-gray-500">{cat.id}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{cat.name}</td>
                  <td className="px-4 py-3 text-gray-500">{cat.description || '-'}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleDeleteCategory(cat.id)} className="text-red-500 hover:text-red-700 text-xs">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Products */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Products ({products.length})</h2>
        <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-700">ID</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-700">Title</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-700">Price</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-700">Category</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {products.map((p) => (
                  <tr key={p.id}>
                    <td className="px-4 py-3 text-gray-500">{p.id}</td>
                    <td className="px-4 py-3 font-medium text-gray-900 max-w-xs truncate">{p.title}</td>
                    <td className="px-4 py-3">{p.current_price != null ? `$${p.current_price.toFixed(2)}` : '-'}</td>
                    <td className="px-4 py-3 text-gray-500">{p.category?.name || '-'}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => handleDeleteProduct(p.id)} className="text-red-500 hover:text-red-700 text-xs">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
