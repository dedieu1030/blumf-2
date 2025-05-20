
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Edit, Trash } from "lucide-react";
import { PaymentTermTemplate } from "@/types/invoice";
import { getPaymentTermTemplates, savePaymentTermTemplates } from "@/services/invoiceSettingsService";
import { useToast } from "@/hooks/use-toast";

export function PaymentTermsSettings() {
  const { toast } = useToast();
  const [paymentTermTemplates, setPaymentTermTemplates] = useState<PaymentTermTemplate[]>([]);
  const [isEditingTemplate, setIsEditingTemplate] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<PaymentTermTemplate | null>(null);
  const [newTemplateName, setNewTemplateName] = useState("");
  const [newTemplateDelay, setNewTemplateDelay] = useState("15");
  const [newTemplateDate, setNewTemplateDate] = useState("");
  const [newTemplateTerms, setNewTemplateTerms] = useState("");
  const [newTemplateDefault, setNewTemplateDefault] = useState(false);

  useEffect(() => {
    setPaymentTermTemplates(getPaymentTermTemplates());
  }, []);
  
  const openTermTemplateEditor = (template?: PaymentTermTemplate) => {
    if (template) {
      // Edition d'un modèle existant
      setEditingTemplate(template);
      setNewTemplateName(template.name);
      setNewTemplateDelay(template.delay);
      setNewTemplateDate(template.customDate || "");
      setNewTemplateTerms(template.termsText);
      setNewTemplateDefault(template.isDefault || false);
    } else {
      // Création d'un nouveau modèle
      setEditingTemplate(null);
      setNewTemplateName("");
      setNewTemplateDelay("15");
      setNewTemplateDate("");
      setNewTemplateTerms("Paiement à réception de facture. Des pénalités de retard de 3 fois le taux d'intérêt légal seront appliquées en cas de paiement après la date d'échéance.");
      setNewTemplateDefault(false);
    }
    setIsEditingTemplate(true);
  };

  const saveTermTemplate = () => {
    if (!newTemplateName.trim()) {
      toast({
        title: "Nom requis",
        description: "Veuillez donner un nom à ce modèle de conditions",
        variant: "destructive"
      });
      return;
    }

    let updatedTemplates: PaymentTermTemplate[];
    
    if (editingTemplate) {
      // Mettre à jour un modèle existant
      updatedTemplates = paymentTermTemplates.map(t => 
        t.id === editingTemplate.id 
          ? {
              ...t,
              name: newTemplateName,
              delay: newTemplateDelay,
              days: parseInt(newTemplateDelay) || 0, // Add days property
              description: t.description || "Payment terms", // Ensure description exists
              customDate: newTemplateDelay === "custom" ? newTemplateDate : undefined,
              termsText: newTemplateTerms,
              isDefault: newTemplateDefault
            }
          : newTemplateDefault ? { ...t, isDefault: false } : t
      );
    } else {
      // Créer un nouveau modèle
      const newTemplate: PaymentTermTemplate = {
        id: Date.now().toString(),
        name: newTemplateName,
        delay: newTemplateDelay,
        days: parseInt(newTemplateDelay) || 0, // Add days property
        description: "Default payment terms", // Add description property
        customDate: newTemplateDelay === "custom" ? newTemplateDate : undefined,
        termsText: newTemplateTerms,
        isDefault: newTemplateDefault
      };
      
      // Si le nouveau modèle est défini par défaut, supprimer la définition par défaut des autres
      updatedTemplates = newTemplateDefault 
        ? paymentTermTemplates.map(t => ({ ...t, isDefault: false }))
        : [...paymentTermTemplates];
      
      // Add the new template to the updated templates array
      updatedTemplates.push(newTemplate);
    }
    
    setPaymentTermTemplates(updatedTemplates);
    savePaymentTermTemplates(updatedTemplates);
    
    toast({
      title: editingTemplate ? "Modèle mis à jour" : "Modèle créé",
      description: `Le modèle "${newTemplateName}" a été ${editingTemplate ? "mis à jour" : "créé"} avec succès`
    });
    
    setIsEditingTemplate(false);
  };

  const deleteTermTemplate = (id: string) => {
    const updatedTemplates = paymentTermTemplates.filter(t => t.id !== id);
    setPaymentTermTemplates(updatedTemplates);
    savePaymentTermTemplates(updatedTemplates);
    
    toast({
      title: "Modèle supprimé",
      description: "Le modèle de conditions a été supprimé"
    });
  };
  
  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Conditions de paiement</CardTitle>
            <CardDescription>Créez et gérez des modèles de conditions de paiement</CardDescription>
          </div>
          <Button onClick={() => openTermTemplateEditor()}>
            <Plus className="mr-2 h-4 w-4" />
            Nouveau modèle
          </Button>
        </CardHeader>
        <CardContent>
          {paymentTermTemplates.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Vous n'avez pas encore créé de modèles de conditions de paiement.</p>
              <p className="mt-2">Créez votre premier modèle pour l'utiliser dans vos factures.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {paymentTermTemplates.map((template) => (
                <div key={template.id} className="border rounded-md p-4 relative">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium flex items-center">
                        {template.name}
                        {template.isDefault && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                            Par défaut
                          </span>
                        )}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Délai: {template.delay === "immediate" 
                          ? "Paiement immédiat" 
                          : template.delay === "custom" 
                            ? `Date spécifique: ${template.customDate}` 
                            : `${template.delay} jours`}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="icon" onClick={() => openTermTemplateEditor(template)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => deleteTermTemplate(template.id)}>
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-3 text-sm bg-gray-50 p-2 rounded">
                    {template.termsText}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog d'édition de modèle de conditions */}
      <Dialog open={isEditingTemplate} onOpenChange={setIsEditingTemplate}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? "Modifier un modèle" : "Créer un modèle"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="template-name">Nom du modèle</Label>
              <Input 
                id="template-name" 
                value={newTemplateName}
                onChange={(e) => setNewTemplateName(e.target.value)}
                placeholder="Ex: Conditions Standard 30 jours"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="template-delay">Délai de paiement</Label>
                <select 
                  id="template-delay"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={newTemplateDelay}
                  onChange={(e) => setNewTemplateDelay(e.target.value)}
                >
                  <option value="immediate">Paiement immédiat</option>
                  <option value="7">7 jours</option>
                  <option value="15">15 jours</option>
                  <option value="30">30 jours</option>
                  <option value="45">45 jours</option>
                  <option value="60">60 jours</option>
                  <option value="90">90 jours</option>
                  <option value="custom">Date spécifique</option>
                </select>
              </div>
              
              {newTemplateDelay === "custom" && (
                <div className="space-y-2">
                  <Label htmlFor="template-date">Date d'échéance</Label>
                  <Input 
                    id="template-date" 
                    type="date"
                    value={newTemplateDate}
                    onChange={(e) => setNewTemplateDate(e.target.value)}
                  />
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="template-terms">Texte des conditions</Label>
              <Textarea 
                id="template-terms" 
                value={newTemplateTerms}
                onChange={(e) => setNewTemplateTerms(e.target.value)}
                className="min-h-[120px]"
                placeholder="Paiement à réception de facture. Des pénalités de retard de 3 fois le taux d'intérêt légal seront appliquées en cas de paiement après la date d'échéance."
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch 
                id="template-default"
                checked={newTemplateDefault}
                onCheckedChange={setNewTemplateDefault}
              />
              <Label htmlFor="template-default">Définir comme conditions par défaut</Label>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditingTemplate(false)}>Annuler</Button>
            <Button onClick={saveTermTemplate}>
              {editingTemplate ? "Mettre à jour" : "Créer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
