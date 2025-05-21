
import { supabase } from "@/integrations/supabase/client";

/**
 * Check if a table exists in the Supabase database
 */
export async function checkTableExists(tableName: string): Promise<boolean> {
  try {
    // Use system tables to check if the table exists
    const { data, error } = await supabase
      .from('pg_tables')
      .select('tablename')
      .eq('schemaname', 'public')
      .eq('tablename', tableName);
    
    if (error) {
      console.error(`Error checking if ${tableName} table exists:`, error);
      return false;
    }
    
    return (data?.length || 0) > 0;
  } catch (error) {
    console.error(`Error in checkTableExists for ${tableName}:`, error);
    return false;
  }
}

/**
 * Check if RPC function exists
 */
export async function checkRpcFunctionExists(functionName: string): Promise<boolean> {
  try {
    // Try to execute a small query that should return success if the function exists
    const { data, error } = await supabase.rpc('pg_function_exists', {
      function_name: functionName,
      schema_name: 'public'
    });
    
    if (error) {
      console.error(`Error checking if RPC function ${functionName} exists:`, error);
      return false;
    }
    
    return !!data;
  } catch (error) {
    console.error(`Error in checkRpcFunctionExists for ${functionName}:`, error);
    return false;
  }
}
