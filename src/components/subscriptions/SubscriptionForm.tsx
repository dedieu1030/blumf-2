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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Subscription, 
  SubscriptionItem, 
  createSubscription, 
  updateSubscription,
  calculateNextInvoiceDate
} from "@/services/subscriptionService";
import { ClientSelector, Client } from "@/components/ClientSelector";
import { fetchProducts, formatPrice, Product } from "@/services/productService";
import { toast } from "sonner";

interface SubscriptionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subscription?: Subscription | null;
  onUpdate?: () => void;
}

export function SubscriptionForm({ open, onOpenChange, subscription, onUpdate }: SubscriptionFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  
  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [clientId, setClientId] = useState<string>("");
  const [clientName, setClientName] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState("");
  const [recurringInterval, setRecurringInterval] = useState<string>("month");
  const [recurringIntervalCount, setRecurringIntervalCount] = useState<string>("1");
  const [customDays, setCustomDays] = useState<string>("");
  const [selectedProducts, setSelectedProducts] = useState<Array<{
    productId: string;
    quantity: number;
    product: Product | null;
  }>>([]);
  const [nextInvoiceDate, setNextInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Load products
  useEffect(() => {
    const loadProducts = async () => {
      const data = await fetchProducts();
      const recurringProducts = data.filter(product => product.is_recurring);
      setProducts(recurringProducts);
    };
    
    loadProducts();
  }, []);
  
  // Reset form when dialog opens or subscription changes
  useEffect(() => {
    if (open) {
      if (subscription) {
        setName(subscription.name);
        setDescription(subscription.description || "");
        setClientId(subscription.client_id);
        setClientName(subscription.client_name || "");
        setStartDate(new Date(subscription.start_date).toISOString().split('T')[0]);
        setEndDate(subscription.end_date ? new Date(subscription.end_date).toISOString().split('T')[0] : "");
        setRecurringInterval(subscription.recurring_interval);
        setRecurringIntervalCount(subscription.recurring_interval_count.toString());
        setNextInvoiceDate(new Date(subscription.next_invoice_date).toISOString().split('T')[0]);
        setCustomDays(subscription.custom_days?.toString() || "");
        
        // Load subscription items
        const fetchItems = async () => {
          if (subscription.items) {
            const items = subscription.items.map(item => ({
              productId: item.product_id,
              quantity: item.quantity,
              product: item.product || null
            }));
            setSelectedProducts(items);
          } else {
            setSelectedProducts([{ productId: "", quantity: 1, product: null }]);
          }
        };
        
        fetchItems();
      } else {
        // Default values for new subscription
        setName("");
        setDescription("");
        setClientId("");
        setClientName("");
        setStartDate(new Date().toISOString().split('T')[0]);
        setEndDate("");
        setRecurringInterval("month");
        setRecurringIntervalCount("1");
        setCustomDays("");
        setNextInvoiceDate(
          calculateNextInvoiceDate(
            new Date(), 
            "month", 
            1
          ).toISOString().split('T')[0]
        );
        setSelectedProducts([{ productId: "", quantity: 1, product: null }]);
      }
    }
  }, [open, subscription]);
  
  // Update next invoice date when start date or interval changes
  useEffect(() => {
    if (startDate) {
      const intervalValue = recurringInterval as 'day' | 'week' | 'month' | 'quarter' | 'semester' | 'year' | 'custom';
      const intervalCountValue = parseInt(recurringIntervalCount) || 1;
      const customDaysValue = intervalValue === 'custom' ? parseInt(customDays) || intervalCountValue : undefined;
      
      setNextInvoiceDate(
        calculateNextInvoiceDate(
          new Date(startDate), 
          intervalValue, 
          intervalCountValue,
          customDaysValue
        ).toISOString().split('T')[0]
      );
    }
  }, [startDate, recurringInterval, recurringIntervalCount, customDays]);
  
  const handleClientSelect = (client: Client) => {
    setClientId(client.id);
    // Use client.name or client.client_name depending on what's available
    setClientName(client.name || client.client_name);
  };
  
  const handleAddProduct = () => {
    setSelectedProducts([
      ...selectedProducts, 
      { productId: "", quantity: 1, product: null }
    ]);
  };
  
  const handleRemoveProduct = (index: number) => {
    const updated = [...selectedProducts];
    updated.splice(index, 1);
    setSelectedProducts(updated);
  };
  
  const handleProductChange = (index: number, productId: string) => {
    const product = products.find(p => p.id === productId) || null;
    const updated = [...selectedProducts];
    updated[index] = { ...updated[index], productId, product };
    setSelectedProducts(updated);
  };
  
  const handleQuantityChange = (index: number, quantity: number) => {
    const updated = [...selectedProducts];
    updated[index] = { ...updated[index], quantity };
    setSelectedProducts(updated);
  };
  
  const handleSubmit = async () => {
    setIsLoading(true);
    
    try {
      // Validate required fields
      if (!name) {
        toast.error("Veuillez saisir un nom");
        setIsLoading(false);
        return;
      }
      
      if (!clientId) {
        toast.error("Veuillez sélectionner un client");
        setIsLoading(false);
        return;
      }
      
      if (selectedProducts.length === 0 || selectedProducts.some(p => !p.productId)) {
        toast.error("Veuillez sélectionner au moins un produit");
        setIsLoading(false);
        return;
      }
      
      if (recurringInterval === 'custom' && !customDays) {
        toast.error("Veuillez spécifier un nombre de jours pour la périodicité personnalisée");
        setIsLoading(false);
        return;
      }
      
      // Prepare subscription items
      const items: Partial<SubscriptionItem>[] = selectedProducts
        .filter(p => p.productId && p.product)
        .map(p => ({
          product_id: p.productId,
          quantity: p.quantity,
          price_cents: p.product?.price_cents || 0,
          tax_rate: p.product?.tax_rate || null
        }));
      
      // Prepare subscription data
      const subscriptionData: Partial<Subscription> = {
        name,
        description: description || null,
        client_id: clientId,
        start_date: startDate,
        end_date: endDate || null,
        recurring_interval: recurringInterval as 'day' | 'week' | 'month' | 'quarter' | 'semester' | 'year' | 'custom',
        recurring_interval_count: parseInt(recurringIntervalCount) || 1,
        custom_days: recurringInterval === 'custom' ? parseInt(customDays) || null : null,
        next_invoice_date: nextInvoiceDate,
        status: 'active'
      };
      
      if (subscription) {
        // Update existing subscription
        await updateSubscription(subscription.id, subscriptionData, items);
      } else {
        // Create new subscription
        await createSubscription(subscriptionData, items);
      }
      
      // Callback to refresh data
      if (onUpdate) {
        onUpdate();
      }
      
      // Close the dialog
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving subscription:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {subscription ? "Modifier l'abonnement" : "Nouvel abonnement"}
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom de l'abonnement *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Abonnement mensuel"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description de l'abonnement"
                rows={3}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Client *</Label>
            {clientId ? (
              <div className="flex items-center justify-between p-2 border rounded-md">
                <span>{clientName}</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    setClientId("");
                    setClientName("");
                  }}
                >
                  Changer
                </Button>
              </div>
            ) : (
              <ClientSelector 
                onClientSelect={handleClientSelect}
                buttonText="Créer un nouveau client" 
              />
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-date">Date de début *</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="end-date">
                Date de fin <span className="text-muted-foreground">(optionnelle)</span>
              </Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
          
          <div>
            <Label className="mb-2 block">Périodicité *</Label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Input
                  type="number"
                  min="1"
                  value={recurringIntervalCount}
                  onChange={(e) => setRecurringIntervalCount(e.target.value)}
                  placeholder="1"
                />
              </div>
              
              <Select
                value={recurringInterval}
                onValueChange={setRecurringInterval}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Jour(s)</SelectItem>
                  <SelectItem value="week">Semaine(s)</SelectItem>
                  <SelectItem value="month">Mois</SelectItem>
                  <SelectItem value="quarter">Trimestre(s)</SelectItem>
                  <SelectItem value="semester">Semestre(s)</SelectItem>
                  <SelectItem value="year">Année(s)</SelectItem>
                  <SelectItem value="custom">Personnalisé</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {recurringInterval === 'custom' && (
              <div className="mt-4">
                <Label htmlFor="custom-days">Nombre de jours personnalisé *</Label>
                <Input
                  id="custom-days"
                  type="number"
                  min="1"
                  value={customDays}
                  onChange={(e) => setCustomDays(e.target.value)}
                  placeholder="30"
                  className="mt-2"
                />
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="next-invoice">Date de prochaine facturation</Label>
            <Input
              id="next-invoice"
              type="date"
              value={nextInvoiceDate}
              onChange={(e) => setNextInvoiceDate(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Cette date est calculée automatiquement à partir de la date de début et de la périodicité,
              mais vous pouvez la modifier manuellement si nécessaire.
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Produits/Services *</Label>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={handleAddProduct}
              >
                Ajouter un produit
              </Button>
            </div>
            
            {products.length === 0 ? (
              <div className="text-center p-4 border rounded-md bg-muted/20">
                <p>Aucun produit récurrent disponible.</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Créez d'abord des produits/services récurrents dans la section "Produits/Services".
                </p>
              </div>
            ) : selectedProducts.length === 0 ? (
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleAddProduct}
                className="w-full"
              >
                Ajouter un produit
              </Button>
            ) : (
              <div className="space-y-4">
                {selectedProducts.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-center border p-3 rounded-md">
                    <div className="col-span-7">
                      <Select
                        value={item.productId}
                        onValueChange={(value) => handleProductChange(index, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un produit" />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map((product) => (
                            <SelectItem key={product.id} value={product.id}>
                              {product.name} - {formatPrice(product.price_cents)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="col-span-3">
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(index, parseInt(e.target.value) || 1)}
                        placeholder="Qté"
                      />
                    </div>
                    
                    <div className="col-span-2 text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveProduct(index)}
                        disabled={selectedProducts.length === 1}
                      >
                        Retirer
                      </Button>
                    </div>
                    
                    {item.product && (
                      <div className="col-span-12 text-sm text-muted-foreground">
                        {formatPrice(item.product.price_cents)} x {item.quantity} = 
                        {" "}{formatPrice((item.product.price_cents || 0) * item.quantity)}
                        {item.product.tax_rate && (
                          <span className="ml-2">
                            (TVA: {item.product.tax_rate}%)
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? (
              <>
                <span className="animate-spin h-4 w-4 mr-2 border-t-2 border-current rounded-full" />
                Traitement...
              </>
            ) : subscription ? (
              "Mettre à jour"
            ) : (
              "Créer"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
