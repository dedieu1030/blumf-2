
import { v4 as uuidv4 } from 'uuid';
import { Invoice } from '@/types/invoice';

export function getMockClients() {
  return [
    {
      id: uuidv4(),
      client_name: "Entreprise ABC",
      email: "contact@abc.com",
      phone: "+33123456789",
      address: "123 Rue de Paris, 75001 Paris",
      notes: "Client important"
    },
    {
      id: uuidv4(),
      client_name: "Martin Dupont",
      email: "martin@example.com",
      phone: "+33698765432",
      address: "45 Avenue des Champs-Élysées, 75008 Paris",
      notes: "Particulier"
    }
  ];
}

export function getMockInvoices(): Invoice[] {
  const now = new Date();
  const oneWeekLater = new Date();
  oneWeekLater.setDate(now.getDate() + 7);
  
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(now.getDate() - 7);
  
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(now.getMonth() - 1);
  
  const clients = getMockClients();
  
  return [
    {
      id: uuidv4(),
      invoice_number: "INV-2023-001",
      client_id: clients[0].id,
      client_name: clients[0].client_name,
      client: {
        id: clients[0].id,
        client_name: clients[0].client_name
      },
      amount: "1500.00",
      date: now.toISOString(),
      due_date: oneWeekLater.toISOString(),
      status: "pending"
    },
    {
      id: uuidv4(),
      invoice_number: "INV-2023-002",
      client_id: clients[1].id,
      client_name: clients[1].client_name,
      client: {
        id: clients[1].id,
        client_name: clients[1].client_name
      },
      amount: "750.00",
      date: oneWeekAgo.toISOString(),
      due_date: now.toISOString(),
      status: "paid",
      paid_date: now.toISOString()
    },
    {
      id: uuidv4(),
      invoice_number: "INV-2023-003",
      client_id: clients[0].id,
      client_name: clients[0].client_name,
      client: {
        id: clients[0].id,
        client_name: clients[0].client_name
      },
      amount: "2200.00",
      date: oneMonthAgo.toISOString(),
      due_date: oneWeekAgo.toISOString(),
      status: "overdue"
    }
  ];
}

export function getMockOverdueInvoices(): Invoice[] {
  return getMockInvoices().filter(invoice => invoice.status === "overdue");
}

export function getMockRecentInvoices(): Invoice[] {
  return getMockInvoices().slice(0, 2);
}
