import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category_id?: string;
  sku?: string;
  tax_rate?: number;
  active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  color?: string;
  created_at?: string;
  updated_at?: string;
}

// Alias for backwards compatibility
export const getCategories = async (): Promise<ProductCategory[]> => {
  // Implementation of getCategories
  try {
    const { data, error } = await supabase
      .from('product_categories')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getCategories:', error);
    return [];
  }
};

// Alias for backwards compatibility
export const fetchCategories = getCategories;

// Function to fetch all products
export async function fetchProducts(): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('name');
      
    if (error) {
      console.error('Error fetching products:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in fetchProducts:', error);
    return [];
  }
}

// Function to fetch a single product by ID
export async function fetchProductById(id: string): Promise<Product | null> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) {
      console.error(`Error fetching product ${id}:`, error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error in fetchProductById:', error);
    return null;
  }
}

// Function to create a new product
export async function createProduct(productData: Partial<Product>): Promise<{ success: boolean; error?: string; id?: string }> {
  try {
    const id = uuidv4();
    const now = new Date().toISOString();
    
    const productToInsert = {
      ...productData,
      id,
      created_at: now,
      updated_at: now
    };
    
    const { error } = await supabase
      .from('products')
      .insert(productToInsert);
      
    if (error) {
      console.error('Error creating product:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true, id };
  } catch (error) {
    console.error('Error in createProduct:', error);
    return { success: false, error: 'Une erreur inattendue est survenue' };
  }
}

// Function to update an existing product
export async function updateProduct(id: string, productData: Partial<Product>): Promise<{ success: boolean; error?: string }> {
  try {
    const now = new Date().toISOString();
    
    const productToUpdate = {
      ...productData,
      updated_at: now
    };
    
    const { error } = await supabase
      .from('products')
      .update(productToUpdate)
      .eq('id', id);
      
    if (error) {
      console.error('Error updating product:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error in updateProduct:', error);
    return { success: false, error: 'Une erreur inattendue est survenue' };
  }
}

// Function to delete a product
export async function deleteProduct(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
      
    if (error) {
      console.error('Error deleting product:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error in deleteProduct:', error);
    return { success: false, error: 'Une erreur inattendue est survenue' };
  }
}

// Function to create a new category
export async function createCategory(categoryData: Partial<ProductCategory>): Promise<{ success: boolean; error?: string; id?: string }> {
  try {
    const id = uuidv4();
    const now = new Date().toISOString();
    
    const categoryToInsert = {
      ...categoryData,
      id,
      created_at: now,
      updated_at: now
    };
    
    const { error } = await supabase
      .from('product_categories')
      .insert(categoryToInsert);
      
    if (error) {
      console.error('Error creating category:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true, id };
  } catch (error) {
    console.error('Error in createCategory:', error);
    return { success: false, error: 'Une erreur inattendue est survenue' };
  }
}

// Function to update an existing category
export async function updateCategory(id: string, categoryData: Partial<ProductCategory>): Promise<{ success: boolean; error?: string }> {
  try {
    const now = new Date().toISOString();
    
    const categoryToUpdate = {
      ...categoryData,
      updated_at: now
    };
    
    const { error } = await supabase
      .from('product_categories')
      .update(categoryToUpdate)
      .eq('id', id);
      
    if (error) {
      console.error('Error updating category:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error in updateCategory:', error);
    return { success: false, error: 'Une erreur inattendue est survenue' };
  }
}

// Function to delete a category
export async function deleteCategory(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('product_categories')
      .delete()
      .eq('id', id);
      
    if (error) {
      console.error('Error deleting category:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error in deleteCategory:', error);
    return { success: false, error: 'Une erreur inattendue est survenue' };
  }
}
