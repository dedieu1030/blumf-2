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
}

export interface InvoiceData {
  clientId: string;
  invoiceDate: string;
  dueDate: string;
  paymentTerm: string;
  currency: string;
  companyProfile: CompanyProfile;
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
  enabled: boolean;
  isDefault: boolean;
  triggers: ReminderTrigger[];
}
