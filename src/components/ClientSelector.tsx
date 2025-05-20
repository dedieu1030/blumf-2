
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Client } from "@/types/user";

export interface ClientSelectorProps {
  onClientSelect: (client: Client) => void;
  buttonText?: string; // Propriété optionnelle pour personnaliser le texte du bouton
}

export const ClientSelector = ({ onClientSelect, buttonText }: ClientSelectorProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchClients = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('clients')
          .select('*')
          .order('client_name');
        
        if (error) throw error;
        
        // Map the clients data to include the 'name' property
        const mappedClients = (data || []).map(client => ({
          ...client,
          name: client.client_name, // Add name property mapped from client_name
          created_at: client.created_at || new Date().toISOString(),
          updated_at: client.updated_at || new Date().toISOString()
        }));
        
        setClients(mappedClients);
        setFilteredClients(mappedClients);
      } catch (error) {
        console.error('Error fetching clients:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchClients();
  }, []);
  
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredClients(clients);
    } else {
      const lowercaseQuery = searchQuery.toLowerCase();
      const filtered = clients.filter(client => 
        client.client_name.toLowerCase().includes(lowercaseQuery) || 
        (client.email && client.email.toLowerCase().includes(lowercaseQuery))
      );
      setFilteredClients(filtered);
    }
  }, [searchQuery, clients]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Input
          type="search"
          placeholder="Rechercher un client..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full"
        />
      </div>

      {isLoading ? (
        <div className="text-center p-4">
          <span className="animate-spin inline-block h-6 w-6 border-t-2 border-primary rounded-full" />
        </div>
      ) : filteredClients.length > 0 ? (
        <div className="border rounded-md overflow-hidden max-h-[300px] overflow-y-auto">
          {filteredClients.map((client) => (
            <div
              key={client.id}
              className="p-3 border-b last:border-0 flex items-center justify-between hover:bg-muted/50 cursor-pointer"
              onClick={() => onClientSelect(client)}
            >
              <div>
                <div className="font-medium">{client.client_name}</div>
                {client.email && (
                  <div className="text-sm text-muted-foreground">{client.email}</div>
                )}
              </div>
              <Button variant="ghost" size="sm" onClick={() => onClientSelect(client)}>
                Sélectionner
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center p-4 border rounded-md">
          <p className="text-muted-foreground">Aucun client trouvé</p>
        </div>
      )}
    </div>
  );
};
