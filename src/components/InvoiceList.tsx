import { useState, useEffect } from "react";
import { InvoiceDialog } from "./InvoiceDialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Eye, Pencil, Trash2, Copy, Loader2 } from "lucide-react";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";
import { Invoice, Status } from '@/types/invoice';
import { CreditCard } from "lucide-react";

interface InvoiceListProps {
  limit?: number;
  onRefresh?: () => void;
}

export function QuoteList({ limit, onRefresh }: InvoiceListProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editInvoiceId, setEditInvoiceId] = useState<string | undefined>(undefined);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const fetchInvoices = async () => {
    try {
      setIsLoading(true);
      // Use any type to bypass TypeScript restrictions
      const invoicesQuery = supabase.from('invoices') as any;
      const { data, error } = await invoicesQuery
        .select(`
          *,
          client:clients (id, client_name)
        `)
        .order('date', { ascending: false });
      
      if (error) throw error;
      
      setInvoices(data || []);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast.error("Erreur lors du chargement des factures");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleEdit = (invoice: Invoice) => {
    setEditInvoiceId(invoice.id);
    setDialogOpen(true);
  };

  const handleDelete = async (invoice: Invoice) => {
    try {
      // Use any type to bypass TypeScript restrictions
      const invoicesQuery = supabase.from('invoices') as any;
      const { error } = await invoicesQuery
        .delete()
        .eq('id', invoice.id);
      
      if (error) throw error;
      
      toast.success("Facture supprimée avec succès");
      fetchInvoices();
    } catch (error) {
      console.error('Error deleting invoice:', error);
      toast.error("Erreur lors de la suppression de la facture");
    } finally {
      setDeleteDialogOpen(false);
      setSelectedInvoice(null);
    }
  };

  const confirmDelete = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setDeleteDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditInvoiceId(undefined);
    fetchInvoices();
    if (onRefresh) onRefresh();
  };

  const duplicateInvoice = async (invoice: Invoice) => {
    try {
      // Duplicate the invoice but generate a new invoice number
      const newInvoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
      
      // Create a new invoice with most of the same data
      const invoicesQuery = supabase.from('invoices') as any;
      const { data, error } = await invoicesQuery
        .insert({
          client_id: invoice.client_id,
          company_id: invoice.company_id,
          invoice_number: newInvoiceNumber,
          date: new Date().toISOString().split('T')[0],
          dueDate: invoice.dueDate,
          amount: invoice.amount,
          status: 'draft'
        })
        .select('id')
        .single();
      
      if (error) throw error;
      
      toast.success("Facture dupliquée avec succès");
      fetchInvoices();
    } catch (error) {
      console.error('Error duplicating invoice:', error);
      toast.error("Erreur lors de la duplication de la facture");
    }
  };

  const viewInvoice = (id: string) => {
    navigate(`/invoices/${id}`);
  };

  const handleStatusChange = async (invoice: Invoice, newStatus: Status) => {
    try {
      const { error } = await supabase
        .from('invoices')
        .update({ status: newStatus })
        .eq('id', invoice.id);
      
      if (error) throw error;
      
      toast.success(`Statut mis à jour à ${newStatus}`);
      fetchInvoices();
    } catch (error) {
      console.error('Error updating invoice status:', error);
      toast.error("Erreur lors de la mise à jour du statut");
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return <Badge variant="outline">Brouillon</Badge>;
      case "pending":
        return <Badge variant="secondary">En attente</Badge>;
      case "paid":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Payée</Badge>;
      case "overdue":
        return <Badge variant="destructive">En retard</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Annulée</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <>
      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      ) : (
        <div className="container mx-auto py-8">
          {invoices.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucune facture trouvée.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Numéro</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Date d'émission</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                    <TableCell>{invoice.client_name || (invoice.client ? invoice.client.client_name : 'Client inconnu')}</TableCell>
                    <TableCell>{format(new Date(invoice.date), "P", { locale: fr })}</TableCell>
                    <TableCell>{invoice.amount} €</TableCell>
                    <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {invoice.paymentUrl && (
                          <Button variant="ghost" size="icon" onClick={() => window.open(invoice.paymentUrl, '_blank')}>
                            <CreditCard className="h-4 w-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" onClick={() => viewInvoice(invoice.id)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(invoice)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => duplicateInvoice(invoice)}>
                          <Copy className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Êtes-vous sûr(e) ?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Cette action supprimera la facture définitivement.
                                Voulez-vous continuer ?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction onClick={() => confirmDelete(invoice)}>Supprimer</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      )}

      <InvoiceDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editInvoiceId={editInvoiceId}
        onSuccess={handleDialogClose}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmation de suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer cette facture ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedInvoice(null)}>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleDelete(selectedInvoice!)}>Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
