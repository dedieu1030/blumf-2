
export interface Product {
  id: string;
  name: string;
  description?: string;
  price?: number;
  price_cents?: number;
  currency?: string;
  category_id?: string;
  is_recurring?: boolean;
  recurring_interval?: string;
  recurring_interval_count?: number;
  product_type?: string;
  tax_rate?: number;
  active?: boolean;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
}
