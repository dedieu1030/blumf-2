
import { PaymentTermTemplate } from "@/types/invoice";
import { supabase } from "@/integrations/supabase/client";

export const getPaymentTermsTemplates = async (): Promise<PaymentTermTemplate[]> => {
  try {
    // Exemple de templates par défaut
    const defaultTemplates: PaymentTermTemplate[] = [
      {
        id: "immediate",
        name: "Paiement immédiat",
        days: 0,
        description: "Paiement exigible à réception de la facture",
        isDefault: true,
        termsText: "Paiement exigible à réception de la facture"
      },
      {
        id: "15days",
        name: "15 jours",
        days: 15,
        description: "Paiement exigible dans les 15 jours",
        termsText: "Paiement exigible dans les 15 jours suivant la réception de la facture"
      },
      {
        id: "30days",
        name: "30 jours",
        days: 30,
        description: "Paiement exigible dans les 30 jours",
        termsText: "Paiement exigible dans les 30 jours suivant la réception de la facture"
      },
      {
        id: "60days",
        name: "60 jours",
        days: 60,
        description: "Paiement exigible dans les 60 jours",
        termsText: "Paiement exigible dans les 60 jours suivant la réception de la facture"
      }
    ];

    return defaultTemplates;
  } catch (error) {
    console.error("Erreur lors du chargement des templates de paiement:", error);
    return [];
  }
};

export const savePaymentTermTemplate = async (template: PaymentTermTemplate): Promise<PaymentTermTemplate | null> => {
  // This is a stub function for now, since we're using default templates
  // In a real app, this would save to the database
  console.log("Saving payment term template:", template);
  return template;
};

export const setDefaultTemplate = async (templateId: string): Promise<boolean> => {
  // This is a stub function for now, since we're using default templates
  // In a real app, this would update the database
  console.log("Setting default template:", templateId);
  return true;
};
