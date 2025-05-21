
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

// Function to create a product - using a mock implementation for now
export const createProduct = async (product: Partial<Product>): Promise<{ data: Product | null, error: any }> => {
  try {
    // For now, return a mock successful response since we don't have a products table yet
    const newProduct: Product = {
      id: uuidv4(),
      name: product.name || 'Unnamed Product',
      price: product.price || '0',
      is_recurring: product.is_recurring || false,
      price_cents: product.price_cents || 0,
      currency: product.currency || 'EUR',
      tax_rate: product.tax_rate || 0,
      product_type: product.product_type || 'product',
      active: product.active !== undefined ? product.active : true,
      category_id: product.category_id,
      description: product.description,
      recurring_interval: product.recurring_interval,
      recurring_period: product.recurring_period,
      recurring_interval_count: product.recurring_interval_count,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    console.log('Creating product:', newProduct);
    
    return { 
      data: newProduct,
      error: null
    };
  } catch (error) {
    console.error('Error creating product:', error);
    return {
      data: null,
      error
    };
  }
};

// Function to get all products - using a mock implementation for now
export const getProducts = async (): Promise<Product[]> => {
  console.log('Fetching products (mock)');
  // Return mock data for now
  return [];
};

// Alias for backward compatibility
export const fetchProducts = getProducts;

// Function to get all categories - using a mock implementation for now
export const getCategories = async (): Promise<ProductCategory[]> => {
  console.log('Fetching product categories (mock)');
  // Return mock data for now
  return [];
};

// Alias for backward compatibility
export const fetchCategories = getCategories;

// Function to create a category - using a mock implementation for now
export const createCategory = async (category: Omit<ProductCategory, 'id' | 'created_at'>): Promise<{ data: ProductCategory | null, error: any }> => {
  try {
    const newCategory: ProductCategory = {
      id: uuidv4(),
      name: category.name,
      color: category.color,
      created_at: new Date().toISOString()
    };
    
    console.log('Creating category:', newCategory);
    
    return {
      data: newCategory,
      error: null
    };
  } catch (error) {
    console.error('Error creating category:', error);
    return {
      data: null,
      error
    };
  }
};

// Function to update a category - using a mock implementation for now
export const updateCategory = async (id: string, category: Partial<ProductCategory>): Promise<{ data: ProductCategory | null, error: any }> => {
  try {
    // Mock updating a category
    const updatedCategory: ProductCategory = {
      id,
      name: category.name || 'Unnamed Category',
      color: category.color,
      created_at: new Date().toISOString()
    };
    
    console.log('Updating category:', updatedCategory);
    
    return {
      data: updatedCategory,
      error: null
    };
  } catch (error) {
    console.error('Error updating category:', error);
    return {
      data: null,
      error
    };
  }
};

// Function to update a product - using a mock implementation for now
export const updateProduct = async (id: string, product: Partial<Product>): Promise<{ data: Product | null, error: any }> => {
  try {
    // Mock updating a product
    const updatedProduct: Product = {
      id,
      name: product.name || 'Unnamed Product',
      description: product.description,
      price: product.price || '0',
      is_recurring: product.is_recurring || false,
      recurring_interval: product.recurring_interval,
      recurring_period: product.recurring_period,
      recurring_interval_count: product.recurring_interval_count,
      price_cents: product.price_cents,
      currency: product.currency || 'EUR',
      tax_rate: product.tax_rate,
      product_type: product.product_type,
      active: product.active !== undefined ? product.active : true,
      category_id: product.category_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    console.log('Updating product:', updatedProduct);
    
    return {
      data: updatedProduct,
      error: null
    };
  } catch (error) {
    console.error('Error updating product:', error);
    return {
      data: null,
      error
    };
  }
};

// Function to delete a product - using a mock implementation for now
export const deleteProduct = async (id: string): Promise<{ error: any }> => {
  console.log('Deleting product:', id);
  // Mock success
  return { error: null };
};

// Function to delete a category - using a mock implementation for now
export const deleteCategory = async (id: string): Promise<{ error: any }> => {
  console.log('Deleting category:', id);
  // Mock success
  return { error: null };
};
