
import { supabase } from '@/integrations/supabase/client';

// Function to check if notifications table exists and create it if not
export async function checkAndCreateNotificationsTable() {
  try {
    // First check if the table exists
    const { data, error } = await supabase
      .from('notifications')
      .select('count(*)', { count: 'exact', head: true });
    
    if (error && error.code === '42P01') {
      console.log('Creating notifications table as it does not exist yet');
      
      try {
        // Use raw SQL to create the table
        const { error: createError } = await supabase.rpc('create_notifications_table');
        
        if (createError) {
          console.error('Error creating notifications table with RPC:', createError);
          console.log('Table creation will be handled by backend services');
        } else {
          console.log('Notifications table created successfully');
        }
      } catch (err) {
        console.error('Cannot create notifications table, will be handled by backend:', err);
      }
    } else {
      console.log('Notifications table exists or another error occurred');
    }
  } catch (err) {
    console.error('Error checking/creating notifications table:', err);
  }
}

// Function to check if reminder_schedules table exists
export async function checkReminderTables() {
  try {
    // Check if the tables exist
    const { data, error } = await supabase
      .from('reminder_schedules')
      .select('count(*)', { count: 'exact', head: true });
    
    if (error && error.code === '42P01') {
      console.log('Reminder tables do not exist yet, will be handled by backend services');
    } else {
      console.log('Reminder tables exist or another error occurred');
    }
  } catch (err) {
    console.error('Error checking reminder tables:', err);
  }
}

// Function to check if products table exists
export async function checkProductTables() {
  try {
    // Check if the tables exist
    const { data, error } = await supabase
      .from('products')
      .select('count(*)', { count: 'exact', head: true });
    
    if (error && error.code === '42P01') {
      console.log('Product tables do not exist yet, will be handled by backend services');
    } else {
      console.log('Product tables exist or another error occurred');
    }
  } catch (err) {
    console.error('Error checking product tables:', err);
  }
}

// Function to check if subscriptions table exists
export async function checkSubscriptionTables() {
  try {
    // Check if the tables exist
    const { data, error } = await supabase
      .from('subscriptions')
      .select('count(*)', { count: 'exact', head: true });
    
    if (error && error.code === '42P01') {
      console.log('Subscription tables do not exist yet, will be handled by backend services');
    } else {
      console.log('Subscription tables exist or another error occurred');
    }
  } catch (err) {
    console.error('Error checking subscription tables:', err);
  }
}

// Initialize all required tables
export function initializeTables() {
  checkAndCreateNotificationsTable();
  checkReminderTables();
  checkProductTables();
  checkSubscriptionTables();
}

// Create a helper for mocking database records when tables don't exist
export function getMockResponse<T>(mockData: T): T {
  return mockData;
}
