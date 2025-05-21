
import { Subscription } from './subscriptionService';
import { v4 as uuidv4 } from 'uuid';
import { addDays } from 'date-fns';

export function getMockSubscriptions(): Subscription[] {
  const now = new Date();
  return [
    {
      id: uuidv4(),
      name: "Abonnement juridique mensuel",
      description: "Consultations juridiques mensuelles",
      client_id: "client-1",
      client_name: "Jean Dupont",
      client_email: "jean.dupont@example.com",
      start_date: now.toISOString(),
      end_date: null,
      recurring_interval: "month",
      recurring_interval_count: 1,
      next_invoice_date: addDays(now, 30).toISOString(),
      last_invoice_date: null,
      status: "active",
      metadata: null,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
      items: [
        {
          id: uuidv4(),
          subscription_id: "sub-1",
          product_id: "prod-1",
          quantity: 1,
          price_cents: 15000,
          tax_rate: 20,
          created_at: now.toISOString(),
          updated_at: now.toISOString(),
        }
      ]
    },
    {
      id: uuidv4(),
      name: "Abonnement conseil fiscal trimestriel",
      description: "Services de conseil fiscal",
      client_id: "client-2",
      client_name: "Marie Martin",
      client_email: "marie.martin@example.com",
      start_date: now.toISOString(),
      end_date: null,
      recurring_interval: "quarter",
      recurring_interval_count: 1,
      next_invoice_date: addDays(now, 90).toISOString(),
      last_invoice_date: null,
      status: "active",
      metadata: null,
      created_at: now.toISOString(),
      updated_at: now.toISOString()
    }
  ];
}

export function generateMockSubscription(): Subscription {
  const now = new Date();
  return {
    id: uuidv4(),
    name: "Nouvel abonnement",
    description: "Description de l'abonnement",
    client_id: "client-1",
    client_name: "Client Test",
    client_email: "client@example.com",
    start_date: now.toISOString(),
    end_date: null,
    recurring_interval: "month",
    recurring_interval_count: 1,
    next_invoice_date: addDays(now, 30).toISOString(),
    last_invoice_date: null,
    status: "active",
    metadata: null,
    created_at: now.toISOString(),
    updated_at: now.toISOString()
  };
}
