
import { useState, useEffect } from "react";
import { InvoiceDialog } from "./InvoiceDialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { InvoiceStatus } from "./InvoiceStatus";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Pencil, Trash2, Eye, MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useWindowSize } from "@/hooks/use-window-size";
import { InvoiceMobileCard } from "./InvoiceMobileCard";
import { useNavigate } from "react-router-dom";
import { Invoice, Status } from "@/types/invoice";

interface InvoiceListProps {
  onRefresh?: () => void;
  filterStatus?: Status;
  clientId?: string;
  limit?: number;
}

export function InvoiceList({ onRefresh, filterStatus, clientId, limit }: InvoiceListProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { toast } = useToast();
  const { width } = useWindowSize();
  const navigate = useNavigate();

  useEffect(() => {
    fetchInvoices();
  }, [filterStatus, clientId, limit]);

  const fetchInvoices = async () => {
    try {
      setIsLoading(true);
      
      // Utiliser une méthode TypeScript sûre pour accéder aux tables
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          client:clients (id, client_name)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching invoices:', error);
        toast({
          title: "Error",
          description: "Failed to fetch invoices",
          variant: "destructive",
        });
        return;
      }

      // Apply filters if provided
      let filteredData = data;
      if (filterStatus) {
        filteredData = filteredData.filter(inv => inv.status === filterStatus);
      }

      if (clientId) {
        filteredData = filteredData.filter(inv => inv.client_id === clientId);
      }

      if (limit && limit > 0) {
        filteredData = filteredData.slice(0, limit);
      }

      setInvoices(filteredData as Invoice[]);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Something went wrong while fetching invoices",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (invoice: Invoice) => {
    try {
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', invoice.id);
      
      if (error) {
        console.error('Error deleting invoice:', error);
        toast({
          title: "Error",
          description: "Failed to delete invoice",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Invoice deleted successfully",
      });

      // Refresh the list
      fetchInvoices();
      if (onRefresh) onRefresh();
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      });
    }
  };

  const confirmDelete = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setDeleteDialogOpen(true);
  };

  const handleViewInvoice = (invoice: Invoice) => {
    // Navigate to invoice details page
    navigate(`/invoices/${invoice.id}`);
  };

  const handleEditInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setDialogOpen(true);
  };

  const handleDialogSuccess = () => {
    fetchInvoices();
    if (onRefresh) onRefresh();
    setDialogOpen(false);
  };

  const handleStatusChange = async (invoice: Invoice, newStatus: Status) => {
    try {
      const { error } = await supabase
        .from('invoices')
        .update({ status: newStatus })
        .eq('id', invoice.id);
      
      if (error) {
        console.error('Error updating status:', error);
        toast({
          title: "Error",
          description: "Failed to update invoice status",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Invoice status updated successfully",
      });

      // Refresh the list
      fetchInvoices();
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      });
    }
  };

  const isMobile = width < 768;

  return (
    <div>
      {isLoading ? (
        <Card className="p-8 flex justify-center">
          <p>Loading invoices...</p>
        </Card>
      ) : invoices.length === 0 ? (
        <Card className="p-8 text-center">
          <p>No invoices found.</p>
        </Card>
      ) : isMobile ? (
        <div className="space-y-4">
          {invoices.map((invoice) => (
            <InvoiceMobileCard 
              key={invoice.id} 
              invoice={invoice}
              onViewClick={() => handleViewInvoice(invoice)}
              onEditClick={() => handleEditInvoice(invoice)}
              onDeleteClick={() => confirmDelete(invoice)}
              onStatusChange={(newStatus) => handleStatusChange(invoice, newStatus)}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Numéro</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell>{invoice.invoice_number}</TableCell>
                  <TableCell>{invoice.client?.client_name || 'N/A'}</TableCell>
                  <TableCell>
                    {invoice.date ? (
                      <div>
                        <div>{new Date(invoice.date).toLocaleDateString()}</div>
                        <div className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(invoice.date), { addSuffix: true, locale: fr })}
                        </div>
                      </div>
                    ) : (
                      'N/A'
                    )}
                  </TableCell>
                  <TableCell>{invoice.amount} €</TableCell>
                  <TableCell>
                    <InvoiceStatus status={invoice.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewInvoice(invoice)}>
                          <Eye className="mr-2 h-4 w-4" /> Voir
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditInvoice(invoice)}>
                          <Pencil className="mr-2 h-4 w-4" /> Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => confirmDelete(invoice)}>
                          <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Dialog for editing invoice */}
      {selectedInvoice && (
        <InvoiceDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          invoice={{
            id: selectedInvoice.id,
            invoiceNumber: selectedInvoice.invoice_number,
            clientName: selectedInvoice.client?.client_name || '',
            items: [],
            subtotal: 0,
            taxRate: 0,
            taxAmount: 0,
            total: parseFloat(selectedInvoice.amount)
          }}
          onSuccess={handleDialogSuccess}
        />
      )}

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action ne peut pas être annulée. Cela supprimera définitivement cette facture.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={() => selectedInvoice && handleDelete(selectedInvoice)} className="bg-red-600 hover:bg-red-700">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
