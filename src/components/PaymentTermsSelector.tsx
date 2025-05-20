
import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { PaymentTermTemplate } from '@/types/invoice';
import { getPaymentTermsTemplates, savePaymentTermTemplate, setDefaultTemplate } from '@/services/paymentTermsService';

interface PaymentTermsSelectorProps {
  selectedTermId?: string;
  customTerms?: string;
  onSelect: (template: PaymentTermTemplate) => void;
  onCustomTermsChange?: (terms: string) => void;
}

export function PaymentTermsSelector({ 
  selectedTermId, 
  customTerms = "", 
  onSelect, 
  onCustomTermsChange 
}: PaymentTermsSelectorProps) {
  const [templates, setTemplates] = useState<PaymentTermTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<PaymentTermTemplate | null>(null);
  const [isCustom, setIsCustom] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadTemplates() {
      try {
        const loadedTemplates = await getPaymentTermsTemplates();
        setTemplates(loadedTemplates);
        
        // Set initial selected template
        if (selectedTermId) {
          const template = loadedTemplates.find(t => t.id === selectedTermId);
          if (template) {
            setSelectedTemplate(template);
          }
        } else {
          // Set default template
          const defaultTemplate = loadedTemplates.find(t => t.isDefault);
          if (defaultTemplate) {
            setSelectedTemplate(defaultTemplate);
            onSelect(defaultTemplate);
          }
        }
      } catch (error) {
        console.error("Failed to load payment terms templates:", error);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadTemplates();
  }, [selectedTermId, onSelect]);

  const handleTemplateChange = (templateId: string) => {
    if (templateId === 'custom') {
      setIsCustom(true);
      setSelectedTemplate(null);
    } else {
      setIsCustom(false);
      const template = templates.find(t => t.id === templateId);
      if (template) {
        setSelectedTemplate(template);
        onSelect(template);
      }
    }
  };

  const handleCustomTermsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (onCustomTermsChange) {
      onCustomTermsChange(e.target.value);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="paymentTerms">Conditions de paiement</Label>
        <Select
          value={isCustom ? 'custom' : selectedTemplate?.id}
          onValueChange={handleTemplateChange}
          disabled={isLoading}
        >
          <SelectTrigger className="w-full" id="paymentTerms">
            <SelectValue placeholder="Sélectionner des conditions de paiement" />
          </SelectTrigger>
          <SelectContent>
            {templates.map((template) => (
              <SelectItem key={template.id} value={template.id}>
                {template.name} ({template.days} jours)
              </SelectItem>
            ))}
            <SelectItem value="custom">Personnalisé</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isCustom && (
        <div>
          <Label htmlFor="customTerms">Conditions personnalisées</Label>
          <Textarea
            id="customTerms"
            value={customTerms}
            onChange={handleCustomTermsChange}
            placeholder="Entrez vos conditions de paiement personnalisées..."
            className="min-h-[100px]"
          />
        </div>
      )}

      {selectedTemplate && !isCustom && (
        <div className="p-4 bg-muted/50 rounded-md">
          <p className="font-medium">{selectedTemplate.name}</p>
          <p className="text-sm text-muted-foreground mt-1">{selectedTemplate.termsText}</p>
        </div>
      )}
    </div>
  );
}
