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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createProduct,
  updateProduct,
  getCategories,
  ProductCategory
} from "@/services/productService";
import { availableCurrencies } from "@/services/invoiceSettingsService";
import { TaxRateSelector } from "@/components/settings/TaxRateSelector";
import { Product } from "@/types/product";

interface ProductFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
  onUpdate?: () => void;
}

export function ProductForm({ open, onOpenChange, product, onUpdate }: ProductFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  
  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [priceCents, setPriceCents] = useState("");
  const [currency, setCurrency] = useState("EUR");
  const [taxRate, setTaxRate] = useState<number>(20); // Using number type for taxRate
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringInterval, setRecurringInterval] = useState<string | null>("month");
  const [recurringIntervalCount, setRecurringIntervalCount] = useState("1");
  const [productType, setProductType] = useState<string | null>("service");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [active, setActive] = useState(true);
  
  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      const data = await getCategories();
      setCategories(data);
    };
    
    loadCategories();
  }, []);
  
  // Reset form when dialog opens or product changes
  useEffect(() => {
    if (open) {
      if (product) {
        setName(product.name);
        setDescription(product.description || "");
        setPriceCents(product.price_cents?.toString() || "");
        setCurrency(product.currency || "EUR");
        // Handle tax_rate properly, converting to number if it's a string
        setTaxRate(typeof product.tax_rate === 'string' ? parseFloat(product.tax_rate) || 0 : (product.tax_rate || 0));
        setIsRecurring(product.is_recurring || false);
        setRecurringInterval(product.recurring_interval);
        setRecurringIntervalCount(product.recurring_interval_count?.toString() || "1");
        setProductType(product.product_type);
        setCategoryId(product.category_id || null);
        setActive(product.active !== undefined ? product.active : true);
      } else {
        // Default values for new product
        setName("");
        setDescription("");
        setPriceCents("");
        setCurrency("EUR");
        setTaxRate(20);
        setIsRecurring(false);
        setRecurringInterval("month");
        setRecurringIntervalCount("1");
        setProductType("service");
        setCategoryId(null);
        setActive(true);
      }
    }
  }, [open, product]);
  
  // Handle tax rate change as a number
  const handleTaxRateChange = (value: number) => {
    setTaxRate(value);
  };
  
  const handleSubmit = async () => {
    setIsLoading(true);
    
    try {
      // Validate required fields
      if (!name) {
        alert("Veuillez saisir un nom");
        setIsLoading(false);
        return;
      }
      
      // Convert price to cents (integer)
      const price_cents = priceCents ? parseInt(priceCents) : 0;
      
      // Prepare product data
      const productData = {
        name,
        description: description || undefined,
        price_cents,
        price: (price_cents / 100).toFixed(2),
        currency,
        tax_rate: taxRate,
        is_recurring: isRecurring,
        product_type: productType as 'product' | 'service' | null,
        active,
        recurring_interval: isRecurring ? (recurringInterval as 'day' | 'week' | 'month' | 'year') : undefined,
        recurring_interval_count: isRecurring && recurringIntervalCount ? parseInt(recurringIntervalCount) : undefined,
        category_id: categoryId && categoryId !== "none" ? categoryId : undefined
      };
      
      if (product) {
        // Update existing product
        await updateProduct(product.id, productData);
      } else {
        // Create new product
        await createProduct(productData);
      }
      
      // Callback to refresh data
      if (onUpdate) {
        onUpdate();
      }
      
      // Close the dialog
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving product:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {product ? "Modifier le produit" : "Nouveau produit/service"}
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="product-type" className="col-span-4 md:col-span-1">
              Type
            </Label>
            <Select
              value={productType || ""}
              onValueChange={setProductType}
            >
              <SelectTrigger
                id="product-type"
                className="col-span-4 md:col-span-3"
              >
                <SelectValue placeholder="Sélectionnez un type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="product">Produit</SelectItem>
                <SelectItem value="service">Service</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="col-span-4 md:col-span-1">
              Nom *
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-4 md:col-span-3"
              placeholder="Nom du produit ou service"
              required
            />
          </div>
          
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="description" className="col-span-4 md:col-span-1 pt-2">
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-4 md:col-span-3 min-h-[100px]"
              placeholder="Description détaillée"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="price" className="col-span-4 md:col-span-1">
              Prix HT
            </Label>
            <div className="col-span-2 md:col-span-2 flex items-center">
              <Input
                id="price"
                type="number"
                value={priceCents}
                onChange={(e) => setPriceCents(e.target.value)}
                placeholder="0.00"
                step="0.01"
              />
            </div>
            <div className="col-span-2 md:col-span-1">
              <Select
                value={currency}
                onValueChange={setCurrency}
              >
                <SelectTrigger>
                  <SelectValue placeholder="EUR" />
                </SelectTrigger>
                <SelectContent>
                  {availableCurrencies.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      {c.symbol} - {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="tax-rate" className="col-span-4 md:col-span-1 pt-2">
              Taux TVA (%)
            </Label>
            <div className="col-span-4 md:col-span-3">
              <TaxRateSelector 
                defaultValue={taxRate} 
                onChange={handleTaxRateChange} 
                showLabel={false} 
              />
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <div className="col-span-4 md:col-span-1">Récurrent</div>
            <div className="col-span-4 md:col-span-3 flex items-center space-x-2">
              <Switch
                checked={isRecurring}
                onCheckedChange={setIsRecurring}
                id="recurring"
              />
              <Label htmlFor="recurring">
                Ce produit/service est facturé de manière récurrente
              </Label>
            </div>
          </div>
          
          {isRecurring && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="col-span-4 md:col-span-1">
                Périodicité
              </Label>
              <div className="col-span-2 md:col-span-1">
                <Input
                  type="number"
                  min="1"
                  value={recurringIntervalCount}
                  onChange={(e) => setRecurringIntervalCount(e.target.value)}
                />
              </div>
              <div className="col-span-2 md:col-span-2">
                <Select
                  value={recurringInterval || ""}
                  onValueChange={setRecurringInterval}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Intervalle" />
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
          )}
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="col-span-4 md:col-span-1">
              Catégorie
            </Label>
            <Select
              value={categoryId || "none"}
              onValueChange={setCategoryId}
            >
              <SelectTrigger
                id="category"
                className="col-span-4 md:col-span-3"
              >
                <SelectValue placeholder="Sélectionnez une catégorie (optionnel)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Aucune catégorie</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <div className="col-span-4 md:col-span-1">Statut</div>
            <div className="col-span-4 md:col-span-3 flex items-center space-x-2">
              <Switch
                checked={active}
                onCheckedChange={setActive}
                id="active"
              />
              <Label htmlFor="active">
                {active ? "Actif" : "Inactif"}
              </Label>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? (
              <>
                <span className="animate-spin h-4 w-4 mr-2 border-t-2 border-current rounded-full" />
                Traitement...
              </>
            ) : product ? (
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
