
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import { ClientSelector } from "@/components/ClientSelector";
import { Client } from "@/types/user";
import { supabase } from "@/integrations/supabase/client";

export interface QuoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editQuoteId: string | null;
  onSuccess?: () => void;
}

export function QuoteDialog({ open, onOpenChange, editQuoteId, onSuccess }: QuoteDialogProps) {
  const [quoteNumber, setQuoteNumber] = useState("");
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [validityDate, setValidityDate] = useState("");
  const [executionDate, setExecutionDate] = useState("");
  const [status, setStatus] = useState("draft");
  const [clientId, setClientId] = useState("");
  const [clientName, setClientName] = useState("");
  const [notes, setNotes] = useState("");
  const [quoteItems, setQuoteItems] = useState<Array<{
    id: string;
    description: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editQuoteId && open) {
      setIsLoading(true);
      fetchQuoteById(editQuoteId).then((quote) => {
        if (!quote) return;
        
        setQuoteNumber(quote.quote_number || "");
        setIssueDate(quote.issue_date || new Date().toISOString().split('T')[0]);
        setValidityDate(quote.validity_date || "");
        setExecutionDate(quote.execution_date || "");
        setStatus(quote.status || "draft");
        setClientId(quote.client_id || "");
        
        if (quote.client) {
          setClientName(quote.client.client_name || "");
        }
        
        setNotes(quote.notes || "");
        
        // Set items if available
        if (quote.items && Array.isArray(quote.items) && quote.items.length > 0) {
          setQuoteItems(quote.items.map((item: any) => ({
            id: item.id,
            description: item.description || "",
            quantity: item.quantity || 0,
            unit_price: item.unit_price || 0,
            total_price: item.total_price || 0
          })));
        }
        
        // Calculate totals
        calculateTotals();
      }).catch((error) => {
        console.error("Error fetching quote:", error);
        toast.error("Erreur: Impossible de charger les données du devis");
      }).finally(() => {
        setIsLoading(false);
      });
    } else if (open) {
      // For new quotes, generate a new quote number
      generateQuoteNumber().then(number => setQuoteNumber(number));
      setIssueDate(new Date().toISOString().split('T')[0]);
    }
  }, [editQuoteId, open]);

  useEffect(() => {
    calculateTotals();
  }, [quoteItems]);

  const fetchQuoteById = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('devis')
        .select(`
          *,
          client:client_id (
            id,
            client_name,
            email,
            address,
            phone
          ),
          items:devis_items (*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Error fetching quote ${id}:`, error);
      throw error;
    }
  };

  const generateQuoteNumber = async (): Promise<string> => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const randomDigits = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `Q-${year}${month}-${randomDigits}`;
  };

  const calculateTotals = () => {
    let newSubtotal = 0;
    quoteItems.forEach((item) => {
      const itemTotal = item.quantity * item.unit_price;
      newSubtotal += itemTotal;
      // Update the item's total price
      item.total_price = itemTotal;
    });
    
    setSubtotal(newSubtotal);
    // Assuming no tax for simplicity, you can add tax calculation here if needed
    setTaxAmount(0);
    setTotal(newSubtotal);
  };

  const handleClientSelect = (client: Client) => {
    setClientId(client.id);
    setClientName(client.client_name);
  };

  const handleItemChange = (id: string, field: string, value: string | number) => {
    setQuoteItems((prevItems) => {
      return prevItems.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          if (field === 'quantity' || field === 'unit_price') {
            updatedItem.total_price = updatedItem.quantity * updatedItem.unit_price;
          }
          return updatedItem;
        }
        return item;
      });
    });
  };

  const addItem = () => {
    setQuoteItems((prevItems) => [
      ...prevItems,
      {
        id: Date.now().toString(),
        description: "",
        quantity: 1,
        unit_price: 0,
        total_price: 0
      }
    ]);
  };

  const removeItem = (id: string) => {
    setQuoteItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId) {
      toast.error("Veuillez sélectionner un client");
      return;
    }

    setIsSubmitting(true);
    try {
      const userData = await supabase.auth.getUser();
      const company_id = userData.data?.user?.id || null;
      
      const quoteData = {
        quote_number: quoteNumber,
        client_id: clientId,
        company_id,
        issue_date: issueDate,
        validity_date: validityDate || null,
        execution_date: executionDate || null,
        status: status,
        subtotal,
        tax_amount: taxAmount,
        total_amount: total,
        notes: notes || null
      };

      let quoteId;
      
      if (editQuoteId) {
        // Update existing quote
        const { data: updatedQuote, error } = await supabase
          .from('devis')
          .update(quoteData)
          .eq('id', editQuoteId)
          .select()
          .single();
          
        if (error) throw error;
        quoteId = editQuoteId;
        
        // Delete existing items and insert new ones
        const { error: deleteError } = await supabase
          .from('devis_items')
          .delete()
          .eq('quote_id', quoteId);
          
        if (deleteError) throw deleteError;
      } else {
        // Create new quote
        const { data: newQuote, error } = await supabase
          .from('devis')
          .insert(quoteData)
          .select()
          .single();
          
        if (error) throw error;
        quoteId = newQuote?.id;
      }
      
      // Insert quote items
      if (quoteItems.length > 0 && quoteId) {
        const formattedItems = quoteItems.map(item => ({
          quote_id: quoteId,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price
        }));
        
        const { error: itemsError } = await supabase
          .from('devis_items')
          .insert(formattedItems);
          
        if (itemsError) throw itemsError;
      }

      toast.success(editQuoteId ? "Devis mis à jour" : "Devis créé");
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error saving quote:", error);
      toast.error("Une erreur s'est produite lors de la sauvegarde du devis");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>{editQuoteId ? "Modifier le devis" : "Nouveau devis"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="quoteNumber">Numéro de devis</Label>
              <Input
                id="quoteNumber"
                value={quoteNumber}
                onChange={(e) => setQuoteNumber(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div>
              <Label htmlFor="issueDate">Date d'émission</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !issueDate && "text-muted-foreground"
                    )}
                    disabled={isLoading}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {issueDate ? format(new Date(issueDate), "PPP") : (
                      <span>Choisir une date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={issueDate ? new Date(issueDate) : undefined}
                    onSelect={(date) => {
                      if (date) setIssueDate(date.toISOString().split('T')[0]);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="validityDate">Date de validité</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !validityDate && "text-muted-foreground"
                    )}
                    disabled={isLoading}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {validityDate ? format(new Date(validityDate), "PPP") : (
                      <span>Choisir une date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={validityDate ? new Date(validityDate) : undefined}
                    onSelect={(date) => {
                      if (date) setValidityDate(date.toISOString().split('T')[0]);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label htmlFor="status">Statut</Label>
              <Select value={status} onValueChange={setStatus} disabled={isLoading}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Sélectionner un statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Brouillon</SelectItem>
                  <SelectItem value="sent">Envoyé</SelectItem>
                  <SelectItem value="accepted">Accepté</SelectItem>
                  <SelectItem value="rejected">Refusé</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Client</Label>
            <ClientSelector 
              onClientSelect={handleClientSelect} 
              buttonText="Sélectionner un client"
            />
            {clientName && (
              <div className="mt-2 p-2 border rounded-md bg-gray-50">
                <p className="font-medium">{clientName}</p>
              </div>
            )}
          </div>

          <div>
            <Label>Articles</Label>
            {quoteItems.length > 0 ? (
              <div className="space-y-2 mt-2">
                {quoteItems.map((item) => (
                  <div key={item.id} className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-5">
                      <Input
                        placeholder="Description"
                        value={item.description}
                        onChange={(e) => handleItemChange(item.id, "description", e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        placeholder="Quantité"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(item.id, "quantity", Number(e.target.value))}
                        disabled={isLoading}
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        placeholder="Prix unitaire"
                        value={item.unit_price}
                        onChange={(e) => handleItemChange(item.id, "unit_price", Number(e.target.value))}
                        disabled={isLoading}
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="text"
                        value={`${item.total_price.toFixed(2)} €`}
                        readOnly
                        disabled
                      />
                    </div>
                    <div className="col-span-1">
                      <Button 
                        type="button" 
                        variant="destructive" 
                        size="icon"
                        onClick={() => removeItem(item.id)} 
                        disabled={isLoading}
                      >
                        &times;
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground mt-2">Aucun article ajouté</p>
            )}
            <Button 
              type="button" 
              variant="outline" 
              onClick={addItem} 
              className="mt-3" 
              disabled={isLoading}
            >
              Ajouter un article
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Sous-total</Label>
              <Input type="text" value={`${subtotal.toFixed(2)} €`} disabled />
            </div>
            <div>
              <Label>TVA</Label>
              <Input type="text" value={`${taxAmount.toFixed(2)} €`} disabled />
            </div>
            <div>
              <Label>Total</Label>
              <Input type="text" value={`${total.toFixed(2)} €`} disabled />
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ajouter des notes..."
              disabled={isLoading}
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting || isLoading}>
              {isSubmitting ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
