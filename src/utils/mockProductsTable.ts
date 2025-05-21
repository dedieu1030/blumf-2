
import { supabase } from '@/integrations/supabase/client';

// Function to check if products table exists and create it if not
export async function checkAndCreateProductsTable() {
  try {
    // First check if the table exists
    const { error } = await supabase.rpc('check_table_exists', { table_name: 'products' });
    
    if (error) {
      console.log('Creating products table as it does not exist yet');
      
      // Create the products table
      const { error: createError } = await supabase.rpc('create_products_table');
      
      if (createError) {
        console.error('Error creating products table:', createError);
      } else {
        console.log('Products table created successfully');
      }
    } else {
      console.log('Products table already exists');
    }
  } catch (err) {
    console.error('Error checking/creating products table:', err);
  }
}

// Function to check if product_categories table exists and create it if not
export async function checkAndCreateProductCategoriesTable() {
  try {
    // First check if the table exists
    const { error } = await supabase.rpc('check_table_exists', { table_name: 'product_categories' });
    
    if (error) {
      console.log('Creating product_categories table as it does not exist yet');
      
      // Create the product_categories table
      const { error: createError } = await supabase.rpc('create_product_categories_table');
      
      if (createError) {
        console.error('Error creating product_categories table:', createError);
      } else {
        console.log('Product categories table created successfully');
      }
    } else {
      console.log('Product categories table already exists');
    }
  } catch (err) {
    console.error('Error checking/creating product categories table:', err);
  }
}

// Initialize tables when this module is imported
export function initializeProductTables() {
  checkAndCreateProductsTable();
  checkAndCreateProductCategoriesTable();
}
