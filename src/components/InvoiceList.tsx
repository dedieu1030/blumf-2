import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { InvoiceStatus } from "./InvoiceStatus";
import { Download, Send, Copy, QrCode, ExternalLink, Check, Loader2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { InvoicePaymentConfirmation } from "./InvoicePaymentConfirmation";
import { InvoicePaymentConfirmDialog } from "./InvoicePaymentConfirmDialog";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";
import { InvoiceMobileCard } from "./InvoiceMobileCard";
import { Invoice } from '@/types/invoice';

export interface InvoiceListProps {
  invoices: Invoice[];
  limit?: number;
  showActions?: boolean;
  title?: string;
  showViewAll?: boolean;
  onInvoiceStatusChanged?: () => void;
}

export function InvoiceList({ 
  invoices, 
  limit,
  showActions = true,
  title,
  showViewAll = false,
  onInvoiceStatusChanged
}: InvoiceListProps) {
  const displayedInvoices = limit ? invoices.slice(0, limit) : invoices;
  const { toast } = useToast();
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingResult, setProcessingResult] = useState<{success: boolean, error?: string} | null>(null);
  
  const handleCopyLink = (paymentUrl: string) => {
    navigator.clipboard.writeText(paymentUrl);
    toast({
      title: t("linkCopied"),
      description: t("paymentLinkCopiedToClipboard")
    });
  };

  const handleConfirmPayment = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsConfirmDialogOpen(true);
  };
  
  const handlePaymentDetailsSubmitted = async (paymentDetails: any) => {
    if (!selectedInvoice) return;
    
    setIsProcessing(true);
    setIsConfirmDialogOpen(false);
    
    try {
      // Call the new Edge Function to mark invoice as paid
      const { data, error } = await supabase.functions.invoke('mark-invoice-paid', {
        body: { 
          invoiceId: selectedInvoice.id,
          paymentDetails: {
            ...paymentDetails,
            date: paymentDetails.date.toISOString()
          }
        }
      });
      
      if (error) {
        console.error("Error marking invoice as paid:", error);
        setProcessingResult({
          success: false,
          error: error.message || t("paymentConfirmError")
        });
        return;
      }
      
      setProcessingResult({
        success: true
      });
      
      // Open the payment confirmation dialog
      setIsPaymentDialogOpen(true);
    } catch (error) {
      console.error("Error calling Edge Function:", error);
      setProcessingResult({
        success: false,
        error: error instanceof Error ? error.message : t("paymentConfirmError")
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Function to close dialogs and refresh data
  const handleDialogClose = () => {
    setIsPaymentDialogOpen(false);
    setProcessingResult(null);
    
    // Only refresh data if callback is provided and payment was successful
    if (onInvoiceStatusChanged && processingResult?.success) {
      try {
        onInvoiceStatusChanged();
      } catch (error) {
        console.error("Error refreshing invoice data:", error);
        toast({
          title: t("refreshError", "Erreur de rafraîchissement"),
          description: t("errorRefreshingData", "Erreur lors du rafraîchissement des données. Veuillez réessayer."),
          variant: "destructive"
        });
      }
    }
    
    // Clean up states
    setSelectedInvoice(null);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">{title}</h2>
        {showViewAll && (
          <Button variant="link" className="text-violet">
            {t("viewAll")}
          </Button>
        )}
      </div>
      
      {/* Affichage mobile (vue par cartes) */}
      {isMobile ? (
        <div className="space-y-2 relative">
          {isProcessing && (
            <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="text-sm">{t("refreshing", "Actualisation...")}</span>
              </div>
            </div>
          )}
          
          {displayedInvoices.map((invoice) => (
            <InvoiceMobileCard 
              key={invoice.id}
              invoice={invoice}
              onCopyLink={handleCopyLink}
              onConfirmPayment={handleConfirmPayment}
            />
          ))}
          
          {displayedInvoices.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {t("noInvoicesFound", "Aucune facture trouvée")}
            </div>
          )}
        </div>
      ) : (
        // Affichage desktop (vue tableau)
        <div className="border rounded-lg overflow-hidden relative">
          {isProcessing && (
            <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="text-sm">{t("refreshing", "Actualisation...")}</span>
              </div>
            </div>
          )}
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("invoice")}</TableHead>
                <TableHead>{t("client")}</TableHead>
                <TableHead>{t("date")}</TableHead>
                <TableHead>{t("amount")}</TableHead>
                <TableHead>{t("status")}</TableHead>
                <TableHead className="text-right">{t("actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedInvoices.map((invoice) => (
                <TableRow 
                  key={invoice.id}
                  className={invoice.status === "overdue" ? "bg-amber-50" : ""}
                >
                  <TableCell className="font-medium">{invoice.number}</TableCell>
                  <TableCell>{invoice.client}</TableCell>
                  <TableCell>{invoice.date}</TableCell>
                  <TableCell>{invoice.amount}</TableCell>
                  <TableCell>
                    <InvoiceStatus status={invoice.status} />
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Download className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{t("downloadInvoice")}</p>
                        </TooltipContent>
                      </Tooltip>
                      
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Send className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{t("sendByEmail")}</p>
                        </TooltipContent>
                      </Tooltip>
                      
                      {invoice.paymentUrl && (
                        <>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => handleCopyLink(invoice.paymentUrl!)}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{t("copyPaymentLink")}</p>
                            </TooltipContent>
                          </Tooltip>
                          
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => window.open(invoice.paymentUrl, '_blank')}
                              >
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{t("openPaymentLink")}</p>
                            </TooltipContent>
                          </Tooltip>
                          
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <QrCode className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{t("showQrCode")}</p>
                            </TooltipContent>
                          </Tooltip>
                        </>
                      )}

                      {/* Bouton pour marquer la facture comme payée */}
                      {(invoice.status === "pending" || invoice.status === "overdue") && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="text-success hover:bg-success/10"
                              onClick={() => handleConfirmPayment(invoice)}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{t("markAsPaid")}</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </TooltipProvider>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      
      {/* Dialogue de confirmation préalable */}
      {selectedInvoice && (
        <InvoicePaymentConfirmDialog
          open={isConfirmDialogOpen}
          onOpenChange={setIsConfirmDialogOpen}
          invoiceId={selectedInvoice.id}
          invoiceNumber={selectedInvoice.invoice_number}
          onConfirm={handlePaymentDetailsSubmitted}
        />
      )}
      
      {/* Dialogue de confirmation de réussite du paiement */}
      {selectedInvoice && processingResult && (
        <InvoicePaymentConfirmation
          isOpen={isPaymentDialogOpen}
          onOpenChange={setIsPaymentDialogOpen}
          invoice={{
            id: selectedInvoice.id,
            invoice_number: selectedInvoice.invoice_number,
            amount: parseFloat(selectedInvoice.amount.replace(/[^\d.-]/g, ''))
          }}
          success={processingResult.success}
          error={processingResult.error}
          onConfirm={handleDialogClose}
        />
      )}
    </div>
  );
}

export default InvoiceList;
