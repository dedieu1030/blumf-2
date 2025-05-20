
import { PaymentTermTemplate } from "@/types/invoice";

// Mock payment terms data
const mockPaymentTerms: PaymentTermTemplate[] = [
  {
    id: "1",
    name: "À réception",
    days: 0,
    description: "Paiement à réception de la facture",
    isDefault: true,
    termsText: "Paiement à réception de la facture."
  },
  {
    id: "2",
    name: "15 jours",
    days: 15,
    description: "Paiement sous 15 jours",
    isDefault: false,
    termsText: "Paiement sous 15 jours à partir de la date de réception de la facture."
  },
  {
    id: "3",
    name: "30 jours",
    days: 30,
    description: "Paiement sous 30 jours",
    isDefault: false,
    termsText: "Paiement sous 30 jours à partir de la date de réception de la facture."
  },
  {
    id: "4",
    name: "60 jours",
    days: 60,
    description: "Paiement sous 60 jours",
    isDefault: false,
    termsText: "Paiement sous 60 jours à partir de la date de réception de la facture."
  }
];

// Function to get all payment terms templates
export const getPaymentTermsTemplates = async (): Promise<PaymentTermTemplate[]> => {
  // Mock API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockPaymentTerms);
    }, 500);
  });
};

// Function to save a payment term template
export const savePaymentTermTemplate = async (template: PaymentTermTemplate): Promise<PaymentTermTemplate> => {
  // Mock API call
  return new Promise((resolve) => {
    setTimeout(() => {
      // Generate ID if it's a new template
      const savedTemplate = {
        ...template,
        id: template.id || `new-${Date.now()}`
      };
      resolve(savedTemplate);
    }, 500);
  });
};

// Function to set a template as default
export const setDefaultTemplate = async (templateId: string): Promise<boolean> => {
  // Mock API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, 500);
  });
};

// Function to delete a payment term template
export const deletePaymentTermTemplate = async (templateId: string): Promise<boolean> => {
  // Mock API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, 500);
  });
};
