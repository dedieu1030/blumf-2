
export interface Client {
  id: string;
  client_name: string;
  name?: string; // Pour compatibilité avec d'autres composants  
  email: string;
  phone: string;
  address: string;
  notes: string;
  created_at?: string;
  updated_at?: string;
  company_id?: string;
  reference_number?: string;
}
