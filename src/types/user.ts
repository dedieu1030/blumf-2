
export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  updated_at: string;
  username?: string;
  phone?: string;
  language?: string;
  timezone?: string;
  notification_settings?: NotificationSettings;
  created_at?: string;
}

export interface NotificationSettings {
  email_notifications: boolean;
  push_notifications: boolean;
  sms_notifications?: boolean;
}

export interface Client {
  id: string;
  client_name: string;
  name: string; // Adding name property explicitly
  email?: string;
  address?: string;
  phone?: string;
  company_id?: string;
  notes?: string;
}
