
// src/components/products/ProductForm.tsx
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { createProduct, updateProduct, getCategories, ProductCategory } from "@/services/productService";
import { Product } from "@/types/product";

interface ProductFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
  initialData?: Product;
  product?: Product; // Add for backward compatibility
}

export function ProductForm({ open, onOpenChange, onUpdate, initialData, product }: ProductFormProps) {
  // Use product prop for backward compatibility
  const productData = product || initialData;
  
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "0",
    category_id: "",
    sku: "",
    tax_rate: 0,
    active: true,
    product_type: "product" as "product" | "service" | null,
    is_recurring: false,
    recurring_interval: "month" as "day" | "week" | "month" | "year" | undefined,
    recurring_interval_count: 1,
  });
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      setIsLoading(true);
      const data = await getCategories();
      setCategories(data);
      setIsLoading(false);
    };

    loadCategories();
  }, []);

  useEffect(() => {
    if (productData) {
      setFormData({
        name: productData.name,
        description: productData.description || "",
        price: productData.price?.toString() || "0",
        category_id: productData.category_id || "",
        sku: productData.sku || "",
        tax_rate: productData.tax_rate || 0,
        active: productData.active !== undefined ? productData.active : true,
        product_type: productData.product_type || "product",
        is_recurring: productData.is_recurring || false,
        recurring_interval: productData.recurring_interval || "month",
        recurring_interval_count: productData.recurring_interval_count || 1,
      });
    } else {
      setFormData({
        name: "",
        description: "",
        price: "0",
        category_id: "",
        sku: "",
        tax_rate: 0,
        active: true,
        product_type: "product",
        is_recurring: false,
        recurring_interval: "month",
        recurring_interval_count: 1,
      });
    }
  }, [productData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectCategory = (value: string) => {
    setFormData(prev => ({ ...prev, category_id: value }));
  };

  const handleActiveChange = (value: boolean) => {
    setFormData(prev => ({ ...prev, active: value }));
  };

  const handleProductTypeChange = (value: string) => {
    setFormData(prev => ({ ...prev, product_type: value as "product" | "service" | null }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  
    // Convert price from string to number before saving
    const productDataToSave = {
      ...formData,
      price: parseFloat(formData.price),
    };
  
    try {
      if (productData) {
        await updateProduct(productData.id, productDataToSave);
      } else {
        await createProduct(productDataToSave);
      }
      
      toast({
        title: "Produit enregistré",
        description: "Les informations du produit ont été enregistrées avec succès.",
      });
      onUpdate();
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving product:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'enregistrement du produit.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{productData ? "Modifier le produit" : "Nouveau produit"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nom
              </Label>
              <Input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Input
                type="text"
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">
                Prix
              </Label>
              <Input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="product_type" className="text-right">
                Type
              </Label>
              <Select onValueChange={handleProductTypeChange} value={formData.product_type || ""}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Sélectionner un type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="product">Produit</SelectItem>
                  <SelectItem value="service">Service</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Catégorie
              </Label>
              <Select onValueChange={handleSelectCategory} value={formData.category_id}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Sélectionner une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {isLoading ? (
                    <SelectItem value="" disabled>Chargement...</SelectItem>
                  ) : (
                    categories.map(category => (
                      <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sku" className="text-right">
                SKU
              </Label>
              <Input
                type="text"
                id="sku"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="tax_rate" className="text-right">
                Taux de taxe
              </Label>
              <Input
                type="number"
                id="tax_rate"
                name="tax_rate"
                value={formData.tax_rate}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="active" className="text-right">
                Actif
              </Label>
              <div className="col-span-3 flex items-center">
                <Switch
                  id="active"
                  checked={formData.active}
                  onCheckedChange={handleActiveChange}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit">
              {productData ? "Mettre à jour" : "Enregistrer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
