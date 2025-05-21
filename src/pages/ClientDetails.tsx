import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Trash2, Edit, Mail, Phone, MapPin, Tag, ArrowLeft, Building, User, FileText, Clock, Plus } from "lucide-react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Header } from "@/components/Header";
import MobileNavigation from "@/components/MobileNavigation";
import { Client } from "@/types/user";
import { safeGetClientById, safeDeleteClient } from "@/utils/clientUtils";
import { format } from "date-fns";

const ClientDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [client, setClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Client>>({});
  const [updateLoading, setUpdateLoading] = useState(false);
  const [clientCategories, setClientCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  useEffect(() => {
    if (id) {
      fetchClient(id);
      fetchClientCategories(id);
    }
  }, [id]);

  const fetchClient = async (clientId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await safeGetClientById(clientId);

      if (error) throw error;
      if (!data) throw new Error("Client not found");

      // Adapter les données de Supabase au format Client attendu
      const adaptedClient = {
        ...data,
        name: data.client_name || data.name, // Utiliser client_name ou name
        user_id: data.company_id, // Utilisation de company_id comme user_id
        created_at: data.created_at || new Date().toISOString(),
        updated_at: data.updated_at || new Date().toISOString()
      };

      setClient(adaptedClient as Client);
    } catch (error) {
      console.error('Error fetching client:', error);
      toast.error("Erreur lors du chargement du client");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchClientCategories = async (clientId: string) => {
    try {
      const { data, error } = await supabase
        .rpc('get_client_categories', { p_client_id: clientId });

      if (error) throw error;
      setClientCategories(data || []);
    } catch (error) {
      console.error('Error fetching client categories:', error);
      setClientCategories([]);
    }
  };

  const handleDeleteClient = async () => {
    if (!client) return;
    
    try {
      const { error } = await safeDeleteClient(client.id);
      
      if (error) {
        toast.error("Erreur lors de la suppression du client");
        return;
      }
      
      toast.success("Client supprimé avec succès");
      navigate('/clients');
    } catch (error) {
      console.error("Error deleting client:", error);
      toast.error("Erreur lors de la suppression du client");
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  const handleEditClient = () => {
    if (!client) return;
    
    setEditForm({
      id: client.id,
      name: client.name,
      client_name: client.client_name,
      email: client.email,
      phone: client.phone,
      address: client.address,
      notes: client.notes,
      reference_number: client.reference_number
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateClient = async () => {
    if (!client || !editForm) return;

    setUpdateLoading(true);

    try {
      const { data, error } = await supabase
        .from('clients')
        .update({
          client_name: editForm.name || editForm.client_name,
          email: editForm.email,
          phone: editForm.phone,
          address: editForm.address,
          notes: editForm.notes,
          reference_number: editForm.reference_number,
          // Les autres champs si nécessaire
        })
        .eq('id', client.id)
        .select();

      if (error) throw error;

      toast.success('Client mis à jour avec succès');

      // Mettre à jour les données du client avec les données mises à jour
      if (data && data.length > 0) {
        const updatedClient = {
          ...client,
          name: editForm.name || editForm.client_name || client.name,
          client_name: editForm.name || editForm.client_name || client.client_name,
          email: editForm.email || client.email,
          phone: editForm.phone || client.phone,
          address: editForm.address || client.address,
          notes: editForm.notes || client.notes,
          reference_number: editForm.reference_number || client.reference_number,
          updated_at: new Date().toISOString()
        };

        setClient(updatedClient);
      }
      
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Error updating client:', error);
      toast.error("Erreur lors de la mise à jour du client");
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim() || !client) return;

    try {
      const { error } = await supabase.rpc('add_client_category', {
        p_client_id: client.id,
        p_category_name: newCategory.trim()
      });

      if (error) throw error;

      toast.success('Catégorie ajoutée avec succès');
      setNewCategory('');
      setIsCategoryModalOpen(false);
      fetchClientCategories(client.id);
    } catch (error) {
      console.error('Error adding category:', error);
      toast.error("Erreur lors de l'ajout de la catégorie");
    }
  };

  const handleRemoveCategory = async (categoryName: string) => {
    if (!client) return;

    try {
      const { error } = await supabase.rpc('remove_client_category', {
        p_client_id: client.id,
        p_category_name: categoryName
      });

      if (error) throw error;

      toast.success('Catégorie supprimée avec succès');
      fetchClientCategories(client.id);
    } catch (error) {
      console.error('Error removing category:', error);
      toast.error("Erreur lors de la suppression de la catégorie");
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy');
    } catch (error) {
      return 'Date invalide';
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Chargement des détails du client...</div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Client non trouvé</div>
        <Button onClick={() => navigate('/clients')} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour à la liste des clients
        </Button>
      </div>
    );
  }

  return (
    <>
      <Header
        title={client.name || "Détails du client"}
        description="Informations détaillées sur le client"
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
      />

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col space-y-6">
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={() => navigate('/clients')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={handleEditClient}>
                <Edit className="h-4 w-4 mr-2" />
                Modifier
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                {client.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  {client.email && (
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{client.email}</span>
                    </div>
                  )}
                  {client.phone && (
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{client.phone}</span>
                    </div>
                  )}
                  {client.address && (
                    <div className="flex items-start">
                      <MapPin className="h-4 w-4 mr-2 text-muted-foreground mt-1" />
                      <span className="whitespace-pre-line">{client.address}</span>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  {client.reference_number && (
                    <div className="flex items-center">
                      <Tag className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>Référence: {client.reference_number}</span>
                    </div>
                  )}
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>Créé le: {formatDate(client.created_at)}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>Mis à jour le: {formatDate(client.updated_at)}</span>
                  </div>
                </div>
              </div>

              {client.notes && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium mb-2">Notes</h3>
                  <div className="bg-muted p-3 rounded-md whitespace-pre-line">
                    {client.notes}
                  </div>
                </div>
              )}

              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium">Catégories</h3>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setIsCategoryModalOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Ajouter
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {clientCategories.length === 0 ? (
                    <span className="text-sm text-muted-foreground">Aucune catégorie</span>
                  ) : (
                    clientCategories.map((category, index) => (
                      <div 
                        key={index} 
                        className="bg-muted px-3 py-1 rounded-full text-sm flex items-center"
                      >
                        <span>{category}</span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-5 w-5 ml-1 hover:bg-transparent"
                          onClick={() => handleRemoveCategory(category)}
                        >
                          <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="invoices">
            <TabsList>
              <TabsTrigger value="invoices">Factures</TabsTrigger>
              <TabsTrigger value="quotes">Devis</TabsTrigger>
              <TabsTrigger value="subscriptions">Abonnements</TabsTrigger>
            </TabsList>
            <TabsContent value="invoices" className="mt-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center text-muted-foreground py-8">
                    Aucune facture associée à ce client
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="quotes" className="mt-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center text-muted-foreground py-8">
                    Aucun devis associé à ce client
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="subscriptions" className="mt-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center text-muted-foreground py-8">
                    Aucun abonnement associé à ce client
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Cela supprimera définitivement le client {client.name}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteClient} className="bg-red-600">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Client Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Modifier le client</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom</Label>
              <Input
                id="name"
                value={editForm.name || ""}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={editForm.email || ""}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                value={editForm.phone || ""}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Adresse</Label>
              <Textarea
                id="address"
                value={editForm.address || ""}
                onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={editForm.notes || ""}
                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reference_number">Numéro de référence</Label>
              <Input
                id="reference_number"
                value={editForm.reference_number || ""}
                onChange={(e) => setEditForm({ ...editForm, reference_number: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleUpdateClient} disabled={updateLoading}>
              {updateLoading ? (
                <>
                  <span className="animate-spin h-4 w-4 mr-2 border-t-2 border-current rounded-full" />
                  Traitement...
                </>
              ) : (
                "Mettre à jour"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Category Modal */}
      <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Ajouter une catégorie</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="category">Nom de la catégorie</Label>
              <Input
                id="category"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Entrez le nom de la catégorie"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCategoryModalOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleAddCategory}>
              Ajouter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <MobileNavigation
        isOpen={isMobileMenuOpen}
        onOpenChange={setIsMobileMenuOpen}
      />
    </>
  );
};

export default ClientDetails;
