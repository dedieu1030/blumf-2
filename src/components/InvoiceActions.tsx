import React, { useState } from 'react';
import { Button } from "./ui/button";
import { Download, Send, Eye, Save, Loader2, CreditCard, ExternalLink, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generateAndDownloadInvoicePdf } from '@/services/invoiceApiClient';
import { InvoiceData } from '@/types/invoice';
import { createPaymentLink, sendInvoice } from '@/services/stripeApiClient';
import { InvoiceReminder } from './InvoiceReminder';
import { useTranslation } from "react-i18next";
import { InvoiceMarkAsPaidDialog } from './InvoiceMarkAsPaidDialog';
import { InvoicePaymentResult } from './InvoicePaymentResult';

interface InvoiceActionsProps {
  invoiceData: InvoiceData;
  templateId: string;
  stripeInvoiceId?: string;
  clientEmail?: string;
  status?: 'paid' | 'pending' | 'overdue' | 'draft';
  onPreview?: () => void;
  onSave?: () => void;
  onSend?: () => void;
  onStatusChange?: () => void;
  className?: string;
}

export function InvoiceActions({ 
  invoiceData,
  templateId,
  stripeInvoiceId,
  clientEmail,
  status = 'pending',
  onPreview, 
  onSave,
  onSend,
  onStatusChange,
  className = ""
}: InvoiceActionsProps) {
  const { toast } = useToast();
  const { t } = useTranslation();
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isCreatingPaymentLink, setIsCreatingPaymentLink] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  
  const [markAsPaidOpen, setMarkAsPaidOpen] = useState(false);
  const [paymentResultOpen, setPaymentResultOpen] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState<string | undefined>(undefined);
  
  const handleDownloadPdf = async () => {
    if (!invoiceData) {
      toast({
        title: t("error", "Erreur"),
        description: t("missingInvoiceData", "Données de facture manquantes pour générer le PDF"),
        variant: "destructive"
      });
      return;
    }

    setIsDownloading(true);
    toast({
      title: t("generatingPdf"),
      description: t("pdfPreparation", "Préparation du PDF en cours...")
    });

    try {
      const success = await generateAndDownloadInvoicePdf(
        invoiceData, 
        templateId,
        undefined  // Remplacer par le token d'authentification si nécessaire
      );

      if (success) {
        toast({
          title: t("downloadStarted", "Téléchargement démarré"),
          description: t("pdfGeneratedSuccessfully", "Votre PDF a été généré avec succès")
        });
      } else {
        toast({
          title: t("error", "Erreur"),
          description: t("cannotGeneratePdf", "Impossible de générer le PDF"),
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Erreur lors du téléchargement:", error);
      toast({
        title: t("error", "Erreur"),
        description: t("pdfGenerationError", "Une erreur s'est produite lors de la génération du PDF"),
        variant: "destructive"
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSendInvoice = async () => {
    if (!stripeInvoiceId) {
      toast({
        title: t("error", "Erreur"),
        description: t("missingStripeId", "ID de facture Stripe manquant"),
        variant: "destructive"
      });
      return;
    }

    setIsSending(true);
    toast({
      title: t("sending"),
      description: t("sendingToClient", "Envoi de la facture au client...")
    });

    try {
      const response = await sendInvoice(stripeInvoiceId);

      if (response.success) {
        toast({
          title: t("invoiceSent", "Facture envoyée"),
          description: t("invoiceSentSuccess", "La facture a été envoyée au client avec succès")
        });
        
        if (onSend) {
          onSend();
        }
      } else {
        toast({
          title: t("error", "Erreur"),
          description: response.error || t("cannotSendInvoice", "Impossible d'envoyer la facture"),
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi:", error);
      toast({
        title: t("error", "Erreur"),
        description: t("invoiceSendingError", "Une erreur s'est produite lors de l'envoi de la facture"),
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleCreatePaymentLink = async () => {
    if (!stripeInvoiceId) {
      toast({
        title: t("error", "Erreur"),
        description: t("missingStripeId", "ID de facture Stripe manquant"),
        variant: "destructive"
      });
      return;
    }

    setIsCreatingPaymentLink(true);
    toast({
      title: t("creatingPaymentLink"),
      description: t("creatingPaymentLinkDesc", "Création du lien de paiement...")
    });

    try {
      const response = await createPaymentLink(stripeInvoiceId);

      if (response.success && response.paymentUrl) {
        setPaymentUrl(response.paymentUrl);
        toast({
          title: t("linkCreated", "Lien créé"),
          description: t("paymentLinkCreatedSuccess", "Le lien de paiement a été créé avec succès")
        });
      } else {
        toast({
          title: t("error", "Erreur"),
          description: response.error || t("cannotCreatePaymentLink", "Impossible de créer le lien de paiement"),
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Erreur lors de la création du lien de paiement:", error);
      toast({
        title: t("error", "Erreur"),
        description: t("paymentLinkError", "Une erreur s'est produite lors de la création du lien de paiement"),
        variant: "destructive"
      });
    } finally {
      setIsCreatingPaymentLink(false);
    }
  };

  const openPaymentLink = () => {
    if (paymentUrl) {
      window.open(paymentUrl, '_blank');
    }
  };
  
  const handleMarkAsPaid = () => {
    setMarkAsPaidOpen(true);
  };
  
  const handlePaymentSuccess = () => {
    setPaymentSuccess(true);
    setPaymentError(undefined);
    setPaymentResultOpen(true);
    
    if (onStatusChange) {
      onStatusChange();
    }
  };
  
  return (
    <>
      <div className={`flex flex-wrap gap-2 ${className}`}>
        {onPreview && (
          <Button variant="outline" onClick={onPreview}>
            <Eye className="mr-2 h-4 w-4" />
            {t("preview", "Aperçu")}
          </Button>
        )}
        
        {onSave && (
          <Button variant="outline" onClick={onSave}>
            <Save className="mr-2 h-4 w-4" />
            {t("save", "Enregistrer")}
          </Button>
        )}
        
        <Button 
          variant="outline" 
          onClick={handleDownloadPdf}
          disabled={isDownloading}
        >
          {isDownloading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          {isDownloading ? t("generatingPdf", "Génération PDF...") : t("downloadPdf", "Télécharger PDF")}
        </Button>
        
        {stripeInvoiceId && status !== 'paid' && (
          <Button 
            variant="outline" 
            onClick={handleMarkAsPaid}
            className="bg-success/20 hover:bg-success/30 text-success border-success/30"
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            {t("markAsPaid", "Marquer comme payée")}
          </Button>
        )}
        
        {stripeInvoiceId && (
          <>
            <Button 
              variant="outline" 
              onClick={handleSendInvoice}
              disabled={isSending}
            >
              {isSending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              {isSending ? t("sending", "Envoi...") : t("sendByEmailButton", "Envoyer par email")}
            </Button>
            
            {/* Ajout du bouton de rappel */}
            <InvoiceReminder 
              invoiceId={invoiceData.invoiceNumber}
              onSuccess={onStatusChange}
            />
            
            {!paymentUrl ? (
              <Button 
                variant="outline" 
                onClick={handleCreatePaymentLink}
                disabled={isCreatingPaymentLink}
              >
                {isCreatingPaymentLink ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CreditCard className="mr-2 h-4 w-4" />
                )}
                {isCreatingPaymentLink ? t("creatingPaymentLink", "Création du lien...") : t("paymentLink", "Lien de paiement")}
              </Button>
            ) : (
              <Button 
                className="bg-violet hover:bg-violet/90" 
                onClick={openPaymentLink}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                {t("openPaymentLinkButton", "Ouvrir le lien de paiement")}
              </Button>
            )}
          </>
        )}
        
        {onSend && !stripeInvoiceId && (
          <Button className="bg-violet hover:bg-violet/90" onClick={onSend}>
            <Send className="mr-2 h-4 w-4" />
            {t("generateAndSend", "Générer et envoyer")}
          </Button>
        )}
      </div>
      
      {/* Dialogue pour marquer la facture comme payée */}
      <InvoiceMarkAsPaidDialog
        open={markAsPaidOpen}
        onOpenChange={setMarkAsPaidOpen}
        invoice={{
          id: stripeInvoiceId || invoiceData.invoiceNumber,
          invoice_number: invoiceData.invoiceNumber,
          amount: invoiceData.total
        }}
        onSuccess={handlePaymentSuccess}
      />
      
      {/* Dialogue pour afficher le résultat du paiement */}
      <InvoicePaymentResult
        success={paymentSuccess}
        error={paymentError}
        invoice={{
          id: stripeInvoiceId || invoiceData.invoiceNumber,
          invoice_number: invoiceData.invoiceNumber,
          amount: invoiceData.total
        }}
        isOpen={paymentResultOpen}
        onOpenChange={setPaymentResultOpen}
      />
    </>
  );
}

export default InvoiceActions;
