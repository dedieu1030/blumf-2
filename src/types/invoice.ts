
export interface SignatureData {
  points: Array<{x: number, y: number}>;
  width: number;
  height: number;
}

export type Status = "draft" | "pending" | "paid" | "overdue" | "cancelled";

export interface Invoice {
  id: string;
  number?: string;
  invoice_number: string;
  client_id?: string;
  client_name?: string;
  client?: { id: string; client_name: string };
  amount: string;
  date: string;
  dueDate?: string;
  status: Status;
  paymentUrl?: string;
  total_amount?: number;
  company_id?: string;
}

export interface DiscountInfo {
  type: 'percentage' | 'fixed';
  value: number;
  description?: string;
  amount?: number;
}

export interface ServiceLine {
  id: string;
  description: string;
  quantity: number; 
  unit_price: number;
  tax_rate?: number;
  total: number;
  discount?: DiscountInfo;
  tva?: string;
  totalPrice?: number;
}

export interface InvoiceData {
  id?: string;
  invoiceNumber: string;
  date?: string;
  invoiceDate?: string;
  issueDate?: string;
  dueDate?: string;
  clientId?: string;
  clientName: string;
  clientEmail?: string;
  clientAddress?: string;
  clientPhone?: string;
  items: ServiceLine[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discount?: DiscountInfo;
  total: number;
  totalAmount?: number;
  notes?: string;
  terms?: string;
  status?: Status;
  paymentMethod?: string;
  paymentDetails?: PaymentMethodDetails;
  paymentDelay?: string;
  paymentMethods?: PaymentMethodDetails[];
  templateId?: string;
  paymentTermsId?: string;
  customPaymentTerms?: string;
  introText?: string;
  conclusionText?: string;
  footerText?: string;
  signature?: SignatureData;
  signatureDate?: string;
  issuerInfo?: CompanyProfile;
  serviceLines?: ServiceLine[];
}

export type PaymentMethod = 'card' | 'transfer' | 'paypal' | 'check' | 'cash' | 'payoneer' | 'other';

export interface PaymentMethodDetails {
  method?: string;
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
  routingNumber?: string;
  iban?: string;
  swift?: string;
  paypalEmail?: string;
  cryptoAddress?: string;
  cryptoNetwork?: string;
  other?: Record<string, string>;
  type?: PaymentMethod;
  enabled?: boolean;
  details?: string;
}

export interface CompanyProfile {
  id?: string;
  name: string;
  address: string;
  email: string;
  emailType: 'personal' | 'professional' | 'company';
  phone: string;
  bankAccount: string;
  bankName: string;
  accountHolder: string;
  taxRate: number;
  termsAndConditions?: string;
  thankYouMessage?: string;
  defaultCurrency: string;
  paypal?: string;
  payoneer?: string;
  businessType?: 'company' | 'individual' | 'lawyer' | 'freelancer' | 'other';
  businessTypeCustom?: string;
  logo?: string;
}

export interface PaymentTermTemplate {
  id: string;
  name: string;
  days: number;
  delay?: string;
  description: string;
  isDefault?: boolean;
  termsText?: string;
  customDate?: string;
}

export interface Quote {
  id: string;
  quote_number: string;
  client_id: string;
  client?: {
    id: string;
    client_name: string;
  };
  template_id?: string;
  issue_date: string;
  validity_date?: string;
  execution_date?: string;
  status: string;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  notes?: string;
  customizations?: any;
  public_link?: string;
  items?: QuoteItem[];
  created_at?: string;
  updated_at?: string;
  company_id?: string;
}

export interface QuoteItem {
  id: string;
  quote_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at?: string;
}
