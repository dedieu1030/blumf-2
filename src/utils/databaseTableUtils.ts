
import { supabase } from '@/integrations/supabase/client';

/**
 * Helper function to check if a table exists in the database
 * @param tableName The name of the table to check
 * @returns Promise<boolean> True if the table exists, false otherwise
 */
export async function checkTableExists(tableName: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);
    
    if (error) {
      // If the error message indicates the table doesn't exist
      if (error.message.includes('does not exist') || 
          error.message.includes('relation') || 
          error.message.includes('not found')) {
        return false;
      }
      
      // For other types of errors, log them but assume the table might exist
      console.warn(`Error checking if table ${tableName} exists:`, error);
    }
    
    return true;
  } catch (error) {
    console.error(`Error checking if table ${tableName} exists:`, error);
    return false;
  }
}

/**
 * Creates a mock object with fallbacks for common database errors
 * @param mockData The mock data to use as fallback
 * @returns An object with database-like properties and the mock data
 */
export function createMockQueryResult<T>(mockData: T[]) {
  return {
    data: mockData,
    count: mockData.length,
    error: null
  };
}
