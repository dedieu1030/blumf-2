
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { MobileNavigation } from "@/components/MobileNavigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InvoiceStatus } from "@/components/InvoiceStatus";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, Save, Mail, Phone, Building, Calendar, PlusCircle, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Client } from "@/types/user";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ClientCategorySelector } from "@/components/ClientCategorySelector";
import { ClientNotes } from "@/components/ClientNotes";
import { formatCurrency } from "@/lib/utils";

type ClientDetailsParams = {
  id: string;
};

type ClientInvoice = {
  id: string;
  invoice_number: string;
  issued_date: string;
  due_date: string | null;
  paid_date: string | null;
  amount_total: number;
  status: string;
  currency: string;
};

type ClientCategory = {
  category_id: string;
  category_name: string;
  category_color: string;
};

export default function ClientDetails() {
  const { id } = useParams<ClientDetailsParams>();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [client, setClient] = useState<Client | null>(null);
  const [clientInvoices, setClientInvoices] = useState<ClientInvoice[]>([]);
  const [clientCategories, setClientCategories] = useState<ClientCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingInvoices, setIsLoadingInvoices] = useState(true);
  const [activeTab, setActiveTab] = useState("details");
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  
  // Fetch client data
  useEffect(() => {
    const fetchClientData = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('clients')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) throw error;
        
        if (data) {
          // Ensure the client object has a name property matching client_name
          const clientWithName = {
            ...data,
            name: data.client_name,
            created_at: data.created_at || new Date().toISOString(),
            updated_at: data.updated_at || new Date().toISOString()
          } as Client;
          
          setClient(clientWithName);
          
          try {
            // Fetch client categories using a function that properly handles this operation
            const { data: categoryData } = await supabase
              .rpc('get_client_categories', { p_client_id: id });
            
            setClientCategories(categoryData || []);
          } catch (categoryError) {
            console.error("Error fetching client categories:", categoryError);
          }
        }
      } catch (error) {
        console.error("Error fetching client:", error);
        toast({
          title: "Erreur",
          description: "Impossible de récupérer les informations du client",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchClientData();
  }, [id, toast]);
  
  // Fetch client invoices
  useEffect(() => {
    const fetchClientInvoices = async () => {
      if (!id) return;
      
      setIsLoadingInvoices(true);
      try {
        const { data, error } = await supabase
          .from('stripe_invoices')
          .select('id, invoice_number, issued_date, due_date, paid_date, amount_total, status, currency')
          .eq('client_id', id)
          .order('issued_date', { ascending: false });
        
        if (error) throw error;
        
        setClientInvoices(data || []);
      } catch (error) {
        console.error("Error fetching client invoices:", error);
      } finally {
        setIsLoadingInvoices(false);
      }
    };
    
    if (activeTab === "invoices") {
      fetchClientInvoices();
    }
  }, [id, activeTab]);
  
  // Update client categories
  const handleCategoryChange = async (categoryIds: string[]) => {
    if (!client || !client.id) return;
    
    setIsSaving(true);
    
    try {
      // First remove all existing mappings
      try {
        const { error: deleteError } = await supabase
          .from('client_category_mappings')
          .delete()
          .eq('client_id', client.id);
        
        if (deleteError) throw deleteError;
      } catch (error) {
        console.error("Error deleting existing mappings:", error);
        throw error;
      }
      
      // Then add new mappings
      if (categoryIds.length > 0) {
        for (const categoryId of categoryIds) {
          try {
            const { error: insertError } = await supabase
              .from('client_category_mappings')
              .insert({
                client_id: client.id,
                category_id: categoryId
              });
            
            if (insertError) throw insertError;
          } catch (error) {
            console.error(`Error inserting mapping for category ${categoryId}:`, error);
            throw error;
          }
        }
      }
      
      try {
        // Refetch categories
        const { data: categoryData } = await supabase
          .rpc('get_client_categories', { p_client_id: client.id });
        
        setClientCategories(categoryData || []);
      } catch (error) {
        console.error("Error refetching client categories:", error);
        throw error;
      }
      
      toast({
        title: "Catégories mises à jour",
        description: "Les catégories du client ont été mises à jour avec succès"
      });
    } catch (error) {
      console.error("Error updating categories:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour les catégories du client",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  // Calculate statistics
  const totalInvoicesAmount = clientInvoices.reduce((sum, invoice) => sum + invoice.amount_total, 0);
  const paidInvoicesAmount = clientInvoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, invoice) => sum + invoice.amount_total, 0);
  const overdueInvoices = clientInvoices.filter(inv => 
    inv.status !== 'paid' && 
    inv.due_date && 
    new Date(inv.due_date) < new Date() && 
    inv.status !== 'draft'
  );
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!client) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-semibold">Client non trouvé</h1>
        <p className="text-muted-foreground mt-2">
          Le client que vous recherchez n'existe pas ou a été supprimé.
        </p>
        <Button onClick={() => navigate("/clients")} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour à la liste des clients
        </Button>
      </div>
    );
  }
  
  return (
    <>
      <Header 
        title="Détails du client"
        description={client?.name}
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
      />
      
      <div className="mb-6">
        <Button variant="outline" onClick={() => navigate("/clients")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour à la liste des clients
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>{client.name}</CardTitle>
              <CardDescription>Informations du contact</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{client.email}</span>
                </div>
                
                {client.phone && (
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{client.phone}</span>
                  </div>
                )}
                
                {client.address && (
                  <div className="flex items-start">
                    <Building className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                    <span>{client.address}</span>
                  </div>
                )}
                
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>Client depuis {format(new Date(client.created_at), 'dd/MM/yyyy')}</span>
                </div>
              </div>
              
              <div className="pt-2">
                <h3 className="text-sm font-medium mb-2">Catégories</h3>
                <div className="flex flex-wrap gap-2">
                  {clientCategories.length === 0 ? (
                    <span className="text-sm text-muted-foreground">Aucune catégorie</span>
                  ) : (
                    clientCategories.map(category => (
                      <Badge 
                        key={category.category_id} 
                        style={{ 
                          backgroundColor: category.category_color || '#888888',
                          color: category.category_color ? '#ffffff' : 'inherit' 
                        }}
                      >
                        {category.category_name}
                      </Badge>
                    ))
                  )}
                </div>
                
                <div className="mt-4">
                  <ClientCategorySelector
                    selectedCategoryIds={clientCategories.map(c => c.category_id)}
                    onCategoriesChange={handleCategoryChange}
                    isLoading={isSaving}
                  />
                </div>
              </div>
              
              <div className="pt-4">
                <Button onClick={() => navigate(`/invoicing?client=${id}`)} className="w-full">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Créer une facture
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Statistiques</CardTitle>
              <CardDescription>Aperçu de l'activité du client</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted p-3 rounded-md">
                    <div className="text-sm font-medium text-muted-foreground">Factures</div>
                    <div className="text-2xl font-bold">{clientInvoices.length}</div>
                  </div>
                  <div className="bg-muted p-3 rounded-md">
                    <div className="text-sm font-medium text-muted-foreground">En retard</div>
                    <div className="text-2xl font-bold text-destructive">{overdueInvoices.length}</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Chiffre d'affaires total</span>
                    <span className="font-medium">
                      {formatCurrency(totalInvoicesAmount / 100, clientInvoices[0]?.currency || 'EUR')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Montant payé</span>
                    <span className="font-medium">
                      {formatCurrency(paidInvoicesAmount / 100, clientInvoices[0]?.currency || 'EUR')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Taux de conversion</span>
                    <span className="font-medium">
                      {totalInvoicesAmount > 0 
                        ? Math.round((paidInvoicesAmount / totalInvoicesAmount) * 100) 
                        : 0}%
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="col-span-1 md:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="details">Détails</TabsTrigger>
              <TabsTrigger value="invoices">Factures</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Notes et commentaires</CardTitle>
                  <CardDescription>Informations complémentaires sur ce client</CardDescription>
                </CardHeader>
                <CardContent>
                  <ClientNotes clientId={client.id} initialNotes={client.notes} />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="invoices" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Historique des factures</CardTitle>
                  <CardDescription>Liste de toutes les factures pour ce client</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingInvoices ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : clientInvoices.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">Ce client n'a pas encore de factures</p>
                      <Button onClick={() => navigate(`/invoicing?client=${id}`)}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Créer une facture
                      </Button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>N° Facture</TableHead>
                            <TableHead>Date d'émission</TableHead>
                            <TableHead>Échéance</TableHead>
                            <TableHead>Montant</TableHead>
                            <TableHead>Statut</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {clientInvoices.map((invoice) => (
                            <TableRow key={invoice.id}>
                              <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                              <TableCell>{format(new Date(invoice.issued_date), 'dd/MM/yyyy')}</TableCell>
                              <TableCell>{invoice.due_date 
                                ? format(new Date(invoice.due_date), 'dd/MM/yyyy')
                                : '-'}</TableCell>
                              <TableCell>
                                {formatCurrency(invoice.amount_total / 100, invoice.currency)}
                              </TableCell>
                              <TableCell>
                                <InvoiceStatus status={invoice.status as "paid" | "pending" | "overdue" | "draft"} />
                              </TableCell>
                              <TableCell className="text-right">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => navigate(`/invoices/${invoice.id}`)}
                                >
                                  Voir
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      <MobileNavigation 
        isOpen={isMobileMenuOpen}
        onOpenChange={setIsMobileMenuOpen}
      />
    </>
  );
}
