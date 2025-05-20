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
      
      // Mock data for quotes since we don't have the devis table in Supabase types
      const mockQuotes: Quote[] = [
        {
          id: "1",
          quote_number: "QUO-001",
          client_id: "client1",
          client: { id: "client1", client_name: "SCI Legalis" },
          issue_date: "2023-05-01",
          validity_date: "2023-06-01",
          status: "draft",
          subtotal: 1000,
          tax_amount: 200,
          total_amount: 1200,
          created_at: "2023-05-01"
        },
        {
          id: "2",
          quote_number: "QUO-002",
          client_id: "client2",
          client: { id: "client2", client_name: "Cabinet Lefort" },
          issue_date: "2023-05-03",
          validity_date: "2023-06-03",
          status: "sent",
          subtotal: 800,
          tax_amount: 50,
          total_amount: 850,
          created_at: "2023-05-03"
        },
        {
          id: "3",
          quote_number: "QUO-003",
          client_id: "client3",
          client: { id: "client3", client_name: "Me. Dubois" },
          issue_date: "2023-05-05",
          validity_date: "2023-06-05",
          status: "accepted",
          subtotal: 1300,
          tax_amount: 100,
          total_amount: 1400,
          created_at: "2023-05-05"
        }
      ];

      // Apply filters
      let filteredData = mockQuotes;
      
      if (clientId) {
        filteredData = filteredData.filter(quote => quote.client_id === clientId);
      }
      
      if (limit && limit > 0) {
        filteredData = filteredData.slice(0, limit);
      }

      setQuotes(filteredData);
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
      // Mock deletion since we don't have the actual Supabase tables
      console.log("Deleting quote:", quote.id);
      
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

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft':
        return 'Brouillon';
      case 'sent':
        return 'Envoyé';
      case 'accepted':
        return 'Accepté';
      case 'rejected':
        return 'Refusé';
      default:
        return status;
    }
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
                    <Badge 
                      variant="outline" 
                      className="bg-green-50 text-green-700 hover:bg-green-100 border-green-200"
                    >
                      {getStatusText(quote.status)}
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
          onSuccess={handleDialogSuccess}
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
              if (selectedQuote) {
                handleDelete(selectedQuote);
              }
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
              // Logic for conversion
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
