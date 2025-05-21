
export interface Client {
  id: string;
  name: string;
  client_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
  reference_number?: string;
  user_id?: string;
  company_id?: string;
  group_id?: string;
  created_at: string;
  updated_at: string;
  categories?: string[];
}
