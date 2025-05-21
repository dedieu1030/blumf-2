
export interface Notification {
  id: string;
  type: 'payment_received' | 'invoice_created' | 'invoice_due_soon' | 'invoice_overdue' | 'other' | string;
  title: string;
  message: string;
  read: boolean; // Changed from is_read to read to match database
  reference_type?: string;
  reference_id?: string;
  metadata?: Record<string, any>;
  created_at: string;
  link?: string; // Added link property which exists in database
  user_id?: string; // Added user_id property which exists in database
}
