// Importations
import { useState, useEffect } from "react";
import { QuoteDialog } from "./QuoteDialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Pencil, Trash2, Eye, MoreHorizontal, FileText } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { Quote } from "@/types/invoice";

interface QuoteListProps {
  onRefresh?: () => void;
  clientId?: string;
  limit?: number;
}

export function QuoteList({ onRefresh, clientId, limit }: QuoteListProps) {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [convertDialogOpen, setConvertDialogOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchQuotes();
  }, [clientId, limit]);

  const fetchQuotes = async () => {
    try {
      setIsLoading(true);
      
      // Récupération des devis avec TypeCasting sécurisé
      const { data, error } = await supabase
        .from('devis')
        .select(`
          *,
          client:clients (id, client_name)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching quotes:', error);
        toast({
          title: "Erreur",
          description: "Impossible de récupérer les devis",
          variant: "destructive",
        });
        return;
      }

      // Appliquer les filtres
      let filteredData = data || [];
      
      if (clientId) {
        filteredData = filteredData.filter(quote => quote.client_id === clientId);
      }
      
      if (limit && limit > 0) {
        filteredData = filteredData.slice(0, limit);
      }

      setQuotes(filteredData as Quote[]);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la récupération des devis",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (quote: Quote) => {
    try {
      const { error } = await (supabase as any).from('devis')
        .delete()
        .eq('id', quote.id);
      
      if (error) {
        console.error('Error deleting quote:', error);
        toast({
          title: "Error",
          description: "Failed to delete quote",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Quote deleted successfully",
      });

      // Refresh the list
      fetchQuotes();
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

  const confirmDelete = (quote: Quote) => {
    setSelectedQuote(quote);
    setDeleteDialogOpen(true);
  };

  const handleConvertToInvoice = (quote: Quote) => {
    setSelectedQuote(quote);
    setConvertDialogOpen(true);
  };

  const handleViewQuote = (quote: Quote) => {
    // Navigate to quote details page
    navigate(`/quotes/${quote.id}`);
  };

  const handleEditQuote = (quote: Quote) => {
    setSelectedQuote(quote);
    setDialogOpen(true);
  };

  const handleDialogSuccess = () => {
    fetchQuotes();
    if (onRefresh) onRefresh();
    setDialogOpen(false);
  };

  return (
    <div>
      {isLoading ? (
        <Card className="p-8 flex justify-center">
          <p>Chargement des devis...</p>
        </Card>
      ) : quotes.length === 0 ? (
        <Card className="p-8 text-center">
          <p>Aucun devis trouvé.</p>
        </Card>
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
              {quotes.map((quote) => (
                <TableRow key={quote.id}>
                  <TableCell>{quote.quote_number}</TableCell>
                  <TableCell>{quote.client?.client_name || 'N/A'}</TableCell>
                  <TableCell>
                    {quote.issue_date ? (
                      <div>
                        <div>{new Date(quote.issue_date).toLocaleDateString()}</div>
                        <div className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(quote.issue_date), { addSuffix: true, locale: fr })}
                        </div>
                      </div>
                    ) : (
                      'N/A'
                    )}
                  </TableCell>
                  <TableCell>{quote.total_amount} €</TableCell>
                  <TableCell>
                    <Badge variant={quote.status === 'accepted' ? 'success' : quote.status === 'rejected' ? 'destructive' : 'outline'}>
                      {quote.status === 'draft' ? 'Brouillon' : 
                       quote.status === 'sent' ? 'Envoyé' : 
                       quote.status === 'accepted' ? 'Accepté' : 
                       quote.status === 'rejected' ? 'Refusé' : quote.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/quotes/${quote.id}`)}>
                          <Eye className="mr-2 h-4 w-4" /> Voir
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          setSelectedQuote(quote);
                          setDialogOpen(true);
                        }}>
                          <Pencil className="mr-2 h-4 w-4" /> Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          setSelectedQuote(quote);
                          setConvertDialogOpen(true);
                        }}>
                          <FileText className="mr-2 h-4 w-4" /> Convertir en facture
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          setSelectedQuote(quote);
                          setDeleteDialogOpen(true);
                        }} className="text-red-500">
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

      {/* Dialog for editing quote */}
      {selectedQuote && (
        <QuoteDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          editQuoteId={selectedQuote.id}
          onSuccess={() => {
            fetchQuotes();
            if (onRefresh) onRefresh();
            setDialogOpen(false);
          }}
        />
      )}

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action ne peut pas être annulée. Cela supprimera définitivement ce devis.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              // Logique de suppression
              setDeleteDialogOpen(false);
            }} className="bg-red-600 hover:bg-red-700">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Convert to invoice dialog */}
      <AlertDialog open={convertDialogOpen} onOpenChange={setConvertDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Convertir en facture</AlertDialogTitle>
            <AlertDialogDescription>
              Voulez-vous convertir ce devis en facture ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              // Logique de conversion
              setConvertDialogOpen(false);
            }}>
              Convertir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
