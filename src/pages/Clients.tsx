import React, { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { UserPlus, Trash2, Edit, Mail, Phone, Tag, Plus, MoreHorizontal, User, CheckSquare } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { ClientSelector } from "@/components/ClientSelector";
import { NewClientForm } from "@/components/NewClientForm";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Header } from "@/components/Header";
import MobileNavigation from "@/components/MobileNavigation";

// Define Client type
interface Client {
  id: string;
  name: string;
  email: string | null;
  phone?: string | null;
  address?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  user_id?: string;
  invoiceCount?: number;
  // Champs de la table clients dans Supabase
  client_name?: string;
  company_id?: string | null;
  group_id?: string | null;
  reference_number?: string | null;
}

const Clients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Client>>({});
  const [updateLoading, setUpdateLoading] = useState(false);
  const [isClientSelectorOpen, setIsClientSelectorOpen] = useState(false);
  const [isNewClientFormOpen, setIsNewClientFormOpen] = useState(false);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('client_name');

      if (error) throw error;

      // Adapter les données de Supabase au format Client attendu
      const adaptedClients = (data || []).map(client => ({
        ...client,
        name: client.client_name, // Mapping client_name à name pour la compatibilité
        user_id: client.company_id // Utilisation de company_id comme user_id
      }));

      setClients(adaptedClients as Client[]);
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast.error('Erreur lors du chargement des clients');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchClientCategories = async (clientId: string) => {
    try {
      const { data, error } = await supabase
        .rpc('get_client_categories', { p_client_id: clientId });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching client categories:', error);
      return [];
    }
  };

  const handleDeleteClient = (client: Client) => {
    setSelectedClient(client);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteClient = async () => {
    if (!selectedClient) return;

    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', selectedClient.id);

      if (error) throw error;

      toast.success('Client supprimé avec succès');
      setClients(clients.filter(client => client.id !== selectedClient.id));
    } catch (error) {
      console.error('Error deleting client:', error);
      toast.error('Erreur lors de la suppression du client');
    } finally {
      setDeleteDialogOpen(false);
      setSelectedClient(null);
    }
  };

  const handleEditClient = (client: Client) => {
    setSelectedClient(client);
    setEditForm({
      id: client.id,
      name: client.name,
      email: client.email,
      phone: client.phone,
      address: client.address,
      notes: client.notes,
      reference_number: client.reference_number
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateClient = async () => {
    if (!selectedClient || !editForm) return;

    setUpdateLoading(true);

    try {
      const { data, error } = await supabase
        .from('clients')
        .update({
          client_name: editForm.name,
          email: editForm.email,
          phone: editForm.phone,
          address: editForm.address,
          notes: editForm.notes,
          reference_number: editForm.reference_number,
          // Les autres champs si nécessaire
        })
        .eq('id', selectedClient.id)
        .select();

      if (error) throw error;

      toast.success('Client mis à jour avec succès');

      // Mettre à jour la liste des clients avec les données mises à jour
      const updatedClient = {
        ...data[0],
        name: data[0].client_name, // Ajout du champ name pour la compatibilité
        user_id: data[0].company_id // Ajout du champ user_id pour la compatibilité
      };

      setClients(clients.map((client) => 
        client.id === updatedClient.id ? updatedClient as Client : client
      ));
      
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Error updating client:', error);
      toast.error('Erreur lors de la mise à jour du client');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleClientSelect = (client: Client) => {
    // Handle the selected client here
    console.log('Selected client:', client);
    // You can perform any action with the selected client, such as displaying details or associating it with an invoice.
    setIsClientSelectorOpen(false);
  };

  const handleNewClientCreated = (newClient: Client) => {
    // Add the new client to the clients list
    setClients(prevClients => [...prevClients, newClient]);
    // Close the form dialog
    setIsNewClientFormOpen(false);
  };

  return (
    <>
      <Header
        title="Clients"
        description="Gérez vos clients"
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
      />

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col space-y-6">
          <h2 className="text-2xl font-bold">Liste des clients</h2>
          
          <div className="flex flex-wrap gap-3 w-full">
            <Button 
              onClick={() => setIsNewClientFormOpen(true)} 
              className="flex items-center gap-2"
            >
              <UserPlus className="h-5 w-5" />
              Ajouter un client
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setIsClientSelectorOpen(true)}
              className="flex items-center gap-2"
            >
              <CheckSquare className="h-5 w-5" />
              Sélectionner un client
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center">Chargement des clients...</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Téléphone</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium">
                      <Link to={`/clients/${client.id}`} className="hover:underline">
                        {client.name}
                      </Link>
                    </TableCell>
                    <TableCell>{client.email}</TableCell>
                    <TableCell>{client.phone}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditClient(client)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteClient(client)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Supprimer
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

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
              <AlertDialogDescription>
                Cette action est irréversible.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeleteClient} className="bg-red-600">
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

        {/* Client Selector Modal */}
        <Dialog open={isClientSelectorOpen} onOpenChange={setIsClientSelectorOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Sélectionner un client</DialogTitle>
            </DialogHeader>
            <ClientSelector onClientSelect={handleClientSelect} />
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsClientSelectorOpen(false)}>
                Fermer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* New Client Form Modal */}
        <NewClientForm 
          open={isNewClientFormOpen} 
          onOpenChange={setIsNewClientFormOpen} 
          onClientCreated={handleNewClientCreated} 
        />
      </div>

      <MobileNavigation
        isOpen={isMobileMenuOpen}
        onOpenChange={setIsMobileMenuOpen}
      />
    </>
  );
};

export default Clients;
