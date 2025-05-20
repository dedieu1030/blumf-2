
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from "@/components/ui/textarea";
import { PaymentTermTemplate } from "@/types/invoice";
import { getPaymentTermsTemplates, savePaymentTermTemplate, setDefaultTemplate } from '@/services/paymentTermsService';

interface PaymentTermsSelectorProps {
  onSelect: (template: PaymentTermTemplate) => void;
  customTerms?: string;
  onCustomTermsChange?: (terms: string) => void;
}

export function PaymentTermsSelector({ onSelect, customTerms = '', onCustomTermsChange }: PaymentTermsSelectorProps) {
  const [templates, setTemplates] = useState<PaymentTermTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [customDate, setCustomDate] = useState<Date | undefined>(undefined);
  const [showCustomTerms, setShowCustomTerms] = useState(false);
  const [newTemplateDialogOpen, setNewTemplateDialogOpen] = useState(false);
  
  // New template state
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateDelayDays, setNewTemplateDelayDays] = useState('');
  const [newTemplateText, setNewTemplateText] = useState('');
  
  const paymentDelayOptions = [
    { value: 'immediate', label: 'Paiement immédiat' },
    { value: '7days', label: '7 jours' },
    { value: '15days', label: '15 jours' },
    { value: '30days', label: '30 jours' },
    { value: '45days', label: '45 jours' },
    { value: '60days', label: '60 jours' },
    { value: '90days', label: '90 jours' },
    { value: 'custom', label: 'Date personnalisée' }
  ];

  useEffect(() => {
    // Load templates from local storage
    const savedTemplates = getPaymentTermsTemplates();
    setTemplates(savedTemplates);
    
    // If there's a default template, select it
    const defaultTemplate = savedTemplates.find(t => t.isDefault);
    if (defaultTemplate) {
      setSelectedTemplateId(defaultTemplate.id);
      onSelect(defaultTemplate);
    }
  }, []);

  const handlePaymentTermsSelect = (templateId: string) => {
    setSelectedTemplateId(templateId);
    
    if (templateId === 'custom') {
      setShowCustomTerms(true);
      return;
    } else {
      setShowCustomTerms(false);
    }
    
    const selectedTemplate = templates.find(t => t.id === templateId);
    if (selectedTemplate) {
      onSelect(selectedTemplate);
    }
  };

  const handleCreateTemplate = () => {
    if (!newTemplateName.trim() || !newTemplateDelayDays.trim()) {
      return;
    }
    
    const newTemplate: PaymentTermTemplate = {
      id: Date.now().toString(),
      name: newTemplateName,
      days: parseInt(newTemplateDelayDays),
      delay: `${newTemplateDelayDays} days`,
      description: `Payment due in ${newTemplateDelayDays} days`,
      termsText: newTemplateText,
      isDefault: false
    };
    
    const updatedTemplates = savePaymentTermTemplate(newTemplate, templates);
    setTemplates(updatedTemplates);
    setSelectedTemplateId(newTemplate.id);
    onSelect(newTemplate);
    
    // Reset form
    setNewTemplateName('');
    setNewTemplateDelayDays('');
    setNewTemplateText('');
    setNewTemplateDialogOpen(false);
  };
  
  const setAsDefault = (templateId: string) => {
    const updatedTemplates = setDefaultTemplate(templateId, templates);
    setTemplates(updatedTemplates);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="paymentTerms">Conditions de paiement</Label>
        <Select value={selectedTemplateId} onValueChange={handlePaymentTermsSelect}>
          <SelectTrigger>
            <SelectValue placeholder="Choisir les conditions de paiement" />
          </SelectTrigger>
          <SelectContent>
            {templates.map(template => (
              <SelectItem key={template.id} value={template.id}>
                {template.name} {template.isDefault && '(Par défaut)'}
              </SelectItem>
            ))}
            <SelectItem value="custom">Conditions personnalisées</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {showCustomTerms && (
        <div>
          <Label htmlFor="customTerms">Conditions personnalisées</Label>
          <Textarea
            id="customTerms"
            value={customTerms}
            onChange={e => onCustomTermsChange?.(e.target.value)}
            placeholder="Entrez les conditions de paiement personnalisées..."
            className="min-h-[100px]"
          />
        </div>
      )}
      
      <div className="flex items-center space-x-2">
        <Dialog open={newTemplateDialogOpen} onOpenChange={setNewTemplateDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" type="button" size="sm">
              Nouvelle condition
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer un nouveau modèle de conditions de paiement</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="templateName">Nom du modèle</Label>
                <Input
                  id="templateName"
                  value={newTemplateName}
                  onChange={e => setNewTemplateName(e.target.value)}
                  placeholder="Ex: Paiement à 30 jours"
                />
              </div>
              <div>
                <Label htmlFor="templateDelay">Délai (en jours)</Label>
                <Input
                  id="templateDelay"
                  type="number"
                  value={newTemplateDelayDays}
                  onChange={e => setNewTemplateDelayDays(e.target.value)}
                  placeholder="Ex: 30"
                />
              </div>
              <div>
                <Label htmlFor="templateText">Texte des conditions</Label>
                <Textarea
                  id="templateText"
                  value={newTemplateText}
                  onChange={e => setNewTemplateText(e.target.value)}
                  placeholder="Ex: Paiement à effectuer dans les 30 jours suivant la réception de la facture."
                  className="min-h-[100px]"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreateTemplate}>Créer</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {selectedTemplateId && selectedTemplateId !== 'custom' && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setAsDefault(selectedTemplateId)}
          >
            Définir par défaut
          </Button>
        )}
      </div>
    </div>
  );
}
