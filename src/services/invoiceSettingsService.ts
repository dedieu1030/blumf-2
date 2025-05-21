import { PaymentMethodDetails, PaymentTermTemplate, Currency } from '@/types/invoice';

// Make currencies available for import elsewhere
export const availableCurrencies = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: '$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: '$' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'Fr' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr' },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: '$' },
  { code: 'MXN', name: 'Mexican Peso', symbol: '$' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: '$' },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: '$' },
  { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr' },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩' },
  { code: 'TRY', name: 'Turkish Lira', symbol: '₺' },
  { code: 'RUB', name: 'Russian Ruble', symbol: '₽' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
  { code: 'DKK', name: 'Danish Krone', symbol: 'kr' },
  { code: 'PLN', name: 'Polish Zloty', symbol: 'zł' },
  { code: 'TWD', name: 'Taiwan Dollar', symbol: 'NT$' },
  { code: 'THB', name: 'Thai Baht', symbol: '฿' },
  { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp' },
  { code: 'HUF', name: 'Hungarian Forint', symbol: 'Ft' },
  { code: 'CZK', name: 'Czech Koruna', symbol: 'Kč' },
  { code: 'ILS', name: 'Israeli New Shekel', symbol: '₪' },
  { code: 'PHP', name: 'Philippine Peso', symbol: '₱' },
  { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM' },
  { code: 'AED', name: 'United Arab Emirates Dirham', symbol: 'د.إ' },
  { code: 'ARS', name: 'Argentine Peso', symbol: '$' },
  { code: 'CLP', name: 'Chilean Peso', symbol: '$' },
  { code: 'COP', name: 'Colombian Peso', symbol: '$' },
  { code: 'PEN', name: 'Peruvian Sol', symbol: 'S/.' },
  { code: 'VND', name: 'Vietnamese Dong', symbol: '₫' },
  { code: 'EGP', name: 'Egyptian Pound', symbol: '£' },
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦' },
  { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh' },
  { code: 'UGX', name: 'Ugandan Shilling', symbol: 'USh' },
  { code: 'GHS', name: 'Ghanaian Cedi', symbol: 'GH₵' },
  { code: 'TZS', name: 'Tanzanian Shilling', symbol: 'TSh' },
  { code: 'XOF', name: 'West African CFA franc', symbol: 'Fr' },
];

export const getDefaultCurrencies = (): Currency[] => {
  return availableCurrencies;
};

export const getDefaultPaymentMethods = (): PaymentMethodDetails[] => {
  // First try to get from localStorage
  const savedMethods = localStorage.getItem('defaultPaymentMethods');
  if (savedMethods) {
    try {
      return JSON.parse(savedMethods);
    } catch (error) {
      console.error('Error parsing saved payment methods:', error);
    }
  }
  
  // Return the default methods if nothing is saved or there was an error
  return [
    {
      method: 'Bank Transfer',
      type: 'transfer',
      bankName: 'Nom de la banque',
      accountNumber: 'Numéro de compte',
      accountName: 'Nom du compte',
      routingNumber: 'Code guichet',
      iban: 'IBAN',
      swift: 'SWIFT',
      enabled: true,
      details: 'Veuillez effectuer le paiement par virement bancaire en utilisant les informations ci-dessus.'
    },
    {
      method: 'PayPal',
      type: 'paypal',
      paypalEmail: 'votreemail@paypal.com',
      enabled: true,
      details: 'Payez facilement et en toute sécurité avec PayPal.'
    },
    {
      method: 'Carte de crédit',
      type: 'card',
      enabled: false,
      details: 'Paiement sécurisé par carte de crédit via Stripe.'
    },
    {
      method: 'Chèque',
      type: 'check',
      enabled: false,
      details: 'Veuillez envoyer votre chèque à l\'adresse suivante : [Votre adresse].'
    },
    {
      method: 'Espèces',
      type: 'cash',
      enabled: false,
      details: 'Paiement en espèces accepté sur place.'
    },
    {
      method: 'Payoneer',
      type: 'payoneer',
      enabled: false,
      details: 'Payez facilement et en toute sécurité avec Payoneer.'
    },
    {
      method: 'Autre',
      type: 'other',
      enabled: false,
      details: 'Autre moyen de paiement.'
    }
  ];
};

// Add the function to save default payment methods
export const saveDefaultPaymentMethods = (methods: PaymentMethodDetails[]): void => {
  localStorage.setItem('defaultPaymentMethods', JSON.stringify(methods));
};

export const getDefaultPaymentTerms = (): PaymentTermTemplate[] => {
  return [
    {
      id: '1',
      name: 'Paiement immédiat',
      days: 0,
      delay: 'immediately',
      termsText: 'Paiement dû à réception de la facture.',
      isDefault: true,
      description: 'Paiement dû immédiatement'
    },
    {
      id: '2',
      name: '15 jours',
      days: 15,
      delay: '15days',
      termsText: 'Paiement dû dans les 15 jours suivant la réception de la facture.',
      isDefault: false,
      description: 'Paiement dû dans les 15 jours'
    },
    {
      id: '3',
      name: '30 jours',
      days: 30,
      delay: '30days',
      termsText: 'Paiement dû dans les 30 jours suivant la réception de la facture.',
      isDefault: false,
      description: 'Paiement dû dans les 30 jours'
    },
    {
      id: '4',
      name: '60 jours',
      days: 60,
      delay: '60days',
      termsText: 'Paiement dû dans les 60 jours suivant la réception de la facture.',
      isDefault: false,
      description: 'Paiement dû dans les 60 jours'
    },
    {
      id: '5',
      name: '90 jours',
      days: 90,
      delay: '90days',
      termsText: 'Paiement dû dans les 90 jours suivant la réception de la facture.',
      isDefault: false,
      description: 'Paiement dû dans les 90 jours'
    }
  ];
};

// Add the missing function to get payment term templates
// This will either get stored templates from localStorage or return the defaults if none exist
export const getPaymentTermTemplates = (): PaymentTermTemplate[] => {
  const savedTerms = localStorage.getItem('paymentTermTemplates');
  if (savedTerms) {
    try {
      return JSON.parse(savedTerms);
    } catch (error) {
      console.error('Error parsing saved payment terms:', error);
    }
  }
  
  // Return default payment terms if none are saved
  return getDefaultPaymentTerms();
};

// Add function to save payment term templates
export const savePaymentTermTemplates = (templates: PaymentTermTemplate[]): void => {
  localStorage.setItem('paymentTermTemplates', JSON.stringify(templates));
};

// Add necessary functions that are imported in Invoicing.tsx

export const getDefaultCurrency = (): string => {
  const savedCurrency = localStorage.getItem('defaultCurrency');
  return savedCurrency || 'EUR'; // Default to Euro if not set
};

export const saveDefaultCurrency = (currency: string): void => {
  localStorage.setItem('defaultCurrency', currency);
};

export const getDefaultPaymentTerm = (): string => {
  return localStorage.getItem('defaultPaymentTerm') || 'immediate'; 
};

export const saveDefaultPaymentTerm = (term: string, customDate?: string): void => {
  localStorage.setItem('defaultPaymentTerm', term);
  if (customDate) {
    localStorage.setItem('customDueDate', customDate);
  } else {
    localStorage.removeItem('customDueDate');
  }
};

export const getInvoiceNumberingConfig = () => {
  const storedConfig = localStorage.getItem('invoiceNumberingConfig');
  if (storedConfig) {
    return JSON.parse(storedConfig);
  }
  
  return {
    prefix: "INV",
    suffix: "",
    startNumber: 1,
    padding: 3,
    separator: "-",
    includeDate: true,
    dateFormat: "YYYY-MM-DD",
    digits: 3,
    nextNumber: 1,
    pattern: "PREFIX-YEAR-NUMBER",
    resetPeriod: "never",
    lastReset: "",
    resetAnnually: false
  };
};

export const saveInvoiceNumberingConfig = (config: any): void => {
  localStorage.setItem('invoiceNumberingConfig', JSON.stringify(config));
};
