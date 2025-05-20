
import { supabase } from '@/integrations/supabase/client';
import { Quote, QuoteItem } from '@/types/invoice';

export async function fetchQuotes(): Promise<Quote[]> {
  const { data, error } = await supabase
    .from('devis')
    .select(`
      *,
      client:clients (id, client_name)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching quotes:', error);
    throw error;
  }

  return data || [];
}

export async function fetchQuoteById(id: string): Promise<Quote | null> {
  const { data, error } = await supabase
    .from('devis')
    .select(`
      *,
      client:clients (id, client_name)
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Error fetching quote ${id}:`, error);
    throw error;
  }

  // Also fetch quote items
  const { data: items, error: itemsError } = await supabase
    .from('devis_items')
    .select('*')
    .eq('quote_id', id);

  if (itemsError) {
    console.error(`Error fetching items for quote ${id}:`, itemsError);
    throw itemsError;
  }

  return {
    ...data,
    items: items || []
  };
}

export async function createQuote(quote: Partial<Quote>, items: Partial<QuoteItem>[]): Promise<Quote> {
  // Insert the quote first
  const { data: quoteData, error: quoteError } = await supabase
    .from('devis')
    .insert({
      quote_number: quote.quote_number,
      client_id: quote.client_id,
      company_id: quote.company_id,
      issue_date: quote.issue_date,
      validity_date: quote.validity_date,
      execution_date: quote.execution_date,
      status: quote.status || 'draft',
      subtotal: quote.subtotal || 0,
      tax_amount: quote.tax_amount || 0,
      total_amount: quote.total_amount || 0,
      notes: quote.notes,
      customizations: quote.customizations
    })
    .select()
    .single();

  if (quoteError) {
    console.error('Error creating quote:', quoteError);
    throw quoteError;
  }

  // If we have items, insert them too
  if (items?.length > 0) {
    const itemsWithQuoteId = items.map(item => ({
      ...item,
      quote_id: quoteData.id
    }));

    const { error: itemsError } = await supabase
      .from('devis_items')
      .insert(itemsWithQuoteId);

    if (itemsError) {
      console.error('Error creating quote items:', itemsError);
      // Consider rolling back the quote insert or just warning the user
      console.warn('Quote created but items failed to insert');
    }
  }

  return quoteData;
}

export async function updateQuote(id: string, quote: Partial<Quote>): Promise<Quote> {
  const { data, error } = await supabase
    .from('devis')
    .update({
      quote_number: quote.quote_number,
      client_id: quote.client_id,
      issue_date: quote.issue_date,
      validity_date: quote.validity_date,
      execution_date: quote.execution_date,
      status: quote.status,
      subtotal: quote.subtotal,
      tax_amount: quote.tax_amount,
      total_amount: quote.total_amount,
      notes: quote.notes,
      customizations: quote.customizations
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating quote ${id}:`, error);
    throw error;
  }

  return data;
}

export async function deleteQuote(id: string): Promise<void> {
  // Delete associated items first (cascade should handle this, but just to be safe)
  await supabase
    .from('devis_items')
    .delete()
    .eq('quote_id', id);

  const { error } = await supabase
    .from('devis')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Error deleting quote ${id}:`, error);
    throw error;
  }
}

export async function updateQuoteItems(quoteId: string, items: Partial<QuoteItem>[]): Promise<void> {
  // First delete all existing items
  const { error: deleteError } = await supabase
    .from('devis_items')
    .delete()
    .eq('quote_id', quoteId);

  if (deleteError) {
    console.error(`Error deleting items for quote ${quoteId}:`, deleteError);
    throw deleteError;
  }

  // Then insert all new/updated items
  if (items.length > 0) {
    const itemsWithQuoteId = items.map(item => ({
      ...item,
      quote_id: quoteId
    }));

    const { error: insertError } = await supabase
      .from('devis_items')
      .insert(itemsWithQuoteId);

    if (insertError) {
      console.error(`Error inserting items for quote ${quoteId}:`, insertError);
      throw insertError;
    }
  }
}

export function generateQuoteNumber(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const randomDigits = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `Q-${year}${month}-${randomDigits}`;
}
