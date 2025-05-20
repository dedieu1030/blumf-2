
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
import { enUS } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react"; // Changed from @radix-ui/react-icons
import { toast } from "sonner";
import { createQuote, updateQuote, updateQuoteItems, fetchQuoteById, generateQuoteNumber } from '@/services/quoteService';
import { supabase } from "@/integrations/supabase/client";

export function QuoteDialog({ open, onOpenChange, editQuoteId, onSuccess }) {
  const [quoteNumber, setQuoteNumber] = useState("");
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [validityDate, setValidityDate] = useState("");
  const [executionDate, setExecutionDate] = useState("");
  const [status, setStatus] = useState("draft");
  const [clientId, setClientId] = useState("");
  const [clientName, setClientName] = useState("");
  const [notes, setNotes] = useState("");
  const [quoteItems, setQuoteItems] = useState([]);
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
        setQuoteNumber(quote.quote_number);
        setIssueDate(quote.issue_date);
        setValidityDate(quote.validity_date || '');
        setExecutionDate(quote.execution_date || '');
        setStatus(quote.status);
        setClientId(quote.client_id);
        setClientName(quote.client?.client_name || '');
        setNotes(quote.notes || '');
        
        // Set items if available
        if (quote.items && quote.items.length > 0) {
          setQuoteItems(quote.items.map((item) => ({
            id: item.id,
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unit_price,
            total_price: item.total_price
          })));
        }
        
        // Calculate totals
        calculateTotals();
      }).catch((error) => {
        console.error("Error fetching quote:", error);
        toast("Erreur: Impossible de charger les données du devis");
      }).finally(() => {
        setIsLoading(false);
      });
    } else if (open) {
      // For new quotes, generate a new quote number
      setQuoteNumber(generateQuoteNumber());
      setIssueDate(new Date().toISOString().split('T')[0]);
    }
  }, [editQuoteId, open]);

  const calculateTotals = () => {
    let subtotal = 0;
    let taxAmount = 0;
    quoteItems.forEach((item) => {
      subtotal += item.quantity * item.unit_price;
      taxAmount += 0; // Assuming no tax for simplicity
    });
    setSubtotal(subtotal);
    setTaxAmount(taxAmount);
    setTotal(subtotal + taxAmount);
  };

  const handleItemChange = (id, field, value) => {
    setQuoteItems((quoteItems) => {
      return quoteItems.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            [field]: value
          };
        }
        return item;
      });
    });
  };

  const addItem = () => {
    setQuoteItems((quoteItems) => {
      return [
        ...quoteItems,
        {
          id: Date.now().toString(),
          description: "",
          quantity: 1,
          unit_price: 0,
          total_price: 0
        }
      ];
    });
  };

  const removeItem = (id) => {
    setQuoteItems((quoteItems) => {
      return quoteItems.filter((item) => item.id !== id);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!clientId) {
      toast("Erreur: Veuillez sélectionner un client");
      return;
    }

    setIsSubmitting(true);
    try {
      const quoteData = {
        quote_number: quoteNumber,
        client_id: clientId,
        company_id: (await supabase.auth.getUser()).data?.user?.id,
        issue_date: issueDate,
        validity_date: validityDate || undefined,
        execution_date: executionDate || undefined,
        status: status,
        subtotal: subtotal,
        tax_amount: taxAmount,
        total_amount: total,
        notes: notes
      };

      let savedQuote;
      if (editQuoteId) {
        // Update existing quote
        savedQuote = await updateQuote(editQuoteId, quoteData);
        await updateQuoteItems(editQuoteId, quoteItems);
      } else {
        // Create new quote
        savedQuote = await createQuote(quoteData, quoteItems);
      }

      toast(editQuoteId ? "Devis mis à jour" : "Devis créé");
      onSuccess?.();
    } catch (error) {
      console.error("Error saving quote:", error);
      toast("Erreur: Une erreur s'est produite lors de la sauvegarde du devis");
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
                    {issueDate ? format(new Date(issueDate), "P") : (
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
                    {validityDate ? format(new Date(validityDate), "P") : (
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="clientId">ID Client</Label>
              <Input
                id="clientId"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div>
              <Label htmlFor="clientName">Nom du client</Label>
              <Input
                id="clientName"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <Label>Articles</Label>
            {quoteItems.map((item) => (
              <div key={item.id} className="grid grid-cols-5 gap-2 mb-2">
                <Input
                  placeholder="Description"
                  value={item.description}
                  onChange={(e) => handleItemChange(item.id, "description", e.target.value)}
                  disabled={isLoading}
                />
                <Input
                  type="number"
                  placeholder="Quantité"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(item.id, "quantity", Number(e.target.value))}
                  disabled={isLoading}
                />
                <Input
                  type="number"
                  placeholder="Prix unitaire"
                  value={item.unit_price}
                  onChange={(e) => handleItemChange(item.id, "unit_price", Number(e.target.value))}
                  disabled={isLoading}
                />
                <Input
                  type="number"
                  placeholder="Prix total"
                  value={item.quantity * item.unit_price}
                  readOnly
                  disabled
                />
                <Button type="button" variant="destructive" onClick={() => removeItem(item.id)} disabled={isLoading}>
                  Supprimer
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addItem} className="mt-2" disabled={isLoading}>
              Ajouter un article
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Sous-total</Label>
              <Input type="text" value={subtotal.toFixed(2) + " €"} disabled />
            </div>
            <div>
              <Label>TVA</Label>
              <Input type="text" value={taxAmount.toFixed(2) + " €"} disabled />
            </div>
            <div>
              <Label>Total</Label>
              <Input type="text" value={total.toFixed(2) + " €"} disabled />
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
