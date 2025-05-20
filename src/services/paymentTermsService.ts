
import { PaymentTermTemplate } from "@/types/invoice";

export const savePaymentTermTemplate = (template: PaymentTermTemplate, existingTemplates: PaymentTermTemplate[]): PaymentTermTemplate[] => {
  // Check if template already exists
  const existingIndex = existingTemplates.findIndex(t => t.id === template.id);
  
  if (existingIndex >= 0) {
    // Update existing template
    const updatedTemplates = [...existingTemplates];
    updatedTemplates[existingIndex] = template;
    
    // Store in local storage
    localStorage.setItem('paymentTermsTemplates', JSON.stringify(updatedTemplates));
    
    return updatedTemplates;
  } else {
    // Add new template
    const newTemplates = [...existingTemplates, template];
    
    // Store in local storage
    localStorage.setItem('paymentTermsTemplates', JSON.stringify(newTemplates));
    
    return newTemplates;
  }
};

export const getPaymentTermsTemplates = (): PaymentTermTemplate[] => {
  const savedTerms = localStorage.getItem('paymentTermsTemplates');
  if (!savedTerms) return [];
  
  try {
    return JSON.parse(savedTerms);
  } catch (e) {
    console.error("Error parsing payment terms templates", e);
    return [];
  }
};

export const setDefaultTemplate = (templateId: string, templates: PaymentTermTemplate[]): PaymentTermTemplate[] => {
  const updatedTemplates = templates.map(t => ({
    ...t,
    isDefault: t.id === templateId
  }));
  
  localStorage.setItem('paymentTermsTemplates', JSON.stringify(updatedTemplates));
  
  return updatedTemplates;
};
