
export interface Subscription {
  id: string;
  client_id: string;
  start_date: string;
  end_date?: string;
  next_invoice_date?: string;
  recurring_interval: 'month' | 'week' | 'day' | 'quarter' | 'semester' | 'year' | 'custom';
  recurring_interval_count: number;
  status: SubscriptionStatus;
  notes?: string;
  items: SubscriptionItem[];
  created_at: string;
  updated_at: string;
  client?: any;
}

export type SubscriptionStatus = 'active' | 'canceled' | 'expired' | 'paused';

export interface SubscriptionItem {
  id: string;
  subscription_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  description: string;
  product?: any;
}

export interface SubscriptionFormProps {
  subscription?: Subscription;
  onSuccess?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onUpdate?: () => void;
}
