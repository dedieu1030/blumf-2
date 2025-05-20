import React from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { InvoiceData } from "@/types/invoice";

interface InvoicePreviewProps {
  htmlContent: string;
  invoiceData: InvoiceData;
  templateId?: string;
  showDownloadButton?: boolean;
}

export function InvoicePreview({ 
  htmlContent,
  invoiceData,
  templateId = "classic", 
  showDownloadButton = false
}: InvoicePreviewProps) {
  const { toast } = useToast();

  const downloadInvoice = () => {
    const element = document.getElementById('invoice-content');
    if (!element) {
      toast({
        title: "Erreur",
        description: "Impossible de trouver le contenu de la facture",
        variant: "destructive"
      });
      return;
    }

    html2canvas(element, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps= pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`facture-${invoiceData.invoiceNumber}.pdf`);
      toast({
        title: "Facture téléchargée",
        description: "Votre facture a été téléchargée avec succès"
      });
    });
  };

  const renderPaymentMethods = () => {
    if (!invoiceData || !invoiceData.paymentMethods || invoiceData.paymentMethods.length === 0) {
      return null;
    }

    return (
      <div className="mt-4">
        <h3 className="text-sm font-medium">Méthodes de paiement acceptées:</h3>
        <ul className="list-disc pl-5">
          {invoiceData.paymentMethods.map((method, index) => (
            <li key={index} className="text-xs">
              {method.type}
              {method.details && `: ${method.details}`}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const companyInfo = invoiceData?.issuerInfo;
  if (!companyInfo) {
    return null; // or a fallback UI
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-end mb-4">
        {showDownloadButton && (
          <Button onClick={downloadInvoice} size="sm">
            <Download className="mr-2 h-4 w-4" />
            Télécharger
          </Button>
        )}
      </div>
      
      <div id="invoice-content" className="flex-1 overflow-auto">
        <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
      </div>
    </div>
  );
}
