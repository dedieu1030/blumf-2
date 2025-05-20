
export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  updated_at: string;
  language?: string;
  timezone?: string;
  notification_settings?: {
    email_notifications: boolean;
    push_notifications: boolean;
  };
}

export interface Client {
  id: string;
  client_name: string;
  name?: string; // Compatibility with components that expect name
  email?: string;
  address?: string;
  phone?: string;
  company_id?: string;
  notes?: string;
}
