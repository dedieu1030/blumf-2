
import { Subscription, SubscriptionItem } from "@/types/subscription";
import { v4 as uuidv4 } from 'uuid';
import { addDays, addMonths } from 'date-fns';

/**
 * Generate a mock subscription
 */
export function generateMockSubscription(): Subscription {
  const id = uuidv4();
  const now = new Date();
  
  return {
    id,
    name: `Abonnement ${id.substring(0, 5)}`,
    description: 'Description de l\'abonnement',
    client_id: uuidv4(),
    client_name: 'Client Exemple',
    client_email: 'client@example.com',
    start_date: now.toISOString(),
    end_date: addMonths(now, 12).toISOString(),
    recurring_interval: 'month',
    recurring_interval_count: 1,
    next_invoice_date: addDays(now, 30).toISOString(),
    last_invoice_date: null,
    status: 'active',
    metadata: null,
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
    items: [
      {
        id: uuidv4(),
        subscription_id: id,
        product_id: uuidv4(),
        quantity: 1,
        unit_price: 99.99,
        description: 'Produit Exemple',
        created_at: now.toISOString(),
        updated_at: now.toISOString()
      }
    ]
  };
}

/**
 * Get mock subscriptions
 */
export function getMockSubscriptions(): Subscription[] {
  return [
    generateMockSubscription(),
    generateMockSubscription(),
    generateMockSubscription()
  ];
}
