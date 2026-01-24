import type {
  Category,
  ProductWithHistory,
  PriceHistoryPoint,
  TrendingProductsResponse,
} from '@/types/product';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

const buildQuery = (params: Record<string, string | number | undefined>) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.set(key, String(value));
    }
  });
  const queryString = query.toString();
  return queryString ? `?${queryString}` : '';
};

const request = async <T>(path: string, options?: RequestInit): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
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
