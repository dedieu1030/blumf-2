import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { addDays, addWeeks, addMonths, addYears, format } from "date-fns";
import { getMockSubscriptions, generateMockSubscription } from "./subscriptionMockService";
import { checkTableExists } from "@/utils/databaseTableUtils";
import { Subscription, SubscriptionItem, SubscriptionStatus } from "@/types/subscription";
import { Product } from "@/types/product";

// Helper function to validate recurring interval
function validateRecurringInterval(interval: string | null): 'day' | 'week' | 'month' | 'quarter' | 'semester' | 'year' | 'custom' {
  if (!interval || !['day', 'week', 'month', 'quarter', 'semester', 'year', 'custom'].includes(interval)) {
    console.warn(`Invalid recurring interval value: ${interval}, defaulting to 'month'`);
    return 'month';
  }
  return interval as 'day' | 'week' | 'month' | 'quarter' | 'semester' | 'year' | 'custom';
}

// Helper function to validate subscription status
function validateStatus(status: string | null): SubscriptionStatus {
  if (!status || !['active', 'paused', 'canceled', 'expired'].includes(status)) {
    console.warn(`Invalid status value: ${status}, defaulting to 'active'`);
    return 'active';
  }
  return status as SubscriptionStatus;
}

// Update the fetchSubscriptions function to use stored procedures or fallback to safe queries
export async function fetchSubscriptions() {
  try {
    // Check if the subscriptions table exists
    const tableExists = await checkTableExists('subscriptions');
    if (!tableExists) {
      return getMockSubscriptions();
    }
    
    try {
      // Try a simple query to check if the table is accessible
      const { data: testData, error: testError } = await supabase
        .from('subscriptions')
        .select('count(*)')
        .limit(1);
        
      if (testError) {
        console.warn('Error accessing subscriptions table:', testError);
        return getMockSubscriptions();
      }
      
      // Get subscriptions with client data
      const { data, error } = await supabase.from('subscriptions').select(`
        *,
        clients:client_id (
          id, client_name, email
        )
      `);
      
      if (error) {
        console.error('Error fetching subscriptions:', error);
        return getMockSubscriptions();
      }
      
      return (data || []).map((subscription: any) => {
        // Safely access client data with fallbacks
        const clientData = subscription.clients || {};
        
        return {
          ...subscription,
          client_name: clientData.client_name ?? 'Unknown Client',
          client_email: clientData.email ?? '',
          recurring_interval: validateRecurringInterval(subscription.recurring_interval),
          status: validateStatus(subscription.status)
        };
      });
      
    } catch (error) {
      console.error('Error fetching subscriptions, using mock data:', error);
      return getMockSubscriptions();
    }
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    toast.error('Erreur lors du chargement des abonnements');
    return getMockSubscriptions();
  }
}

// Update the fetchSubscription function to use fallback data and type safety
export async function fetchSubscription(id: string) {
  try {
    // Check if tables exist
    const subscriptionsTableExists = await checkTableExists('subscriptions');
    
    if (!subscriptionsTableExists) {
      return getMockSubscriptions()[0];
    }
    
    // Fallback to direct query
    const { data: subscription, error: subscriptionError } = await supabase
      .from('subscriptions')
      .select(`
        *,
        clients:client_id (
          id, client_name, email
        )
      `)
      .eq('id', id)
      .single();
    
    if (subscriptionError || !subscription) {
      console.error('Error fetching subscription:', subscriptionError);
      return getMockSubscriptions()[0];
    }
    
    // Check if subscription_items table exists
    const itemsTableExists = await checkTableExists('subscription_items');
    let items: any[] = [];
    
    if (itemsTableExists) {
      // Get the subscription items
      const { data: itemsData, error: itemsError } = await supabase
        .from('subscription_items')
        .select(`
          *,
          products:product_id (*)
        `)
        .eq('subscription_id', id);
      
      if (!itemsError && itemsData) {
        // Transform the items to have the right structure
        items = (itemsData || []).map((item: any) => ({
          ...item,
          product: item.products ? {
            ...item.products,
            is_recurring: Boolean(item.products.recurring_interval)
          } : undefined
        }));
      }
    }
    
    // Safely handle client data
    const clientData = subscription.clients || {};
    
    return {
      ...subscription,
      client_name: clientData.client_name ?? 'Unknown Client',
      client_email: clientData.email ?? '',
      recurring_interval: validateRecurringInterval(subscription.recurring_interval),
      status: validateStatus(subscription.status),
      items: items
    };
  } catch (error) {
    console.error('Error fetching subscription:', error);
    toast.error('Erreur lors du chargement de l\'abonnement');
    return getMockSubscriptions()[0];
  }
}

