import { SignatureData } from "./invoice";

// This is a stub file to maintain compatibility with existing code
// All quote functionality has been removed but we keep the types to prevent errors

export interface Quote {
  id: string;
  quote_number: string;
  client_id?: string;
  client?: {
    client_name: string;
  };
  issue_date: string;
  total_amount: number;
  status: QuoteStatus;
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

export interface QuoteSignature {
  id: string;
  quote_id: string;
  signed_at: string;
  signed_name: string;
  signature_data: SignatureData | null;
}
