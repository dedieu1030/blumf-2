import { v4 as uuidv4 } from 'uuid';
import { checkTableExists } from '@/utils/databaseTableUtils';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types/product';

// Fetch all products
export async function fetchProducts(): Promise<Product[]> {
  try {
    const tableExists = await checkTableExists('products');
    
    if (!tableExists) {
      // Return mock data for demo purposes
      return [
        {
          id: '1',
          name: 'Développement web',
          description: 'Services de développement de site web',
          price: 1200,
          category: 'Services',
          sku: 'DEV-WEB-001',
          tax_rate: 20,
          created_at: '2023-05-10T08:00:00Z',
          updated_at: '2023-05-10T08:00:00Z',
          active: true
        },
        {
          id: '2',
          name: 'Maintenance mensuelle',
          description: 'Service de maintenance de site web',
          price: 250,
          category: 'Abonnements',
          sku: 'MAINT-001',
          tax_rate: 20,
          created_at: '2023-05-15T10:30:00Z',
          updated_at: '2023-05-15T10:30:00Z',
          active: true
        }
      ];
    }
    
    // If table exists, fetch actual data
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Error fetching products:", error);
      return [];
    }
    
    return data.map(product => ({
      ...product,
      price: typeof product.price === 'string' ? parseFloat(product.price) : product.price
    })) as Product[];
  } catch (error) {
    console.error("Error in fetchProducts:", error);
    return [];
  }
}

// Get product by ID
export async function getProduct(id: string): Promise<Product | null> {
  try {
    const tableExists = await checkTableExists('products');

    if (!tableExists) {
      // Return mock data for demo
      const mockProducts = await fetchProducts();
      return mockProducts.find(product => product.id === id) || null;
    }

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error("Error fetching product:", error);
      return null;
    }

    return {
      ...data,
      price: typeof data.price === 'string' ? parseFloat(data.price) : data.price
    } as Product;
  } catch (error) {
    console.error("Error in getProduct:", error);
    return null;
  }
}

// Create a new product
export async function createProduct(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<{ data: Product | null, error: any }> {
  try {
    const tableExists = await checkTableExists('products');

    if (!tableExists) {
      console.log('Products table does not exist, returning mock success');
      const mockProduct: Product = {
        id: uuidv4(),
        ...product,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as Product;
      return { data: mockProduct, error: null };
    }

    const newProduct: Product = {
      id: uuidv4(),
      ...product,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as Product;

    const { data, error } = await supabase
      .from('products')
      .insert([newProduct])
      .select()
      .single();

    if (error) {
      console.error("Error creating product:", error);
      return { data: null, error };
    }

    return { data: data as Product, error: null };
  } catch (error) {
    console.error("Error in createProduct:", error);
    return { data: null, error: error };
  }
}

// Update an existing product
export async function updateProduct(id: string, updates: Partial<Omit<Product, 'id' | 'created_at' | 'updated_at'>>): Promise<{ data: Product | null, error: any }> {
  try {
    const tableExists = await checkTableExists('products');

    if (!tableExists) {
      console.log('Products table does not exist, returning mock success');
      const mockProduct: Product = {
        id,
        ...updates,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as Product;
      return { data: mockProduct, error: null };
    }

    const { data, error } = await supabase
      .from('products')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error("Error updating product:", error);
      return { data: null, error };
    }

    return { data: data as Product, error: null };
  } catch (error) {
    console.error("Error in updateProduct:", error);
    return { data: null, error: error };
  }
}

// Delete a product
export async function deleteProduct(id: string): Promise<boolean> {
  try {
    const tableExists = await checkTableExists('products');

    if (!tableExists) {
      console.log('Products table does not exist, returning mock success');
      return true;
    }

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Error deleting product:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in deleteProduct:", error);
    return false;
  }
}

// Interface for product category
export interface ProductCategory {
  id: string;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

// Fetch all categories
export async function getCategories(): Promise<ProductCategory[]> {
  try {
    const tableExists = await checkTableExists('product_categories');
    
    if (!tableExists) {
      // Return mock data for demo purposes
      return [
        {
          id: '1',
          name: 'Services',
          description: 'Services informatiques et de développement',
          created_at: '2023-05-10T08:00:00Z',
          updated_at: '2023-05-10T08:00:00Z'
        },
        {
          id: '2',
          name: 'Produits',
          description: 'Produits physiques',
          created_at: '2023-05-15T10:30:00Z',
          updated_at: '2023-05-15T10:30:00Z'
        },
        {
          id: '3',
          name: 'Abonnements',
          description: 'Services récurrents et abonnements',
          created_at: '2023-05-20T14:20:00Z',
          updated_at: '2023-05-20T14:20:00Z'
        }
      ];
    }
    
    // If table exists, fetch actual data
    const { data, error } = await supabase
      .from('product_categories')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) {
      console.error("Error fetching categories:", error);
      return [];
    }
    
    return data as ProductCategory[];
  } catch (error) {
    console.error("Error in getCategories:", error);
    return [];
  }
}

// Create a new category
export async function createCategory(category: Omit<ProductCategory, 'id' | 'created_at' | 'updated_at'>): Promise<{ data: ProductCategory | null, error: any }> {
  try {
    const tableExists = await checkTableExists('product_categories');

    if (!tableExists) {
      console.log('Product categories table does not exist, returning mock success');
      const mockCategory: ProductCategory = {
        id: uuidv4(),
        ...category,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      return { data: mockCategory, error: null };
    }

    const newCategory = {
      id: uuidv4(),
      ...category,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('product_categories')
      .insert([newCategory])
      .select()
      .single();

    if (error) {
      console.error("Error creating category:", error);
      return { data: null, error };
    }

    return { data: data as ProductCategory, error: null };
  } catch (error) {
    console.error("Error in createCategory:", error);
    return { data: null, error: error };
  }
}

// Update an existing category
export async function updateCategory(id: string, updates: Partial<Omit<ProductCategory, 'id' | 'created_at' | 'updated_at'>>): Promise<{ data: ProductCategory | null, error: any }> {
  try {
    const tableExists = await checkTableExists('product_categories');

    if (!tableExists) {
      console.log('Product categories table does not exist, returning mock success');
      return { data: { id, ...updates } as ProductCategory, error: null };
    }

    const { data, error } = await supabase
      .from('product_categories')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error("Error updating category:", error);
      return { data: null, error };
    }

    return { data: data as ProductCategory, error: null };
  } catch (error) {
    console.error("Error in updateCategory:", error);
    return { data: null, error: error };
  }
}

// Delete a category
export async function deleteCategory(id: string): Promise<boolean> {
  try {
    const tableExists = await checkTableExists('product_categories');

    if (!tableExists) {
      console.log('Product categories table does not exist, returning mock success');
      return true;
    }

    const { error } = await supabase
      .from('product_categories')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Error deleting category:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in deleteCategory:", error);
    return false;
  }
}

// Format price for display
export function formatPrice(price: number, currency: string = 'EUR'): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency
  }).format(price);
}

// Alias for fetchProducts for compatibility with existing code
export const getProducts = fetchProducts;
