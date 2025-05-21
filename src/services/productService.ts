
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: string; // We store prices as strings to handle currency formatting
  category?: string;
  category_name?: string;
  is_recurring: boolean;
  recurring_interval?: 'day' | 'week' | 'month' | 'year' | null;
  recurring_period?: number;
  recurring_interval_count?: number;
  price_cents?: number; // Added for compatibility with existing code
  currency?: string; // Added for compatibility with existing code
  tax_rate?: number; // Added for compatibility with existing code
  product_type?: 'product' | 'service' | null; // Added for compatibility with existing code
  active?: boolean; // Added for compatibility with existing code
  category_id?: string; // Added for compatibility with existing code
  metadata?: Record<string, any>; // Added for compatibility with existing code
  created_at?: string;
  updated_at?: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  color?: string;
  created_at?: string;
}

// Helper function to format price for display
export const formatPrice = (priceCents: number | undefined, currency = 'EUR'): string => {
  if (priceCents === undefined) return '0.00';
  
  const amount = (priceCents / 100).toFixed(2);
  
  return `${amount} ${currency}`;
};

// Function to create a product
export const createProduct = async (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<{ data: Product | null, error: any }> => {
  const { data, error } = await supabase
    .from('products')
    .insert({
      ...product,
      id: uuidv4(),
      price_cents: product.price_cents || (product.price ? parseInt((parseFloat(product.price) * 100).toString()) : 0)
    })
    .select('*')
    .single();

  return { 
    data: data as Product | null, 
    error 
  };
};

// Function to get all products
export const getProducts = async (): Promise<Product[]> => {
  try {
    // First create products table if it doesn't exist
    await checkAndCreateProductsTable();
    
    const { data, error } = await supabase
      .from('products')
      .select('*');

    if (error) {
      console.error('Error fetching products:', error);
      return [];
    }

    if (!data) return [];

    // Transform data to match Product interface
    return data.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description,
      price: ((item.price_cents || 0) / 100).toFixed(2),
      category: item.category_id,
      is_recurring: item.is_recurring || false,
      recurring_interval: item.recurring_interval,
      recurring_period: item.recurring_period,
      recurring_interval_count: item.recurring_interval_count,
      price_cents: item.price_cents,
      currency: item.currency,
      tax_rate: item.tax_rate,
      product_type: item.product_type,
      active: item.active !== undefined ? item.active : true,
      category_id: item.category_id,
      created_at: item.created_at,
      updated_at: item.updated_at,
    }));
  } catch (error) {
    console.error('Error in getProducts:', error);
    return [];
  }
};

// Alias for backward compatibility
export const fetchProducts = getProducts;

// Function to check if products table exists and create it if not
async function checkAndCreateProductsTable() {
  try {
    // Check if the table exists by trying to select from it
    const { error } = await supabase
      .from('products')
      .select('count(*)')
      .limit(1);
      
    // If the error indicates the table doesn't exist, create it
    if (error && error.message.includes('does not exist')) {
      await supabase.rpc('create_products_table');
      console.log('Products table created successfully');
    }
  } catch (err) {
    console.error('Error checking/creating products table:', err);
  }
}

// Function to get all categories
export const getCategories = async (): Promise<ProductCategory[]> => {
  const { data, error } = await supabase
    .from('product_categories')
    .select('*');

  if (error) {
    console.error('Error fetching product categories:', error);
    return [];
  }

  return (data || []) as ProductCategory[];
};

// Alias for backward compatibility
export const fetchCategories = getCategories;

// Function to create a category
export const createCategory = async (category: Omit<ProductCategory, 'id' | 'created_at'>): Promise<{ data: ProductCategory | null, error: any }> => {
  const { data, error } = await supabase
    .from('product_categories')
    .insert({
      ...category,
      id: uuidv4()
    })
    .select('*')
    .single();

  return { 
    data: data as ProductCategory | null, 
    error 
  };
};

// Function to update a category
export const updateCategory = async (id: string, category: Partial<ProductCategory>): Promise<{ data: ProductCategory | null, error: any }> => {
  const { data, error } = await supabase
    .from('product_categories')
    .update(category)
    .eq('id', id)
    .select('*')
    .single();

  return { 
    data: data as ProductCategory | null, 
    error 
  };
};

// Function to delete a product
export const deleteProduct = async (id: string): Promise<{ error: any }> => {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  return { error };
};

// Function to update a product
export const updateProduct = async (id: string, product: Partial<Product>): Promise<{ data: Product | null, error: any }> => {
  // Convert price string to cents for storage if price is provided
  const updates: any = { ...product };
  if (product.price) {
    updates.price_cents = parseInt((parseFloat(product.price) * 100).toString());
    delete updates.price;
  }

  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', id)
    .select('*')
    .single();

  // Transform back to our Product interface
  let transformedProduct: Product | null = null;
  if (data) {
    transformedProduct = {
      id: data.id,
      name: data.name,
      description: data.description,
      price: ((data.price_cents || 0) / 100).toFixed(2),
      category: data.category_id,
      is_recurring: data.is_recurring || false,
      recurring_interval: data.recurring_interval,
      recurring_period: data.recurring_period,
      recurring_interval_count: data.recurring_interval_count,
      price_cents: data.price_cents,
      currency: data.currency,
      tax_rate: data.tax_rate,
      product_type: data.product_type,
      active: data.active !== undefined ? data.active : true,
      category_id: data.category_id,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
  }

  return { 
    data: transformedProduct, 
    error 
  };
};

// Function to delete a category
export const deleteCategory = async (id: string): Promise<{ error: any }> => {
  const { error } = await supabase
    .from('product_categories')
    .delete()
    .eq('id', id);

  return { error };
};
