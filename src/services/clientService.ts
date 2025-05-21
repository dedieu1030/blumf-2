import { supabase } from "@/integrations/supabase/client";
import { checkTableExists } from "@/utils/databaseTableUtils";
import { Client } from "@/types/client";

// Fetch all clients
export async function fetchClients(): Promise<Client[]> {
  try {
    const tableExists = await checkTableExists('clients');
    
    if (!tableExists) {
      // Return mock data for demo purposes
      return [
        {
          id: '1',
          client_name: 'Acme Corporation',
          name: 'Acme Corporation', // Pour compatibilité
          email: 'contact@acme.com',
          phone: '+33 1 23 45 67 89',
          address: '123 Business Avenue, Paris',
          notes: 'Important client with multiple projects',
          created_at: '2023-06-15T10:00:00Z',
          updated_at: '2023-07-20T14:30:00Z'
        },
        {
          id: '2',
          client_name: 'TechStart SAS',
          name: 'TechStart SAS', // Pour compatibilité
          email: 'info@techstart.fr',
          phone: '+33 6 12 34 56 78',
          address: '45 Innovation Street, Lyon',
          notes: 'Startup client, flexible payment terms',
          created_at: '2023-08-05T09:15:00Z',
          updated_at: '2023-08-05T09:15:00Z'
        },
      ];
    }
    
    // If table exists, fetch actual data
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Error fetching clients:", error);
      return [];
    }
    
    return data.map(client => ({
      ...client,
      name: client.client_name // Pour compatibilité
    })) as Client[];
  } catch (error) {
    console.error("Error in fetchClients:", error);
    return [];
  }
}

// Get client by ID
export async function getClient(id: string): Promise<Client | null> {
  try {
    const tableExists = await checkTableExists('clients');
    
    if (!tableExists) {
      // Return mock data for demo
      const mockClients = await fetchClients();
      return mockClients.find(client => client.id === id) || null;
    }
    
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error("Error fetching client:", error);
      return null;
    }
    
    return {
      ...data,
      name: data.client_name // Pour compatibilité
    } as Client;
  } catch (error) {
    console.error("Error in getClient:", error);
    return null;
  }
}

// Create a new client
export async function createClient(client: Omit<Client, 'id' | 'created_at' | 'updated_at'>): Promise<{ data: Client | null, error: any }> {
  try {
    const tableExists = await checkTableExists('clients');
    
    if (!tableExists) {
      console.log('Clients table does not exist, returning mock success');
      return { 
        data: {
          id: 'new-client-id',
          ...client,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          name: client.client_name
        }, 
        error: null 
      };
    }
    
    const { data, error } = await supabase
      .from('clients')
      .insert([
        { 
          ...client,
          name: client.client_name
        }
      ])
      .select()
      .single();
    
    if (error) {
      console.error("Error creating client:", error);
      return { data: null, error };
    }
    
    return { 
      data: {
        ...data,
        name: data.client_name
      }, 
      error: null 
    };
  } catch (error) {
    console.error("Error in createClient:", error);
    return { data: null, error: error };
  }
}

// Update an existing client
export async function updateClient(id: string, updates: Partial<Client>): Promise<{ data: Client | null, error: any }> {
  try {
    const tableExists = await checkTableExists('clients');
    
    if (!tableExists) {
      console.log('Clients table does not exist, returning mock success');
      
      const mockClient = {
        id,
        ...updates,
        updated_at: new Date().toISOString(),
        name: updates.client_name || updates.name
      } as Client;
      
      return { data: mockClient, error: null };
    }
    
    const { data, error } = await supabase
      .from('clients')
      .update({ 
        ...updates,
        name: updates.client_name || updates.name
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error("Error updating client:", error);
      return { data: null, error };
    }
    
    return { 
      data: {
        ...data,
        name: data.client_name
      }, 
      error: null 
    };
  } catch (error) {
    console.error("Error in updateClient:", error);
    return { data: null, error: error };
  }
}

// Delete a client
export async function deleteClient(id: string): Promise<boolean> {
  try {
    const tableExists = await checkTableExists('clients');
    
    if (!tableExists) {
      console.log('Clients table does not exist, returning mock success');
      return true;
    }
    
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error("Error deleting client:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error in deleteClient:", error);
    return false;
  }
}
