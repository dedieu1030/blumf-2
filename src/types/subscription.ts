
export type SubscriptionStatus = 'active' | 'paused' | 'canceled' | 'expired';

export interface Subscription {
  id: string;
  name?: string;
  description?: string | null;
  client_id: string;
  client_name?: string;
  client_email?: string;
  start_date: string;
  end_date?: string | null;
  recurring_interval: 'day' | 'week' | 'month' | 'quarter' | 'semester' | 'year' | 'custom';
  recurring_interval_count: number;
  custom_days?: number | null;
  next_invoice_date: string;
  last_invoice_date?: string | null;
  status: SubscriptionStatus;
  notes?: string;
  metadata?: Record<string, any> | null;
  created_at: string;
  updated_at: string;
  items?: SubscriptionItem[];
}

export interface SubscriptionItem {
  id: string;
  subscription_id: string;
  product_id: string;
  product?: any;
  quantity: number;
  unit_price: number;
  description?: string;
  price_cents?: number;
  tax_rate?: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface SubscriptionFormProps {
  subscription?: Subscription;
  onSuccess?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onUpdate?: () => void;
}
