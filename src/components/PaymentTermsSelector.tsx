
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { getPaymentTermsTemplates } from "@/services/paymentTermsService";
import { PaymentTermTemplate } from "@/types/invoice";

interface PaymentTermsSelectorProps {
  onSelect: (template: PaymentTermTemplate) => void;
  customTerms: string;
  onCustomTermsChange: (terms: string) => void;
  selectedTemplateId?: string;
}

export function PaymentTermsSelector({
  onSelect,
  customTerms,
  onCustomTermsChange,
  selectedTemplateId
}: PaymentTermsSelectorProps) {
  const [templates, setTemplates] = useState<PaymentTermTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>(selectedTemplateId || "");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function loadTemplates() {
      setIsLoading(true);
      try {
        const paymentTermTemplates = await getPaymentTermsTemplates();
        setTemplates(paymentTermTemplates);
        
        // Select default template if none is selected
        if (!selectedTemplate) {
          const defaultTemplate = paymentTermTemplates.find(t => t.isDefault);
          if (defaultTemplate) {
            setSelectedTemplate(defaultTemplate.id);
            onSelect(defaultTemplate);
          }
        }
      } catch (error) {
        console.error("Error loading payment terms:", error);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadTemplates();
  }, []);

  const handleTemplateChange = (value: string) => {
    setSelectedTemplate(value);
    const template = templates.find(t => t.id === value);
    if (template) {
      onSelect(template);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Conditions de paiement</Label>
        <RadioGroup 
          value={selectedTemplate} 
          onValueChange={handleTemplateChange}
          className="mt-2 space-y-2"
          disabled={isLoading}
        >
          {templates.map((template) => (
            <div key={template.id} className="flex items-center space-x-2">
              <RadioGroupItem value={template.id} id={`term-${template.id}`} />
              <Label htmlFor={`term-${template.id}`} className="cursor-pointer">
                <span className="font-medium">{template.name}</span>
                <span className="ml-2 text-gray-500">({template.description})</span>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div>
        <Label htmlFor="customTerms">Termes personnalisés</Label>
        <Textarea
          id="customTerms"
          value={customTerms}
          onChange={(e) => onCustomTermsChange(e.target.value)}
          placeholder="Entrez des termes personnalisés pour cette facture..."
          disabled={isLoading}
          className="mt-1"
        />
      </div>
    </div>
  );
}
