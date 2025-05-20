
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Quote } from '@/types/quote';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Header } from '@/components/Header';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { QuoteDialog } from '@/components/quotes/QuoteDialog';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';
import { Edit, Trash2, FileText, Eye } from 'lucide-react';
import MobileNavigation from '@/components/MobileNavigation';

const Quotes = () => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isQuoteDialogOpen, setIsQuoteDialogOpen] = useState(false);
  const [selectedQuoteId, setSelectedQuoteId] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchQuotes();
  }, []);

  const fetchQuotes = async () => {
    setLoading(true);
    try {
      // Check if the quotes table exists before querying it
      const { count, error: checkError } = await supabase
        .from('quotes')
        .select('*', { count: 'exact', head: true });

      if (checkError) {
        console.error('Error checking quotes table:', checkError);
        toast.error('Failed to check quotes table.');
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('quotes')
        .select(`
          *,
          client:client_id (
            id,
            client_name,
            email,
            address,
            phone
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching quotes:', error);
        toast.error('Failed to load quotes.');
      }

      if (data) {
        setQuotes(data as Quote[]);
      }
    } catch (error) {
      console.error('Error fetching quotes:', error);
      toast.error('Failed to load quotes.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuoteSuccess = () => {
    fetchQuotes();
    setIsQuoteDialogOpen(false);
  };

  const handleDeleteQuote = async (quoteId: string) => {
    try {
      const { error } = await supabase
        .from('quotes')
        .delete()
        .eq('id', quoteId);

      if (error) {
        console.error('Error deleting quote:', error);
        toast.error('Failed to delete quote.');
      } else {
        toast.success('Quote deleted successfully.');
        fetchQuotes();
      }
    } catch (error) {
      console.error('Error deleting quote:', error);
      toast.error('Failed to delete quote.');
    }
  };

  const filteredQuotes = quotes.filter(quote => {
    const searchTerm = searchQuery.toLowerCase();
    return (
      quote.quote_number.toLowerCase().includes(searchTerm) ||
      (quote.client?.client_name?.toLowerCase().includes(searchTerm) ?? false)
    );
  });

  return (
    <>
      <Header
        title="Quotes"
        description="Manage your quotes"
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
      />

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Quotes List</h2>
            <Button onClick={() => setIsQuoteDialogOpen(true)}>
              Create Quote
            </Button>
          </div>

          <Input
            type="search"
            placeholder="Search quotes..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <Card className="mt-6">
          <CardContent className="p-0">
            {loading ? (
              <div className="text-center p-4">Loading quotes...</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Quote Number</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Issue Date</TableHead>
                      <TableHead>Total Amount</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredQuotes.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center">
                          No quotes found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredQuotes.map(quote => (
                        <TableRow key={quote.id}>
                          <TableCell className="font-medium">
                            <Link to={`/quotes/${quote.id}`} className="hover:underline">
                              {quote.quote_number}
                            </Link>
                          </TableCell>
                          <TableCell>{quote.client?.client_name}</TableCell>
                          <TableCell>
                            {format(new Date(quote.issue_date), 'PPP', { locale: ptBR })}
                          </TableCell>
                          <TableCell>{formatCurrency(quote.total_amount, 'EUR')}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Actions</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => navigate(`/quotes/${quote.id}`)}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {
                                  setSelectedQuoteId(quote.id);
                                  setIsQuoteDialogOpen(true);
                                }}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => navigate(`/quotes/pdf/${quote.id}`)}>
                                  <FileText className="h-4 w-4 mr-2" />
                                  Download PDF
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDeleteQuote(quote.id)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <QuoteDialog
          open={isQuoteDialogOpen}
          onOpenChange={setIsQuoteDialogOpen}
          editQuoteId={selectedQuoteId}
          onSuccess={handleQuoteSuccess}
        />
      </div>

      <MobileNavigation
        isOpen={isMobileMenuOpen}
        onOpenChange={setIsMobileMenuOpen}
      />
    </>
  );
};

export default Quotes;
