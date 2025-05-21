
import { supabase } from "@/integrations/supabase/client";
import { ReminderSchedule, ReminderTrigger } from "@/types/invoice";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

/**
 * Service to check for invoices that need reminders
 */
export async function checkOverdueInvoices() {
  try {
    // Use a mock response since we don't have the actual table structure yet
    return mockCheckOverdueInvoices();
  } catch (error) {
    console.error('Error checking overdue invoices:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error checking invoices',
      overdue: [],
      nearDue: [],
      overdueCount: 0,
      nearDueCount: 0
    };
  }
}

/**
 * Envoie un rappel pour une facture spécifique
 * @param invoiceId ID de la facture Stripe
 * @param reminderId ID du modèle de rappel (optionnel)
 */
export async function sendInvoiceReminder(invoiceId: string, reminderId?: string) {
  try {
    // Mock response since we don't have the actual function implementation
    return mockSendInvoiceReminder(invoiceId, reminderId);
  } catch (error) {
    console.error('Error sending invoice reminder:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error sending reminder'
    };
  }
}

/**
 * Récupère les planifications de relances automatiques de l'utilisateur
 */
export async function getReminderSchedules(): Promise<{
  success: boolean;
  schedules?: ReminderSchedule[];
  error?: string;
}> {
  try {
    // Return mock data instead of actual database queries
    return {
      success: true,
      schedules: mockReminderSchedules()
    };
  } catch (error) {
    console.error('Error fetching reminder schedules:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error fetching reminder schedules'
    };
  }
}

/**
 * Enregistre une planification de relance automatique
 */
export async function saveReminderSchedule(schedule: ReminderSchedule): Promise<{
  success: boolean;
  savedSchedule?: ReminderSchedule;
  error?: string;
}> {
  try {
    // Mock saving the schedule
    console.log("Saving reminder schedule:", schedule);
    
    // Return the schedule with an ID if it's a new one
    const savedSchedule = {
      ...schedule,
      id: schedule.id || uuidv4()
    };
    
    return {
      success: true,
      savedSchedule
    };
  } catch (error) {
    console.error('Error saving reminder schedule:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error saving reminder schedule'
    };
  }
}

/**
 * Supprime une planification de relance automatique
 */
export async function deleteReminderSchedule(scheduleId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // Mock deletion
    console.log("Deleting reminder schedule:", scheduleId);
    
    return {
      success: true
    };
  } catch (error) {
    console.error('Error deleting reminder schedule:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error deleting reminder schedule'
    };
  }
}

/**
 * Récupère l'historique des relances pour une facture
 */
export async function getInvoiceReminderHistory(invoiceId: string): Promise<{
  success: boolean;
  history?: any[];
  error?: string;
}> {
  try {
    // Mock reminder history
    return {
      success: true,
      history: mockReminderHistory(invoiceId)
    };
  } catch (error) {
    console.error('Error fetching reminder history:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error fetching reminder history'
    };
  }
}

// Mock functions
function mockCheckOverdueInvoices() {
  return {
    success: true,
    overdue: [
      { id: 'inv-001', invoice_number: 'INV-2023-001', client_name: 'ABC Company', amount: 1200, due_date: '2023-05-15' },
      { id: 'inv-002', invoice_number: 'INV-2023-002', client_name: 'XYZ Ltd', amount: 850, due_date: '2023-05-18' }
    ],
    nearDue: [
      { id: 'inv-003', invoice_number: 'INV-2023-003', client_name: 'PQR Inc', amount: 2400, due_date: '2023-06-01' }
    ],
    overdueCount: 2,
    nearDueCount: 1
  };
}

function mockSendInvoiceReminder(invoiceId: string, reminderId?: string) {
  return {
    success: true,
    data: {
      invoice_id: invoiceId,
      reminder_id: reminderId || null,
      sent_at: new Date().toISOString(),
      status: 'sent'
    }
  };
}

function mockReminderSchedules(): ReminderSchedule[] {
  return [
    {
      id: 'sched-001',
      name: 'Default Reminder Schedule',
      enabled: true,
      isDefault: true,
      triggers: [
        {
          id: 'trig-001',
          daysBefore: 3,
          message: 'Your invoice is due in 3 days',
          enabled: true,
          triggerType: 'days_before_due',
          triggerValue: 3,
          emailSubject: 'Invoice Reminder',
          emailBody: 'Your invoice is due in 3 days. Please make payment promptly.'
        },
        {
          id: 'trig-002',
          daysBefore: 0,
          message: 'Your invoice is due today',
          enabled: true,
          triggerType: 'days_before_due',
          triggerValue: 0,
          emailSubject: 'Invoice Due Today',
          emailBody: 'This is a reminder that your invoice is due today. Please make payment promptly.'
        }
      ]
    },
    {
      id: 'sched-002',
      name: 'Aggressive Reminder Schedule',
      enabled: false,
      isDefault: false,
      triggers: [
        {
          id: 'trig-003',
          daysBefore: 5,
          message: 'Early reminder for upcoming invoice',
          enabled: true,
          triggerType: 'days_before_due',
          triggerValue: 5,
          emailSubject: 'Early Invoice Reminder',
          emailBody: 'This is an early reminder about your upcoming invoice payment.'
        },
        {
          id: 'trig-004',
          daysBefore: 2,
          message: 'Second reminder for upcoming invoice',
          enabled: true,
          triggerType: 'days_before_due',
          triggerValue: 2,
          emailSubject: 'Second Invoice Reminder',
          emailBody: 'This is your second reminder about your upcoming invoice payment.'
        },
        {
          id: 'trig-005',
          daysBefore: -1,
          message: 'Your invoice is overdue',
          enabled: true,
          triggerType: 'days_after_due',
          triggerValue: 1,
          emailSubject: 'Invoice Overdue',
          emailBody: 'Your invoice is now overdue. Please make payment as soon as possible.'
        }
      ]
    }
  ];
}

function mockReminderHistory(invoiceId: string) {
  return [
    {
      id: `hist-${invoiceId}-001`,
      invoice_id: invoiceId,
      reminder_rule_id: 'trig-001',
      sent_at: new Date(Date.now() - 7 * 86400000).toISOString(), // 7 days ago
      status: 'sent',
      email_subject: 'Invoice Reminder',
      email_body: 'Your invoice is due in 3 days. Please make payment promptly.'
    },
    {
      id: `hist-${invoiceId}-002`,
      invoice_id: invoiceId,
      reminder_rule_id: 'trig-002',
      sent_at: new Date(Date.now() - 4 * 86400000).toISOString(), // 4 days ago
      status: 'sent',
      email_subject: 'Invoice Due Today',
      email_body: 'This is a reminder that your invoice is due today. Please make payment promptly.'
    }
  ];
}
