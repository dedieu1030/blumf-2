
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
      
      // Mock API call for now since Supabase types don't include 'invoices' table
      const mockInvoices: Invoice[] = [
        {
          id: "1",
          invoice_number: "INV-001",
          client_id: "client1",
          amount: 1200,
          date: "2023-05-01",
          status: "paid",
          client: { id: "client1", client_name: "SCI Legalis" }
        },
        {
          id: "2",
          invoice_number: "INV-002",
          client_id: "client2",
          amount: 850,
          date: "2023-05-03",
          status: "pending",
          client: { id: "client2", client_name: "Cabinet Lefort" }
        },
        {
          id: "3",
          invoice_number: "INV-003",
          client_id: "client3",
          amount: 1400,
          date: "2023-05-05",
          status: "overdue",
          client: { id: "client3", client_name: "Me. Dubois" }
        },
        {
          id: "4",
          invoice_number: "INV-004",
          client_id: "client4",
          amount: 950,
          date: "2023-05-10",
          status: "pending",
          client: { id: "client4", client_name: "Cabinet Moreau" }
        },
        {
          id: "5",
          invoice_number: "DRAFT-001",
          client_id: "client5",
          amount: 950,
          date: "2023-05-12",
          status: "draft",
          client: { id: "client5", client_name: "Me. Martin" }
        }
      ];

      // Apply filters if provided
      let filteredData = mockInvoices;
      if (filterStatus) {
        filteredData = filteredData.filter(inv => inv.status === filterStatus);
      }

      if (clientId) {
        filteredData = filteredData.filter(inv => inv.client_id === clientId);
      }

      if (limit && limit > 0) {
        filteredData = filteredData.slice(0, limit);
      }

      setInvoices(filteredData);
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
      // Mock deletion since we don't have actual Supabase tables
      console.log("Deleting invoice:", invoice.id);
      
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
      // Mock status update since we don't have actual Supabase tables
      console.log("Updating invoice status:", invoice.id, newStatus);
      
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
                  <TableCell>{typeof invoice.amount === 'number' ? `${invoice.amount} €` : invoice.amount}</TableCell>
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
            total: typeof selectedInvoice.amount === 'number' ? selectedInvoice.amount : parseFloat(String(selectedInvoice.amount).replace(/[€,$,\s]/g, '').replace(',', '.')) || 0
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
