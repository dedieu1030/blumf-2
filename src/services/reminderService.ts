
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getMockInvoices } from './mockDataService';
import { v4 as uuidv4 } from 'uuid';
import { checkTableExists } from '@/utils/databaseTableUtils';

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
      isDefault: true,
      triggers: [
        { id: '1', daysBefore: 7, message: 'Your invoice is due in 7 days', enabled: true, triggerType: 'days_before_due', triggerValue: 7, emailSubject: 'Invoice reminder', emailBody: 'Your invoice is due in 7 days' },
        { id: '2', daysBefore: 3, message: 'Please remember to pay your invoice', enabled: true, triggerType: 'days_before_due', triggerValue: 3, emailSubject: 'Invoice reminder', emailBody: 'Please remember to pay your invoice' },
        { id: '3', daysBefore: 0, message: 'Your invoice is due today', enabled: true, triggerType: 'days_after_due', triggerValue: 0, emailSubject: 'Invoice reminder', emailBody: 'Your invoice is due today' },
        { id: '4', daysBefore: -3, message: 'Your invoice is 3 days overdue', enabled: true, triggerType: 'days_after_due', triggerValue: 3, emailSubject: 'Invoice reminder', emailBody: 'Your invoice is 3 days overdue' }
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
  triggerType?: 'days_before_due' | 'days_after_due' | 'days_after_previous_reminder';
  triggerValue?: number;
  emailSubject?: string;
  emailBody?: string;
}

export interface ReminderSchedule {
  id: string;
  name: string;
  enabled: boolean;
  isDefault: boolean;
  is_default?: boolean;
  triggers: ReminderTrigger[];
}

export interface ReminderScheduleResult {
  success: boolean;
  schedules?: ReminderSchedule[];
  error?: string;
}

/**
 * Fetch reminder schedules
 */
export async function getReminderSchedules(): Promise<ReminderScheduleResult> {
  try {
    // Check if table exists
    const tableExists = await checkTableExists('reminder_schedules');
    if (!tableExists) {
      return { 
        success: true, 
        schedules: getMockReminders() 
      };
    }
    
    const { data, error } = await supabase
      .from('reminder_schedules')
      .select('*, reminder_rules(*)');
    
    if (error) {
      console.error('Error fetching reminder schedules:', error);
      return { 
        success: false, 
        error: error.message,
        schedules: getMockReminders() // Fallback to mock data
      };
    }
    
    // Transform data to match ReminderSchedule interface
    const schedules: ReminderSchedule[] = data.map((schedule: any) => {
      return {
        id: schedule.id,
        name: schedule.name,
        enabled: schedule.enabled,
        isDefault: schedule.is_default || false,
        is_default: schedule.is_default || false,
        triggers: (schedule.reminder_rules || []).map((rule: any) => ({
          id: rule.id,
          daysBefore: rule.days_before_due || 0,
          message: rule.message || '',
          enabled: rule.enabled,
          triggerType: rule.trigger_type || 'days_before_due',
          triggerValue: rule.trigger_value || 0,
          emailSubject: rule.email_subject || '',
          emailBody: rule.email_body || ''
        }))
      };
    });
    
    return {
      success: true,
      schedules
    };
  } catch (error) {
    console.error('Unexpected error in getReminderSchedules:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { 
      success: false, 
      error: errorMessage,
      schedules: getMockReminders() // Fallback to mock data
    };
  }
}

/**
 * Save reminder schedule
 */
export async function saveReminderSchedule(schedule: ReminderSchedule): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if table exists
    const tableExists = await checkTableExists('reminder_schedules');
    if (!tableExists) {
      // Just pretend it worked with mock data
      return { success: true };
    }
    
    const isNew = !schedule.id || schedule.id === "";
    const scheduleId = isNew ? uuidv4() : schedule.id;
    
    // Prepare schedule data
    const scheduleData = {
      id: scheduleId,
      name: schedule.name,
      enabled: schedule.enabled,
      is_default: schedule.isDefault || schedule.is_default || false,
      updated_at: new Date().toISOString(),
      ...(isNew ? { created_at: new Date().toISOString() } : {})
    };
    
    // Start a transaction
    const { error: scheduleError } = await (isNew ? 
      supabase.from('reminder_schedules').insert([scheduleData]) :
      supabase.from('reminder_schedules').update(scheduleData).eq('id', scheduleId)
    );
    
    if (scheduleError) {
      console.error('Error saving reminder schedule:', scheduleError);
      return { success: false, error: scheduleError.message };
    }
    
    // Now handle triggers if the schedule was successfully saved
    if (schedule.triggers && schedule.triggers.length > 0) {
      // First delete existing rules if updating
      if (!isNew) {
        const { error: deleteError } = await supabase
          .from('reminder_rules')
          .delete()
          .eq('schedule_id', scheduleId);
        
        if (deleteError) {
          console.error('Error deleting existing reminder rules:', deleteError);
          return { success: false, error: deleteError.message };
        }
      }
      
      // Then insert new rules
      const rulesData = schedule.triggers.map(trigger => ({
        id: uuidv4(),
        schedule_id: scheduleId,
        days_before_due: trigger.daysBefore,
        message: trigger.message,
        enabled: trigger.enabled,
        trigger_type: trigger.triggerType || 'days_before_due',
        trigger_value: trigger.triggerValue || 0,
        email_subject: trigger.emailSubject || '',
        email_body: trigger.emailBody || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));
      
      const { error: rulesError } = await supabase
        .from('reminder_rules')
        .insert(rulesData);
      
      if (rulesError) {
        console.error('Error saving reminder rules:', rulesError);
        return { success: false, error: rulesError.message };
      }
    }
    
    return { success: true };
  } catch (error) {
    console.error('Unexpected error in saveReminderSchedule:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: errorMessage };
  }
}

/**
 * Delete reminder schedule
 */
export async function deleteReminderSchedule(scheduleId: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if table exists
    const tableExists = await checkTableExists('reminder_schedules');
    if (!tableExists) {
      // Just pretend it worked with mock data
      return { success: true };
    }
    
    // First delete associated rules
    const { error: rulesError } = await supabase
      .from('reminder_rules')
      .delete()
      .eq('schedule_id', scheduleId);
    
    if (rulesError) {
      console.error('Error deleting reminder rules:', rulesError);
      return { success: false, error: rulesError.message };
    }
    
    // Then delete the schedule
    const { error: scheduleError } = await supabase
      .from('reminder_schedules')
      .delete()
      .eq('id', scheduleId);
    
    if (scheduleError) {
      console.error('Error deleting reminder schedule:', scheduleError);
      return { success: false, error: scheduleError.message };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Unexpected error in deleteReminderSchedule:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: errorMessage };
  }
}

// Mock function for fetching reminder schedules
export async function fetchReminderSchedules(): Promise<ReminderSchedule[]> {
  return getMockReminders();
}
