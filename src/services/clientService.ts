
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getMockClients } from "@/services/mockDataService";
import { checkTableExists } from "@/utils/databaseTableUtils";
import { Client } from "@/types/client";

/**
 * Fetch all clients
 */
export async function fetchClients(): Promise<Client[]> {
  try {
    // Check if the clients table exists
    const tableExists = await checkTableExists('clients');
    
    if (!tableExists) {
      console.log('Clients table does not exist, using mock data');
      return getMockClients();
    }
    
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('client_name');
      
      if (error) throw error;
      
      return (data || []).map((client: any) => ({
        ...client,
        name: client.client_name || 'Unnamed Client',
        user_id: client.company_id
      })) as Client[];
      
    } catch (error) {
      console.error('Error fetching clients:', error);
      return getMockClients();
    }
  } catch (error) {
    console.error('Error in fetchClients:', error);
    toast.error('Error loading clients');
    return getMockClients();
  }
}

/**
 * Fetch a single client by ID
 */
export async function fetchClient(id: string): Promise<Client | null> {
  try {
    // Check if the clients table exists
    const tableExists = await checkTableExists('clients');
    
    if (!tableExists) {
      const mockClients = getMockClients();
      return mockClients.find(c => c.id === id) || mockClients[0];
    }
    
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      return {
        ...data,
        name: data.client_name || 'Unnamed Client',
        user_id: data.company_id
      } as Client;
      
    } catch (error) {
      console.error('Error fetching client:', error);
      const mockClients = getMockClients();
      return mockClients.find(c => c.id === id) || mockClients[0];
    }
  } catch (error) {
    console.error('Error in fetchClient:', error);
    toast.error('Error loading client');
    return null;
  }
}

/**
 * Create a new client
 */
export async function createClient(clientData: Partial<Client>): Promise<{success: boolean, data?: Client, error?: string}> {
  try {
    // Check if the clients table exists
    const tableExists = await checkTableExists('clients');
    
    if (!tableExists) {
      // Return a mock success
      const mockClient = {
        id: crypto.randomUUID(),
        name: clientData.name || 'New Client',
        client_name: clientData.name || 'New Client',
        email: clientData.email || '',
        phone: clientData.phone || '',
        address: clientData.address || '',
        notes: clientData.notes || '',
        reference_number: clientData.reference_number || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as Client;
      
      return { success: true, data: mockClient };
    }
    
    // Prepare the client data for insertion
    const clientToInsert = {
      client_name: clientData.name,
      email: clientData.email,
      phone: clientData.phone,
      address: clientData.address,
      notes: clientData.notes,
      reference_number: clientData.reference_number,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('clients')
      .insert([clientToInsert])
      .select()
      .single();
    
    if (error) throw error;
    
    return { 
      success: true, 
      data: {
        ...data,
        name: data.client_name || 'Unnamed Client',
        user_id: data.company_id
      } as Client
    };
  } catch (error) {
    console.error('Error in createClient:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return { success: false, error: errorMessage };
  }
}

/**
 * Update an existing client
 */
export async function updateClient(id: string, clientData: Partial<Client>): Promise<{success: boolean, data?: Client, error?: string}> {
  try {
    // Check if the clients table exists
    const tableExists = await checkTableExists('clients');
    
    if (!tableExists) {
      // Return a mock success
      const mockClient = {
        id,
        name: clientData.name || 'Updated Client',
        client_name: clientData.name || 'Updated Client',
        email: clientData.email || '',
        phone: clientData.phone || '',
        address: clientData.address || '',
        notes: clientData.notes || '',
        reference_number: clientData.reference_number || '',
        updated_at: new Date().toISOString()
      } as Client;
      
      return { success: true, data: mockClient };
    }
    
    // Prepare the client data for update
    const clientToUpdate = {
      client_name: clientData.name || clientData.client_name,
      email: clientData.email,
      phone: clientData.phone,
      address: clientData.address,
      notes: clientData.notes,
      reference_number: clientData.reference_number,
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('clients')
      .update(clientToUpdate)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    return { 
      success: true, 
      data: {
        ...data,
        name: data.client_name || 'Unnamed Client',
        user_id: data.company_id
      } as Client
    };
  } catch (error) {
    console.error('Error in updateClient:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return { success: false, error: errorMessage };
  }
}

/**
 * Delete a client
 */
export async function deleteClient(id: string): Promise<{success: boolean, error?: string}> {
  try {
    // Check if the clients table exists
    const tableExists = await checkTableExists('clients');
    
    if (!tableExists) {
      // Return a mock success
      return { success: true };
    }
    
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error('Error in deleteClient:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return { success: false, error: errorMessage };
  }
}
