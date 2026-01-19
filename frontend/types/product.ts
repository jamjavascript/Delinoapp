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
