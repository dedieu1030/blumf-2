export interface InvoiceNumberingConfig {
  prefix: string;
  suffix?: string;
  startNumber: number;
  padding: number;
  separator: string;
  includeDate: boolean;
  dateFormat: string;
  digits: number;
  nextNumber: number;
  pattern: string;
  resetPeriod: string;
  lastReset: string;
  resetAnnually: boolean;
}

export interface Currency {
  code: string;
  name: string;
  symbol: string;
}

export interface CompanyProfile {
  name: string;
  address: string;
  city: string;
  zipCode: string;
  country: string;
  vatNumber?: string;
  siretNumber?: string;
  email: string;
  phone: string;
  website?: string;
  logo?: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankIban?: string;
  bankSwift?: string;
  termsAndConditions?: string;
  
  // Propriétés supplémentaires utilisées dans l'application
  taxRate?: number;
  emailType?: 'personal' | 'professional' | 'company';
  defaultCurrency?: string;
  businessType?: string;
  businessTypeCustom?: string;
  accountHolder?: string;
  bankAccount?: string;
  paypal?: string;
  payoneer?: string;
  thankYouMessage?: string;
}

export interface InvoiceData {
  clientId: string;
  invoiceDate: string;
  dueDate: string;
  paymentTerm: string;
  currency: string;
  companyProfile: CompanyProfile;
  // Propriétés supplémentaires utilisées dans l'application
  invoiceNumber?: string;
  clientName?: string;
  clientEmail?: string;
  clientAddress?: string;
  clientPhone?: string;
  items?: ServiceLine[];
  subtotal?: number;
  taxRate?: number;
  taxAmount?: number;
  discount?: DiscountInfo;
  total?: number;
  notes?: string;
  terms?: string;
  paymentMethods?: PaymentMethodDetails[];
  customPaymentTerms?: string;
  introText?: string;
  conclusionText?: string;
  footerText?: string;
  issuerInfo?: CompanyProfile;
  serviceLines?: ServiceLine[];
  paymentTermsId?: string;
  status?: string;
}

export interface ReminderTrigger {
  id: string;
  daysBefore: number; // Positive: before due date, Negative: after due date (overdue)
  message: string;
  enabled: boolean;
  triggerType: 'days_before_due' | 'days_after_due' | 'days_after_previous_reminder';
  triggerValue: number;
  emailSubject: string;
  emailBody: string;
}

export interface ReminderSchedule {
  id: string;
  name: string;
  isDefault: boolean;
  triggers: ReminderTrigger[];
  enabled: boolean;
}

// Types supplémentaires utilisés dans l'application
export interface ServiceLine {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
  product_id?: string;
  product?: any;
}

export interface PaymentMethodDetails {
  type: string;
  name: string;
  details: string;
  enabled: boolean;
}

export interface PaymentTermTemplate {
  id: string;
  name: string;
  daysUntilDue: number;
  termsText: string;
  isDefault: boolean;
}

export interface DiscountInfo {
  type: 'percentage' | 'fixed';
  value: number;
  amount: number;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  client_id: string;
  issue_date: string;
  due_date: string;
  total_amount: number;
  status: Status;
  created_at: string;
  updated_at: string;
  client?: any;
}

export type Status = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';

export interface SignatureData {
  id: string;
  name: string;
  dataUrl: string;
  created_at?: string;
  user_id?: string;
}
