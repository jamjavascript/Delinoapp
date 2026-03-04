import type {
  Category,
  ProductWithHistory,
  PriceHistoryPoint,
  TrendingProductsResponse,
  PaginatedProductResponse,
  TokenResponse,
  User,
  PriceAlert,
  DealProduct,
  TrendingAnalyticsProduct,
  AnalyticsSummary,
  ProductAnalytics,
  AdminStats,
  Product,
} from '@/types/product';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

const buildQuery = (params: Record<string, string | number | boolean | undefined>) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.set(key, String(value));
    }
  });
  const queryString = query.toString();
  return queryString ? `?${queryString}` : '';
};

const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
};

const request = async <T>(path: string, options?: RequestInit): Promise<T> => {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string> || {}),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with ${response.status}`);
  }

  return response.json() as Promise<T>;
};

export const productApi = {
  getTrendingProducts: (category?: string, limit = 50) => {
    const query = buildQuery({ category, limit });
    return request<TrendingProductsResponse>(`/products/trending${query}`);
  },

  searchProducts: (params: {
    q?: string;
    category?: string;
    min_price?: number;
    max_price?: number;
    sort_by?: string;
    page?: number;
    limit?: number;
  }) => {
    const query = buildQuery(params);
    return request<PaginatedProductResponse>(`/products/search${query}`);
  },

  getProductById: (id: number) => {
    return request<ProductWithHistory>(`/products/${id}`);
  },

  getPriceHistory: (productId: number, limit = 100) => {
    const query = buildQuery({ limit });
    return request<PriceHistoryPoint[]>(`/products/${productId}/price-history${query}`);
  },

  getCategories: () => {
    return request<Category[]>(`/products/categories/list`);
  },

  refreshProducts: (limit = 10) => {
    const query = buildQuery({ limit });
    return request<{ status: string }>(`/products/refresh${query}`, { method: 'POST' });
  },

  loadSampleData: () => {
    return request<{ status: string }>(`/products/sample-data`, { method: 'POST' });
  },
};

export const authApi = {
  register: (email: string, password: string, full_name?: string) => {
    return request<TokenResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, full_name }),
    });
  },

  login: (email: string, password: string) => {
    return request<TokenResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  getMe: () => {
    return request<User>('/auth/me');
  },

  updateMe: (data: { full_name?: string; email?: string }) => {
    return request<User>('/auth/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};

export const alertsApi = {
  create: (product_id: number, target_price: number, alert_type = 'below') => {
    return request<PriceAlert>('/alerts', {
      method: 'POST',
      body: JSON.stringify({ product_id, target_price, alert_type }),
    });
  },

  list: () => {
    return request<PriceAlert[]>('/alerts');
  },

  getTriggered: () => {
    return request<PriceAlert[]>('/alerts/triggered');
  },

  get: (id: number) => {
    return request<PriceAlert>(`/alerts/${id}`);
  },

  update: (id: number, data: { target_price?: number; is_active?: boolean }) => {
    return request<PriceAlert>(`/alerts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  delete: (id: number) => {
    return request<void>(`/alerts/${id}`, { method: 'DELETE' });
  },
};

export const favoritesApi = {
  add: (productId: number) => {
    return request<{ message: string }>(`/favorites/${productId}`, { method: 'POST' });
  },

  remove: (productId: number) => {
    return request<void>(`/favorites/${productId}`, { method: 'DELETE' });
  },

  list: () => {
    return request<Product[]>('/favorites');
  },
};

export const analyticsApi = {
  getProductAnalytics: (productId: number) => {
    return request<ProductAnalytics>(`/analytics/product/${productId}`);
  },

  getDeals: (limit = 10) => {
    const query = buildQuery({ limit });
    return request<{ deals: DealProduct[]; total: number }>(`/analytics/deals${query}`);
  },

  getTrends: (limit = 10) => {
    const query = buildQuery({ limit });
    return request<{ trending: TrendingAnalyticsProduct[]; total: number }>(`/analytics/trends${query}`);
  },

  getSummary: () => {
    return request<AnalyticsSummary>('/analytics/summary');
  },
};

export const adminApi = {
  getStats: (apiKey: string) => {
    return request<AdminStats>('/admin/stats', {
      headers: { 'X-Admin-Key': apiKey },
    });
  },

  createProduct: (apiKey: string, data: Partial<Product>) => {
    return request<Product>('/admin/products', {
      method: 'POST',
      headers: { 'X-Admin-Key': apiKey },
      body: JSON.stringify(data),
    });
  },

  updateProduct: (apiKey: string, id: number, data: Partial<Product>) => {
    return request<Product>(`/admin/products/${id}`, {
      method: 'PUT',
      headers: { 'X-Admin-Key': apiKey },
      body: JSON.stringify(data),
    });
  },

  deleteProduct: (apiKey: string, id: number) => {
    return request<void>(`/admin/products/${id}`, {
      method: 'DELETE',
      headers: { 'X-Admin-Key': apiKey },
    });
  },

  createCategory: (apiKey: string, data: { name: string; description?: string }) => {
    return request<Category>('/admin/categories', {
      method: 'POST',
      headers: { 'X-Admin-Key': apiKey },
      body: JSON.stringify(data),
    });
  },

  deleteCategory: (apiKey: string, id: number) => {
    return request<void>(`/admin/categories/${id}`, {
      method: 'DELETE',
      headers: { 'X-Admin-Key': apiKey },
    });
  },

  triggerRefresh: (apiKey: string) => {
    return request<{ status: string }>('/admin/refresh', {
      method: 'POST',
      headers: { 'X-Admin-Key': apiKey },
    });
  },
};
