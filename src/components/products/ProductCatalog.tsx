import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Search, 
  Plus, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye, 
  Tag, 
  Check, 
  X 
} from "lucide-react";
import { formatPrice, getProducts, Product } from "@/services/productService";
import { ProductForm } from "./ProductForm";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function ProductCatalog() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [showInactive, setShowInactive] = useState(false);
  const [typeFilter, setTypeFilter] = useState<string>("all");

  // Load products
  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      const data = await getProducts();
      setProducts(data);
      setFilteredProducts(data);
      setIsLoading(false);
    };

    loadProducts();
  }, [showInactive]);

  // Filter products based on search term and type filter
  useEffect(() => {
    let filtered = [...products];

    if (searchTerm) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        product.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter(product => product.product_type === typeFilter);
    }

    setFilteredProducts(filtered);
  }, [searchTerm, typeFilter, products]);

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setFormDialogOpen(true);
  };

  const handleDeleteProduct = (product: Product) => {
    setSelectedProduct(product);
    setDeleteDialogOpen(true);
  };

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
    setViewDialogOpen(true);
  };

  const handleProductUpdated = () => {
    // Refresh data
    getProducts().then(data => {
      setProducts(data);
      setFilteredProducts(data);
    });
    setFormDialogOpen(false);
    setSelectedProduct(null);
  };

  const handleProductDeleted = () => {
    // Remove the product from the list
    const updatedProducts = products.filter(p => p.id !== selectedProduct?.id);
    setProducts(updatedProducts);
    setFilteredProducts(updatedProducts);
    setDeleteDialogOpen(false);
    setSelectedProduct(null);
  };

  const getRecurringBadge = (product: Product) => {
    if (!product.is_recurring) return null;
    
    const intervalMap: Record<string, string> = {
      day: product.recurring_interval_count === 1 ? 'jour' : 'jours',
      week: product.recurring_interval_count === 1 ? 'semaine' : 'semaines',
      month: 'mois',
      year: product.recurring_interval_count === 1 ? 'an' : 'ans',
    };
    
    const intervalText = product.recurring_interval ? 
      `${product.recurring_interval_count} ${intervalMap[product.recurring_interval]}` : '';
    
    return (
      <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700 border-blue-200">
        Récurrent ({intervalText})
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="flex items-center space-x-2">
            <Switch
              id="show-inactive"
              checked={showInactive}
              onCheckedChange={setShowInactive}
            />
            <Label htmlFor="show-inactive">Afficher inactifs</Label>
          </div>
          
          <Select
            value={typeFilter}
            onValueChange={setTypeFilter}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les types</SelectItem>
              <SelectItem value="product">Produits</SelectItem>
              <SelectItem value="service">Services</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={() => {
            setSelectedProduct(null);
            setFormDialogOpen(true);
          }}>
            <Plus className="mr-2 h-4 w-4" />
            Nouveau
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin h-8 w-8 border-t-2 border-primary rounded-full mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Chargement des produits...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-muted/20">
          <Tag className="h-12 w-12 mx-auto text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">Aucun produit trouvé</h3>
          <p className="mt-1 text-muted-foreground">
            Créez votre premier produit ou service en cliquant sur le bouton "Nouveau".
          </p>
          <Button className="mt-4" onClick={() => {
            setSelectedProduct(null);
            setFormDialogOpen(true);
          }}>
            <Plus className="mr-2 h-4 w-4" />
            Nouveau produit
          </Button>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Nom</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Prix</TableHead>
                <TableHead className="hidden md:table-cell">TVA</TableHead>
                <TableHead className="hidden md:table-cell">Statut</TableHead>
                <TableHead className="w-[100px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <p>Aucun produit trouvé</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product) => (
                  <TableRow key={product.id} className={!product.active ? "opacity-60" : ""}>
                    <TableCell className="font-medium">
                      <div>
                        {product.name}
                        {getRecurringBadge(product)}
                        {!product.active && (
                          <Badge variant="outline" className="ml-2 bg-gray-50 text-gray-500">
                            Inactif
                          </Badge>
                        )}
                      </div>
                      {product.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {product.description}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      {product.product_type === 'product' ? 'Produit' : 
                       product.product_type === 'service' ? 'Service' : 
                       'Non défini'}
                    </TableCell>
                    <TableCell>{formatPrice(product.price_cents, product.currency)}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {product.tax_rate !== null ? `${product.tax_rate}%` : '-'}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {product.active ? (
                        <div className="flex items-center">
                          <Check className="h-4 w-4 text-green-500 mr-1" />
                          <span>Actif</span>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <X className="h-4 w-4 text-gray-500 mr-1" />
                          <span>Inactif</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewProduct(product)}>
                            <Eye className="h-4 w-4 mr-2" /> Voir
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditProduct(product)}>
                            <Edit className="h-4 w-4 mr-2" /> Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteProduct(product)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" /> Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <ProductForm
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        product={selectedProduct}
        onUpdate={handleProductUpdated}
      />
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Vous êtes sur le point de supprimer le produit "{selectedProduct?.name}".
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={handleProductDeleted}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Detailed product view dialog */}
      {selectedProduct && (
        <AlertDialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <AlertDialogContent className="max-w-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl">
                {selectedProduct.name}
              </AlertDialogTitle>
            </AlertDialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Type</h3>
                  <p>
                    {selectedProduct.product_type === 'product' ? 'Produit' : 
                    selectedProduct.product_type === 'service' ? 'Service' : 
                    'Non défini'}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Prix</h3>
                  <p>{formatPrice(selectedProduct.price_cents, selectedProduct.currency)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">TVA</h3>
                  <p>{selectedProduct.tax_rate !== null ? `${selectedProduct.tax_rate}%` : '-'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Statut</h3>
                  <p>{selectedProduct.active ? 'Actif' : 'Inactif'}</p>
                </div>
                {selectedProduct.is_recurring && selectedProduct.recurring_interval_count && (
                  <div className="col-span-2">
                    <h3 className="text-sm font-medium text-muted-foreground">Facturation récurrente</h3>
                    <p>
                      Tous les {selectedProduct.recurring_interval_count} {
                        selectedProduct.recurring_interval === 'day' ? 
                          (selectedProduct.recurring_interval_count === 1 ? 'jour' : 'jours') : 
                        selectedProduct.recurring_interval === 'week' ? 
                          (selectedProduct.recurring_interval_count === 1 ? 'semaine' : 'semaines') : 
                        selectedProduct.recurring_interval === 'month' ? 
                          'mois' : 
                        selectedProduct.recurring_interval === 'year' ? 
                          (selectedProduct.recurring_interval_count === 1 ? 'an' : 'ans') : 
                        ''
                      }
                    </p>
                  </div>
                )}
                {selectedProduct.description && (
                  <div className="col-span-2">
                    <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
                    <p className="whitespace-pre-wrap">{selectedProduct.description}</p>
                  </div>
                )}
              </div>
              
              <div className="pt-2">
                <h3 className="text-sm font-medium text-muted-foreground">Créé le</h3>
                <p>{selectedProduct.created_at ? new Date(selectedProduct.created_at).toLocaleDateString() : '-'}</p>
              </div>
            </div>
            <AlertDialogFooter>
              <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
                Fermer
              </Button>
              <Button onClick={() => {
                setViewDialogOpen(false);
                handleEditProduct(selectedProduct);
              }}>
                <Edit className="h-4 w-4 mr-2" />
                Modifier
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
