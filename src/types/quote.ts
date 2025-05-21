import { SignatureData } from "./invoice";

export interface Quote {
  id: string;
  quote_number: string;
  company_id: string | null;
  client_id: string | null;
  template_id: string | null;
  issue_date: string;
  validity_date: string | null;
  execution_date: string | null;
  status: QuoteStatus;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  notes: string | null;
  customizations: any | null;
  public_link: string | null;
  created_at: string;
  updated_at: string;
  client?: {
    id: string;
    client_name: string;
    email: string | null;
    address: string | null;
    phone: string | null;
  };
  company?: {
    id: string;
    company_name: string;
    email: string | null;
    address: string | null;
    phone: string | null;
    logo_url: string | null;
  };
  items?: QuoteItem[];
  signatures?: QuoteSignature[];
}

export type QuoteStatus = 
  | "draft" 
  | "sent" 
  | "viewed" 
  | "signed" 
  | "rejected" 
  | "expired" 
  | "accepted" 
  | "invoiced";

export interface QuoteItem {
  id: string;
  quote_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
}

export interface QuoteSignature {
  id: string;
  quote_id: string;
  signed_at: string;
  signed_name: string;
  signed_ip: string | null;
  user_agent: string | null;
  signature_url: string | null;
  signature_data: SignatureData | null;
  checkbox_confirmed: boolean;
  created_at: string;
}

export interface QuoteSignRequest {
  quoteId: string;
  signatureData?: SignatureData;
  signedName: string;
}
