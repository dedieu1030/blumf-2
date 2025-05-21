
import React from "react";
import { Invoice } from "@/types/invoice";
import { useNavigate } from "react-router-dom";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { InvoiceStatus } from "./InvoiceStatus";
import { useIsMobile } from "@/hooks/use-mobile";
import { InvoiceMobileCard } from "./InvoiceMobileCard";

export interface InvoiceListProps {
  invoices: Invoice[];
  onInvoiceStatusChanged?: () => void;
  limit?: number;
  title?: string;
}

export const InvoiceList = ({ 
  invoices = [], 
  onInvoiceStatusChanged,
  limit,
  title
}: InvoiceListProps) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  // Filter invoices based on the limit if provided
  const displayInvoices = limit ? invoices.slice(0, limit) : invoices;

  const handleRowClick = (invoice: Invoice) => {
    // This will navigate to the invoice detail page
    console.log("Navigating to invoice:", invoice.id);
  };

  if (displayInvoices.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Aucune facture à afficher
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="space-y-4">
        {title && <h3 className="font-medium text-lg">{title}</h3>}
        {displayInvoices.map((invoice) => (
          <InvoiceMobileCard 
            key={invoice.id} 
            invoice={invoice} 
            onStatusChange={onInvoiceStatusChanged}
          />
        ))}
      </div>
    );
  }

  return (
    <>
      {title && <h3 className="font-medium text-lg mb-3">{title}</h3>}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Numéro</TableHead>
            <TableHead>Client</TableHead>
            <TableHead className="text-right">Montant</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Statut</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayInvoices.map((invoice) => (
            <TableRow 
              key={invoice.id} 
              className="cursor-pointer"
              onClick={() => handleRowClick(invoice)}
            >
              <TableCell className="font-medium">{invoice.invoice_number || invoice.number}</TableCell>
              <TableCell>{invoice.client_name}</TableCell>
              <TableCell className="text-right">{formatAmount(invoice.amount)} €</TableCell>
              <TableCell>
                {formatDate(invoice.date)}
              </TableCell>
              <TableCell>
                <InvoiceStatus 
                  status={invoice.status}
                  invoiceId={invoice.id}
                  onStatusChange={onInvoiceStatusChanged}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
};

const formatDate = (dateString?: string) => {
  if (!dateString) return "-";
  try {
    const date = new Date(dateString);
    return formatDistanceToNow(date, { addSuffix: true, locale: fr });
  } catch (error) {
    return dateString;
  }
};

const formatAmount = (amount?: string | number) => {
  if (amount === undefined) return "0";
  
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numAmount);
};

export default InvoiceList;
