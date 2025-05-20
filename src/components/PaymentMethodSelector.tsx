
import React, { useState, useEffect } from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PaymentMethod, PaymentMethodDetails, CompanyProfile } from "@/types/invoice";

interface PaymentMethodSelectorProps {
  methods: PaymentMethodDetails[];
  onChange: (methods: PaymentMethodDetails[]) => void;
  companyProfile: CompanyProfile | null;
  onSaveDefault?: (methods: PaymentMethodDetails[]) => void;
}

const paymentMethodLabels: Record<string, string> = {
  card: "Carte bancaire (Stripe)",
  transfer: "Virement bancaire",
  paypal: "PayPal",
  check: "Chèque",
  cash: "Espèces",
  payoneer: "Payoneer",
  other: "Autre"
};

export function PaymentMethodSelector({ 
  methods, 
  onChange,
  companyProfile,
  onSaveDefault
}: PaymentMethodSelectorProps) {
  const { toast } = useToast();
  const [savedMethods, setSavedMethods] = useState<PaymentMethodDetails[]>([]);

  // Load saved payment methods on component mount
  useEffect(() => {
    const savedPaymentMethods = localStorage.getItem('defaultPaymentMethods');
    if (savedPaymentMethods) {
      try {
        setSavedMethods(JSON.parse(savedPaymentMethods));
      } catch (e) {
        console.error("Error parsing saved payment methods", e);
      }
    }
  }, []);

  const updateMethod = (type: string, enabled: boolean, details?: string) => {
    const existingIndex = methods.findIndex(m => m.type === type);
    const updatedMethods = [...methods];
    
    if (existingIndex >= 0) {
      if (enabled) {
        updatedMethods[existingIndex] = { 
          ...updatedMethods[existingIndex], 
          enabled,
          ...(details !== undefined ? { details } : {})
        };
      } else {
        updatedMethods.splice(existingIndex, 1);
      }
    } else if (enabled) {
      updatedMethods.push({ type, enabled, details });
    }
    
    onChange(updatedMethods);
  };

  const getMethodStatus = (type: string): { enabled: boolean, details?: string } => {
    const method = methods.find(m => m.type === type);
    if (method) {
      let methodDetails = typeof method.details === 'string' ? method.details : undefined;
      return { enabled: !!method.enabled, details: methodDetails };
    }
    return { enabled: false };
  };

  const handleSaveAsDefault = () => {
    // Save current methods as default
    localStorage.setItem('defaultPaymentMethods', JSON.stringify(methods));
    setSavedMethods(methods);
    
    if (onSaveDefault) {
      onSaveDefault(methods);
    }
    
    toast({
      title: "Méthodes de paiement sauvegardées",
      description: "Ces méthodes seront proposées par défaut pour vos nouvelles factures"
    });
  };

  const loadDefaultMethods = () => {
    if (savedMethods.length > 0) {
      onChange(savedMethods);
      
      toast({
        title: "Méthodes par défaut chargées",
        description: "Les méthodes de paiement par défaut ont été appliquées"
      });
    }
  };

  // Conditions pour afficher ou non certaines méthodes
  const showPaypal = !!companyProfile?.paypal;
  const showPayoneer = !!companyProfile?.payoneer;
  const showBankTransfer = !!(companyProfile?.bankName && companyProfile?.bankAccount);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Méthodes de paiement acceptées</h3>
        
        {savedMethods.length > 0 && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={loadDefaultMethods}
          >
            Charger méthodes par défaut
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="payment-card" 
            checked={getMethodStatus('card').enabled}
            onCheckedChange={(checked) => updateMethod('card', checked as boolean)}
          />
          <Label htmlFor="payment-card">{paymentMethodLabels.card}</Label>
        </div>
        
        {showBankTransfer && (
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="payment-transfer" 
              checked={getMethodStatus('transfer').enabled}
              onCheckedChange={(checked) => updateMethod('transfer', checked as boolean)}
            />
            <Label htmlFor="payment-transfer">{paymentMethodLabels.transfer}</Label>
          </div>
        )}
        
        {showPaypal && (
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="payment-paypal" 
              checked={getMethodStatus('paypal').enabled}
              onCheckedChange={(checked) => updateMethod('paypal', checked as boolean)}
            />
            <Label htmlFor="payment-paypal">{paymentMethodLabels.paypal}</Label>
          </div>
        )}
        
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="payment-check" 
            checked={getMethodStatus('check').enabled}
            onCheckedChange={(checked) => updateMethod('check', checked as boolean)}
          />
          <Label htmlFor="payment-check">{paymentMethodLabels.check}</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="payment-cash" 
            checked={getMethodStatus('cash').enabled}
            onCheckedChange={(checked) => updateMethod('cash', checked as boolean)}
          />
          <Label htmlFor="payment-cash">{paymentMethodLabels.cash}</Label>
        </div>
        
        {showPayoneer && (
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="payment-payoneer" 
              checked={getMethodStatus('payoneer').enabled}
              onCheckedChange={(checked) => updateMethod('payoneer', checked as boolean)}
            />
            <Label htmlFor="payment-payoneer">
              {paymentMethodLabels.payoneer}
            </Label>
          </div>
        )}
        
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="payment-other" 
            checked={getMethodStatus('other').enabled}
            onCheckedChange={(checked) => updateMethod('other', checked as boolean)}
          />
          <Label htmlFor="payment-other">{paymentMethodLabels.other}</Label>
        </div>
      </div>
      
      {getMethodStatus('other').enabled && (
        <Card className="mt-4">
          <CardContent className="pt-4">
            <Label htmlFor="other-payment-details" className="mb-2 block">Précisez les autres méthodes de paiement</Label>
            <Textarea 
              id="other-payment-details" 
              placeholder="Exemple: Paiement par SEPA à l'ordre de..." 
              value={getMethodStatus('other').details || ''}
              onChange={(e) => updateMethod('other', true, e.target.value)}
            />
          </CardContent>
        </Card>
      )}
      
      <div className="flex justify-end mt-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleSaveAsDefault}
        >
          <Save className="mr-2 h-4 w-4" />
          Définir comme méthodes par défaut
        </Button>
      </div>
    </div>
  );
}

export default PaymentMethodSelector;
