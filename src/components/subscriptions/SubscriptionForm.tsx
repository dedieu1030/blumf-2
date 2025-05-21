import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Plus, Trash } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Subscription, SubscriptionItem, SubscriptionStatus } from '@/types/subscription';
import { Client } from '@/types/client';
import { Product } from '@/types/product';
import { fetchClients } from '@/services/clientService';
import { fetchProducts } from '@/services/productService';
import { createSubscription, updateSubscription } from '@/services/subscriptionService';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { formatDate, formatRecurringInterval } from '@/utils/formatters';

interface SubscriptionFormProps {
  subscription?: Subscription;
  onSuccess?: () => void;
}

export function SubscriptionForm({ subscription, onSuccess }: SubscriptionFormProps) {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>(subscription?.client_id || '');
  const [startDate, setStartDate] = useState<Date | undefined>(
    subscription?.start_date ? new Date(subscription.start_date) : new Date()
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    subscription?.end_date ? new Date(subscription.end_date) : undefined
  );
  const [nextInvoiceDate, setNextInvoiceDate] = useState<Date | undefined>(
    subscription?.next_invoice_date ? new Date(subscription.next_invoice_date) : undefined
  );
  const [recurringInterval, setRecurringInterval] = useState<string>(
    subscription?.recurring_interval || 'month'
  );
  const [recurringIntervalCount, setRecurringIntervalCount] = useState<number>(
    subscription?.recurring_interval_count || 1
  );
  const [status, setStatus] = useState<SubscriptionStatus>(
    subscription?.status || 'active'
  );
  const [notes, setNotes] = useState<string>(subscription?.notes || '');
  const [items, setItems] = useState<SubscriptionItem[]>(
    subscription?.items || []
  );
  const [isActive, setIsActive] = useState<boolean>(
    subscription?.status === 'active'
  );

  useEffect(() => {
    const loadData = async () => {
      try {
        const clientsData = await fetchClients();
        setClients(clientsData);
        
        const productsData = await fetchProducts();
        setProducts(productsData);
      } catch (error) {
        console.error('Error loading form data:', error);
        toast.error('Erreur lors du chargement des données');
      }
    };
    
    loadData();
  }, []);

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        id: `temp-${Date.now()}`,
        subscription_id: subscription?.id || '',
        product_id: '',
        quantity: 1,
        unit_price: 0,
        description: '',
        product: undefined
      }
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof SubscriptionItem, value: any) => {
    const updatedItems = [...items];
    
    if (field === 'product_id' && value) {
      const selectedProduct = products.find(p => p.id === value);
      if (selectedProduct) {
        updatedItems[index] = {
          ...updatedItems[index],
          product_id: value,
          unit_price: selectedProduct.price || 0,
          description: selectedProduct.name || '',
          product: selectedProduct
        };
        setItems(updatedItems);
        return;
      }
    }
    
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value
    };
    setItems(updatedItems);
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
  };

  const handleStatusChange = (value: string) => {
    setStatus(value as SubscriptionStatus);
    setIsActive(value === 'active');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedClient) {
      toast.error('Veuillez sélectionner un client');
      return;
    }
    
    if (!startDate) {
      toast.error('Veuillez sélectionner une date de début');
      return;
    }
    
    if (items.length === 0) {
      toast.error('Veuillez ajouter au moins un produit');
      return;
    }
    
    if (items.some(item => !item.product_id)) {
      toast.error('Veuillez sélectionner un produit pour chaque ligne');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const subscriptionData: Partial<Subscription> = {
        client_id: selectedClient,
        start_date: startDate.toISOString(),
        end_date: endDate?.toISOString(),
        next_invoice_date: nextInvoiceDate?.toISOString(),
        recurring_interval: recurringInterval,
        recurring_interval_count: recurringIntervalCount,
        status: status,
        notes: notes,
        items: items.map(item => ({
          ...item,
          product: undefined // Remove circular reference
        }))
      };
      
      let result;
      
      if (subscription?.id) {
        result = await updateSubscription(subscription.id, subscriptionData);
      } else {
        result = await createSubscription(subscriptionData);
      }
      
      if (result.success) {
        toast.success(
          subscription?.id 
            ? 'Abonnement mis à jour avec succès' 
            : 'Abonnement créé avec succès'
        );
        
        if (onSuccess) {
          onSuccess();
        } else {
          navigate('/subscriptions');
        }
      } else {
        toast.error(result.error || 'Une erreur est survenue');
      }
    } catch (error) {
      console.error('Error submitting subscription:', error);
      toast.error('Une erreur est survenue lors de l\'enregistrement');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Client selection */}
        <div className="space-y-2">
          <Label htmlFor="client">Client</Label>
          <Select 
            value={selectedClient} 
            onValueChange={setSelectedClient}
          >
            <SelectTrigger id="client">
              <SelectValue placeholder="Sélectionner un client" />
            </SelectTrigger>
            <SelectContent>
              {clients.map(client => (
                <SelectItem key={client.id} value={client.id}>
                  {client.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Status */}
        <div className="space-y-2">
          <Label htmlFor="status">Statut</Label>
          <Select 
            value={status} 
            onValueChange={handleStatusChange}
          >
            <SelectTrigger id="status">
              <SelectValue placeholder="Sélectionner un statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Actif</SelectItem>
              <SelectItem value="paused">En pause</SelectItem>
              <SelectItem value="canceled">Annulé</SelectItem>
              <SelectItem value="expired">Expiré</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Start date */}
        <div className="space-y-2">
          <Label htmlFor="start-date">Date de début</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="start-date"
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !startDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, 'dd/MM/yyyy') : <span>Sélectionner une date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={setStartDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        
        {/* End date */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="end-date">Date de fin</Label>
            <span className="text-xs text-muted-foreground">(Optionnel)</span>
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="end-date"
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !endDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, 'dd/MM/yyyy') : <span>Sélectionner une date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={setEndDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        
        {/* Recurring interval */}
        <div className="space-y-2">
          <Label htmlFor="recurring-interval">Fréquence de facturation</Label>
          <div className="flex space-x-2">
            <Input
              id="recurring-interval-count"
              type="number"
              min="1"
              value={recurringIntervalCount}
              onChange={(e) => setRecurringIntervalCount(parseInt(e.target.value) || 1)}
              className="w-20"
            />
            <Select 
              value={recurringInterval} 
              onValueChange={setRecurringInterval}
            >
              <SelectTrigger id="recurring-interval" className="flex-1">
                <SelectValue placeholder="Sélectionner une période" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Jour(s)</SelectItem>
                <SelectItem value="week">Semaine(s)</SelectItem>
                <SelectItem value="month">Mois</SelectItem>
                <SelectItem value="year">Année(s)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Next invoice date */}
        <div className="space-y-2">
          <Label htmlFor="next-invoice-date">Prochaine facturation</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="next-invoice-date"
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !nextInvoiceDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {nextInvoiceDate ? format(nextInvoiceDate, 'dd/MM/yyyy') : <span>Sélectionner une date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={nextInvoiceDate}
                onSelect={setNextInvoiceDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      
      {/* Subscription items */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Produits et services</h3>
          <Button type="button" variant="outline" size="sm" onClick={handleAddItem}>
            <Plus className="h-4 w-4 mr-1" /> Ajouter un produit
          </Button>
        </div>
        
        {items.length === 0 ? (
          <div className="text-center py-4 border rounded-md bg-muted/50">
            <p className="text-muted-foreground">Aucun produit ajouté</p>
            <Button type="button" variant="link" onClick={handleAddItem}>
              Ajouter un produit
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={item.id} className="grid grid-cols-12 gap-2 items-end border p-3 rounded-md">
                <div className="col-span-5">
                  <Label htmlFor={`product-${index}`}>Produit</Label>
                  <Select 
                    value={item.product_id} 
                    onValueChange={(value) => handleItemChange(index, 'product_id', value)}
                  >
                    <SelectTrigger id={`product-${index}`}>
                      <SelectValue placeholder="Sélectionner un produit" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map(product => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-3">
                  <Label htmlFor={`description-${index}`}>Description</Label>
                  <Input
                    id={`description-${index}`}
                    value={item.description || ''}
                    onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                  />
                </div>
                <div className="col-span-1">
                  <Label htmlFor={`quantity-${index}`}>Qté</Label>
                  <Input
                    id={`quantity-${index}`}
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor={`price-${index}`}>Prix unitaire</Label>
                  <Input
                    id={`price-${index}`}
                    type="number"
                    step="0.01"
                    value={item.unit_price}
                    onChange={(e) => handleItemChange(index, 'unit_price', parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="col-span-1 flex justify-end">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleRemoveItem(index)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            
            <div className="flex justify-end">
              <div className="bg-muted p-3 rounded-md">
                <span className="font-medium">Total: </span>
                <span className="font-bold">{calculateTotal().toFixed(2)} €</span>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes additionnelles sur cet abonnement..."
          className="min-h-[100px]"
        />
      </div>
      
      {/* Subscription info if editing */}
      {subscription && (
        <div className="bg-muted p-4 rounded-md space-y-2">
          <h4 className="font-medium">Informations sur l'abonnement</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-muted-foreground">ID: </span>
              <span className="font-mono">{subscription.id}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Créé le: </span>
              <span>{subscription.created_at ? formatDate(subscription.created_at) : 'N/A'}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Fréquence: </span>
              <span>
                {subscription ? formatRecurringInterval(subscription.recurring_interval, subscription.recurring_interval_count) : ''}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Prochaine facture: </span>
              <span>
                {subscription?.next_invoice_date ? formatDate(subscription.next_invoice_date) : ''}
              </span>
            </div>
          </div>
        </div>
      )}
      
      {/* Submit button */}
      <div className="flex justify-end space-x-2">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => navigate('/subscriptions')}
        >
          Annuler
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Enregistrement...' : subscription ? 'Mettre à jour' : 'Créer l\'abonnement'}
        </Button>
      </div>
    </form>
  );
}

export default SubscriptionForm;
