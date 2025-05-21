
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';
import { Subscription, SubscriptionItem, SubscriptionStatus } from "@/types/subscription";
import { checkTableExists } from "@/utils/databaseTableUtils";
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

// Export the types to be used in other components
export { Subscription, SubscriptionItem, SubscriptionStatus } from "@/types/subscription";

// Function to format dates in French locale
export function formatDate(dateString?: string): string {
  if (!dateString) return 'Non définie';
  
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    return format(date, 'dd MMMM yyyy', { locale: fr });
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
}

// Function to format recurring intervals
export function formatRecurringInterval(
  interval: 'month' | 'week' | 'day' | 'quarter' | 'semester' | 'year' | 'custom',
  count: number = 1
): string {
  if (interval === 'custom') {
    return 'Personnalisé';
  }
  
  const intervalLabels: Record<string, string> = {
    day: count > 1 ? 'jours' : 'jour',
    week: count > 1 ? 'semaines' : 'semaine',
    month: count > 1 ? 'mois' : 'mois',
    quarter: count > 1 ? 'trimestres' : 'trimestre',
    semester: count > 1 ? 'semestres' : 'semestre',
    year: count > 1 ? 'ans' : 'an'
  };
  
  return count > 1 ? `Tous les ${count} ${intervalLabels[interval]}` : `Tous les ${intervalLabels[interval]}`;
}

// Fonction de vérification de table
async function checkSubscriptionTablesExist(): Promise<boolean> {
  const subscriptionsExist = await checkTableExists('subscriptions');
  const subscriptionItemsExist = await checkTableExists('subscription_items');
  return subscriptionsExist && subscriptionItemsExist;
}

// Mock data pour les démonstrations
const mockSubscriptions: Subscription[] = [
  {
    id: '1',
    client_id: '1',
    start_date: '2023-01-01',
    next_invoice_date: '2023-04-01',
    recurring_interval: 'month',
    recurring_interval_count: 1,
    status: 'active',
    notes: 'Abonnement site web',
    items: [
      {
        id: '101',
        subscription_id: '1',
        product_id: '1',
        quantity: 1,
        unit_price: 249.99,
        description: 'Maintenance site web'
      }
    ],
    created_at: '2023-01-01T10:00:00Z',
    updated_at: '2023-01-01T10:00:00Z',
    client: {
      id: '1',
      name: 'Acme Corporation',
      email: 'contact@acme.com'
    }
  },
  {
    id: '2',
    client_id: '2',
    start_date: '2023-02-15',
    end_date: '2023-12-15',
    next_invoice_date: '2023-04-15',
    recurring_interval: 'quarter',
    recurring_interval_count: 1,
    status: 'active',
    notes: 'Forfait SEO trimestriel',
    items: [
      {
        id: '201',
        subscription_id: '2',
        product_id: '2',
        quantity: 1,
        unit_price: 699.99,
        description: 'Pack SEO Performance'
      }
    ],
    created_at: '2023-02-15T14:30:00Z',
    updated_at: '2023-02-15T14:30:00Z',
    client: {
      id: '2',
      name: 'TechStart SAS',
      email: 'info@techstart.fr'
    }
  }
];

