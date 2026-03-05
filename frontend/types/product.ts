export interface Category {
  id: number;
  name: string;
  description?: string;
}

export interface Product {
  id: number;
  title: string;
  description?: string;
  current_price?: number;
  currency: string;
  image_url?: string;
  product_url?: string;
  category_id?: number;
  category?: Category;
  deal_score?: number;
  created_at: string;
  updated_at: string;
  last_scraped_at: string;
}

export interface PriceHistory {
  id: number;
  product_id: number;
  price: number;
  currency: string;
  timestamp: string;
}

export interface ProductWithHistory extends Product {
  price_history: PriceHistory[];
}

export interface TrendingProductsResponse {
  total: number;
  products: Product[];
  category?: string;
  last_updated: string;
}

export interface PriceHistoryPoint {
  price: number;
  currency: string;
  timestamp: string;
}

export interface PaginatedProductResponse {
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  results: Product[];
}

// Auth types
export interface User {
  id: number;
  email: string;
  full_name?: string;
  is_active: boolean;
  is_admin: boolean;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: User;
}

// Price Alert types
export interface PriceAlert {
  id: number;
  user_id?: number;
  product_id: number;
  target_price: number;
  alert_type: string;
  is_active: boolean;
  triggered_at?: string;
  created_at: string;
  product_title?: string;
  product_price?: number;
  product_image?: string;
}

// Analytics types
export interface ProductAnalytics {
  product_id: number;
  title: string;
  current_price?: number;
  average_price?: number;
  min_price?: number;
  max_price?: number;
  price_trend: string;
  trend_percentage: number;
  deal_score: number;
  volatility: number;
  data_points: number;
}

export interface DealProduct {
  product_id: number;
  title: string;
  current_price?: number;
  average_price?: number;
  deal_score: number;
  price_trend: string;
  trend_percentage: number;
  image_url?: string;
  category_name?: string;
}

export interface TrendingAnalyticsProduct {
  product_id: number;
  title: string;
  current_price?: number;
  previous_price?: number;
  price_drop: number;
  drop_percentage: number;
  image_url?: string;
  category_name?: string;
}

export interface CategoryStats {
  category_name: string;
  product_count: number;
  average_price: number;
}

export interface AnalyticsSummary {
  total_products: number;
  total_categories: number;
  average_deal_score: number;
  total_alerts: number;
  categories: CategoryStats[];
}

// Admin types
export interface AdminStats {
  total_products: number;
  total_categories: number;
  last_refresh?: string;
  total_alerts: number;
}
