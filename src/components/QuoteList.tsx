
import { useState, useEffect } from "react";
import { QuoteDialog } from "./QuoteDialog";
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
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";
import { Quote } from "@/types/invoice";

interface QuoteListProps {
  limit?: number;
  onRefresh?: () => void;
}

export function QuoteList({ limit, onRefresh }: QuoteListProps) {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editQuoteId, setEditQuoteId] = useState<string | undefined>(undefined);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const fetchQuotes = async () => {
    try {
      setIsLoading(true);
      
      // Use type casting to bypass TypeScript restrictions
      const { data, error } = await (supabase as any).from('devis')
        .select(`
          *,
          client:clients (id, client_name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setQuotes(data || []);
    } catch (error) {
      console.error('Error fetching quotes:', error);
      toast.error("Erreur lors du chargement des devis");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotes();
  }, []);

  const handleEdit = (quote: Quote) => {
    setEditQuoteId(quote.id);
    setDialogOpen(true);
  };

  const handleDelete = async (quote: Quote) => {
    try {
      // Use type casting to bypass TypeScript restrictions
      const { error } = await (supabase as any).from('devis')
        .delete()
        .eq('id', quote.id);
      
      if (error) throw error;
      
      toast.success("Devis supprimé avec succès");
      fetchQuotes();
    } catch (error) {
      console.error('Error deleting quote:', error);
      toast.error("Erreur lors de la suppression du devis");
    } finally {
      setDeleteDialogOpen(false);
      setSelectedQuote(null);
    }
  };

  const confirmDelete = (quote: Quote) => {
    setSelectedQuote(quote);
    setDeleteDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditQuoteId(undefined);
    fetchQuotes();
    if (onRefresh) onRefresh();
  };

  const duplicateQuote = async (quote: Quote) => {
    try {
      // Duplicate the quote but generate a new quote number
      const newQuoteNumber = `Q-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
      
      // Create a new quote with most of the same data
      const { data, error } = await (supabase as any).from('devis')
        .insert({
          client_id: quote.client_id,
          company_id: quote.company_id,
          quote_number: newQuoteNumber,
          issue_date: new Date().toISOString().split('T')[0],
          validity_date: quote.validity_date,
          execution_date: quote.execution_date,
          subtotal: quote.subtotal,
          tax_amount: quote.tax_amount,
          total_amount: quote.total_amount,
          notes: quote.notes,
          customizations: quote.customizations,
          status: 'draft'
        })
        .select('id')
        .single();
      
      if (error) throw error;
      
      // Now duplicate the items
      if (quote.items && quote.items.length > 0) {
        const newItems = quote.items.map(item => ({
          quote_id: data.id,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price
        }));
        
        const { error: itemsError } = await (supabase as any).from('devis_items')
          .insert(newItems);
        
        if (itemsError) throw itemsError;
      }
      
      toast.success("Devis dupliqué avec succès");
      fetchQuotes();
    } catch (error) {
      console.error('Error duplicating quote:', error);
      toast.error("Erreur lors de la duplication du devis");
    }
  };

  const viewQuote = (id: string) => {
    navigate(`/quotes/${id}`);
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return <Badge variant="outline">Brouillon</Badge>;
      case "sent":
        return <Badge variant="secondary">Envoyé</Badge>;
      case "accepted":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Accepté</Badge>;
      case "rejected":
        return <Badge variant="destructive">Refusé</Badge>;
      case "expired":
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">Expiré</Badge>;
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
          {quotes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucun devis trouvé.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Numéro</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Date d'émission</TableHead>
                  <TableHead>Montant total</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quotes.map((quote) => (
                  <TableRow key={quote.id}>
                    <TableCell className="font-medium">{quote.quote_number}</TableCell>
                    <TableCell>{quote.client?.client_name}</TableCell>
                    <TableCell>{format(new Date(quote.issue_date), "P", { locale: fr })}</TableCell>
                    <TableCell>{quote.total_amount} €</TableCell>
                    <TableCell>{getStatusBadge(quote.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => viewQuote(quote.id)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(quote)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => duplicateQuote(quote)}>
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
                                Cette action supprimera le devis définitivement.
                                Voulez-vous continuer ?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction onClick={() => confirmDelete(quote)}>Supprimer</AlertDialogAction>
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

      <QuoteDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editQuoteId={editQuoteId}
        onSuccess={handleDialogClose}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmation de suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer ce devis ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedQuote(null)}>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={() => selectedQuote && handleDelete(selectedQuote)}>Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
