
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { checkTableExists } from "@/utils/databaseTableUtils";

/**
 * Delete an invoice
 */
export async function deleteInvoice(id: string): Promise<boolean> {
  try {
    // Check if the invoices table exists
    const tableExists = await checkTableExists('invoices');
    
    if (!tableExists) {
      // Return a mock success for demo purposes
      console.log('Invoices table does not exist, returning mock success');
      return true;
    }
    
    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting invoice:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in deleteInvoice:', error);
    toast.error('Error deleting invoice');
    return false;
  }
}
