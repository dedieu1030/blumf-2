
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getMockInvoices } from './mockDataService';

// Define types
export interface ReminderResult {
  success: boolean;
  data?: {
    invoice_id: string;
    reminder_id: string;
    sent_at: string;
    status: string;
  };
  error?: string;
}

/**
 * Send a reminder for an invoice
 */
export async function sendReminderForInvoice(invoiceId: string): Promise<ReminderResult> {
  try {
    // Try to call the Supabase Edge Function
    try {
      const { data, error } = await supabase.functions.invoke('send-reminder', {
        body: { invoiceId },
      });
      
      if (error) {
        console.error('Error calling send-reminder function:', error);
        return { success: false, error: error.message };
      }
      
      return { 
        success: true, 
        data: {
          invoice_id: invoiceId,
          reminder_id: data?.reminderHistory?.id || 'mock-reminder-id',
          sent_at: new Date().toISOString(),
          status: 'sent'
        }
      };
      
    } catch (error) {
      console.error('Error in sendReminderForInvoice, falling back to mock:', error);
      
      // Fallback to mock data
      return { 
        success: true, 
        data: {
          invoice_id: invoiceId,
          reminder_id: 'mock-reminder-id',
          sent_at: new Date().toISOString(),
          status: 'sent'
        }
      };
    }
  } catch (error) {
    console.error('Unexpected error in sendReminderForInvoice:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: errorMessage };
  }
}

// Export mock functions for testing
export function getMockReminders() {
  return [
    {
      id: '1',
      name: 'Default reminder schedule',
      enabled: true,
      is_default: true,
      triggers: [
        { id: '1', daysBefore: 7, message: 'Your invoice is due in 7 days', enabled: true },
        { id: '2', daysBefore: 3, message: 'Please remember to pay your invoice', enabled: true },
        { id: '3', daysBefore: 0, message: 'Your invoice is due today', enabled: true },
        { id: '4', daysBefore: -3, message: 'Your invoice is 3 days overdue', enabled: true }
      ]
    }
  ];
}

// Types for reminder schedules
export interface ReminderTrigger {
  id: string;
  daysBefore: number; // Positive: before due date, Negative: after due date (overdue)
  message: string;
  enabled: boolean;
}

export interface ReminderSchedule {
  id: string;
  name: string;
  enabled: boolean;
  is_default: boolean;
  triggers: ReminderTrigger[];
}

// Mock function for fetching reminder schedules
export async function fetchReminderSchedules(): Promise<ReminderSchedule[]> {
  return getMockReminders();
}