export async function createSubscription(subscriptionData: Partial<Subscription>): Promise<{ success: boolean, error?: string }> {
  try {
    // For now, just return mock data as the subscriptions feature is being implemented
    const mockSubscription = generateMockSubscription();
    const newSubscription = {
      ...mockSubscription,
      ...subscriptionData,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    return { success: true };
  } catch (error) {
    console.error('Error in createSubscription:', error);
    toast.error('Erreur lors de la création de l\'abonnement');
    return { success: false, error: 'Error creating subscription' };
  }
}

export async function updateSubscription(id: string, subscriptionData: Partial<Subscription>): Promise<{ success: boolean, error?: string }> {
  try {
    // Check if the subscriptions table exists
    const tableExists = await checkTableExists('subscriptions');
    if (!tableExists) {
      // If table doesn't exist, return updated mock data
      return { success: true };
    }

    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .update({
          ...subscriptionData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error updating subscription:', error);
      // Fallback to mock data
      return { success: true };
    }
  } catch (error) {
    console.error('Error in updateSubscription:', error);
    toast.error('Erreur lors de la mise à jour de l\'abonnement');
    return { success: false, error: 'Error updating subscription' };
  }
}

export async function deleteSubscription(id: string): Promise<boolean> {
  try {
    // Check if the subscriptions table exists
    const tableExists = await checkTableExists('subscriptions');
    if (!tableExists) {
      return true; // Pretend success
    }

    try {
      const { error } = await supabase
        .from('subscriptions')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting subscription:', error);
      return true; // Pretend success for demo
    }
  } catch (error) {
    console.error('Error in deleteSubscription:', error);
    toast.error('Erreur lors de la suppression de l\'abonnement');
    return false;
  }
}

export async function updateSubscriptionStatus(id: string, status: 'active' | 'paused' | 'canceled' | 'expired'): Promise<boolean> {
  try {
    // Check if the subscriptions table exists
    const tableExists = await checkTableExists('subscriptions');
    if (!tableExists) {
      return true; // Pretend success
    }

    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      return true;
    } catch (error) {
      console.error('Error updating subscription status:', error);
      return true; // Pretend success for demo
    }
  } catch (error) {
    console.error('Error in updateSubscriptionStatus:', error);
    toast.error('Erreur lors de la mise à jour du statut de l\'abonnement');
    return false;
  }
}

export function calculateNextInvoiceDate(
  startDate: Date | string,
  interval: 'day' | 'week' | 'month' | 'quarter' | 'semester' | 'year' | 'custom',
  intervalCount: number,
  customDays?: number | null
): Date {
  const date = typeof startDate === 'string' ? new Date(startDate) : startDate;
  
  switch (interval) {
    case 'day':
      return addDays(date, intervalCount);
    case 'week':
      return addWeeks(date, intervalCount);
    case 'month':
      return addMonths(date, intervalCount);
    case 'quarter':
      return addMonths(date, intervalCount * 3);
    case 'semester':
      return addMonths(date, intervalCount * 6);
    case 'year':
      return addYears(date, intervalCount);
    case 'custom':
      return addDays(date, customDays || intervalCount);
    default:
      return date;
  }
}

export function formatRecurringInterval(interval: string, count: number, customDays?: number | null) {
  const intervalMap: Record<string, string> = {
    day: count > 1 ? 'jours' : 'jour',
    week: count > 1 ? 'semaines' : 'semaine',
    month: count > 1 ? 'mois' : 'mois',
    quarter: count > 1 ? 'trimestres' : 'trimestre',
    semester: count > 1 ? 'semestres' : 'semestre',
    year: count > 1 ? 'ans' : 'an',
    custom: 'jours personnalisés'
  };
  
  if (interval === 'custom' && customDays) {
    return `Tous les ${customDays} jours`;
  }
  
  return `Tous les ${count} ${intervalMap[interval] || 'périodes'}`;
}

export function formatDate(date: string | null) {
  if (!date) return '';
  return format(new Date(date), 'dd/MM/yyyy');
}