// Function to fetch a single subscription by ID
export async function fetchSubscription(id: string): Promise<Subscription | null> {
  try {
    const tablesExist = await checkSubscriptionTablesExist();
    
    if (!tablesExist) {
      // Return mock data for the requested ID
      const subscription = mockSubscriptions.find(sub => sub.id === id);
      return subscription || null;
    }
    
    // Fetch the subscription from the database
    const { data: subscription, error: subscriptionError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('id', id)
      .single();
      
    if (subscriptionError) {
      console.error('Error fetching subscription:', subscriptionError);
      return null;
    }
    
    // Fetch the subscription items
    const { data: items, error: itemsError } = await supabase
      .from('subscription_items')
      .select('*')
      .eq('subscription_id', id);
      
    if (itemsError) {
      console.error('Error fetching subscription items:', itemsError);
      return null;
    }
    
    // Fetch the client information
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', subscription.client_id)
      .single();
      
    if (clientError) {
      console.error('Error fetching client:', clientError);
    }
    
    return {
      ...subscription,
      items: items || [],
      client: client || null,
      recurring_interval: subscription.recurring_interval as 'month' | 'week' | 'day' | 'quarter' | 'semester' | 'year' | 'custom',
      status: subscription.status as 'active' | 'canceled' | 'expired' | 'paused'
    };
  } catch (error) {
    console.error('Error in fetchSubscription:', error);
    return null;
  }
}

// Fonction pour récupérer toutes les souscriptions
export async function fetchSubscriptions(): Promise<Subscription[]> {
  try {
    const tablesExist = await checkSubscriptionTablesExist();
    
    if (!tablesExist) {
      console.log('Subscription tables do not exist, returning mock data');
      return mockSubscriptions;
    }
    
    // Si les tables existent, récupérer les données réelles
    const { data: subscriptions, error: subscriptionsError } = await supabase
      .from('subscriptions')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (subscriptionsError) {
      console.error('Error fetching subscriptions:', subscriptionsError);
      return [];
    }
    
    const result: Subscription[] = [];
    
    for (const subscription of subscriptions) {
      // Récupérer les éléments de la souscription
      const { data: items, error: itemsError } = await supabase
        .from('subscription_items')
        .select('*')
        .eq('subscription_id', subscription.id);
        
      if (itemsError) {
        console.error(`Error fetching subscription items for subscription ${subscription.id}:`, itemsError);
        continue;
      }
      
      // Récupérer les informations du client
      const { data: client, error: clientError } = await supabase
        .from('clients')
        .select('*')
        .eq('id', subscription.client_id)
        .single();
        
      if (clientError) {
        console.error(`Error fetching client for subscription ${subscription.id}:`, clientError);
      }
      
      result.push({
        ...subscription,
        items: items || [],
        client: client || null,
        recurring_interval: subscription.recurring_interval as 'month' | 'week' | 'day' | 'quarter' | 'semester' | 'year' | 'custom',
        status: subscription.status as 'active' | 'canceled' | 'expired' | 'paused'
      });
    }
    
    return result;
  } catch (error) {
    console.error('Error in fetchSubscriptions:', error);
    return [];
  }
}

// Update subscription status
export async function updateSubscriptionStatus(id: string, status: SubscriptionStatus): Promise<{ success: boolean; error?: string }> {
  try {
    const tablesExist = await checkSubscriptionTablesExist();
    
    if (!tablesExist) {
      console.log('Subscription tables do not exist, returning mock success');
      return { success: true };
    }
    
    const now = new Date().toISOString();
    
    const { error } = await supabase
      .from('subscriptions')
      .update({ 
        status,
        updated_at: now
      })
      .eq('id', id);
      
    if (error) {
      console.error('Error updating subscription status:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error in updateSubscriptionStatus:', error);
    return { success: false, error: 'Une erreur inattendue est survenue' };
  }
}

// Fonctions pour créer et mettre à jour les souscriptions
export async function createSubscription(subscriptionData: Partial<Subscription>): Promise<{ success: boolean; error?: string; id?: string }> {
  try {
    const tablesExist = await checkSubscriptionTablesExist();
    
    if (!tablesExist) {
      console.log('Subscription tables do not exist, returning mock success');
      return { 
        success: true, 
        id: uuidv4()
      };
    }
    
    const id = uuidv4();
    const now = new Date().toISOString();
    
    const { items, ...subscription } = subscriptionData as any;
    
    const subscriptionToInsert = {
      ...subscription,
      id,
      created_at: now,
      updated_at: now
    };
    
    // Insérer la souscription
    const { error: subscriptionError } = await supabase
      .from('subscriptions')
      .insert(subscriptionToInsert);
      
    if (subscriptionError) {
      console.error('Error creating subscription:', subscriptionError);
      return { success: false, error: subscriptionError.message };
    }
    
    // Insérer les éléments de la souscription
    if (items && items.length > 0) {
      const itemsToInsert = items.map((item: any) => ({
        id: uuidv4(),
        subscription_id: id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        description: item.description,
        created_at: now,
        updated_at: now
      }));
      
      const { error: itemsError } = await supabase
        .from('subscription_items')
        .insert(itemsToInsert);
        
      if (itemsError) {
        console.error('Error creating subscription items:', itemsError);
        return { success: false, error: itemsError.message };
      }
    }
    
    return { success: true, id };
  } catch (error) {
    console.error('Error in createSubscription:', error);
    return { success: false, error: 'Une erreur inattendue est survenue' };
  }
}

export async function updateSubscription(id: string, subscriptionData: Partial<Subscription>): Promise<{ success: boolean; error?: string }> {
  try {
    const tablesExist = await checkSubscriptionTablesExist();
    
    if (!tablesExist) {
      console.log('Subscription tables do not exist, returning mock success');
      return { success: true };
    }
    
    const now = new Date().toISOString();
    const { items, ...subscription } = subscriptionData as any;
    
    const subscriptionToUpdate = {
      ...subscription,
      updated_at: now
    };
    
    // Mettre à jour la souscription
    const { error: subscriptionError } = await supabase
      .from('subscriptions')
      .update(subscriptionToUpdate)
      .eq('id', id);
      
    if (subscriptionError) {
      console.error('Error updating subscription:', subscriptionError);
      return { success: false, error: subscriptionError.message };
    }
    
    // Supprimer les éléments existants
    const { error: deleteError } = await supabase
      .from('subscription_items')
      .delete()
      .eq('subscription_id', id);
      
    if (deleteError) {
      console.error('Error deleting existing subscription items:', deleteError);
    }
    
    // Insérer les nouveaux éléments
    if (items && items.length > 0) {
      const itemsToInsert = items.map((item: any) => ({
        id: uuidv4(),
        subscription_id: id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        description: item.description,
        created_at: now,
        updated_at: now
      }));
      
      const { error: itemsError } = await supabase
        .from('subscription_items')
        .insert(itemsToInsert);
        
      if (itemsError) {
        console.error('Error creating updated subscription items:', itemsError);
        return { success: false, error: itemsError.message };
      }
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error in updateSubscription:', error);
    return { success: false, error: 'Une erreur inattendue est survenue' };
  }
}
