
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category_id?: string;
  category?: string;
  sku?: string;
  tax_rate?: number;
  created_at?: string;
  updated_at?: string;
  active?: boolean;
  // Additional fields that might be used in the application
  price_cents?: number;
  currency?: string;
  is_recurring?: boolean;
  recurring_interval?: 'day' | 'week' | 'month' | 'year';
  recurring_interval_count?: number;
  product_type?: 'product' | 'service' | null;
}
