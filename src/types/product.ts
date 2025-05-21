
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number; // Toujours un number
  category_id?: string;
  category?: string;
  sku?: string;
  tax_rate?: number;
  created_at?: string;
  updated_at?: string;
  active?: boolean;
}
