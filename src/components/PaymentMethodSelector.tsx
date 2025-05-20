
import React, { useState, useEffect } from 'react';
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PaymentMethodDetails, CompanyProfile } from "@/types/invoice";
import { CreditCard, Banknote, Wallet, CreditCard as CheckIcon, DollarSign } from 'lucide-react';

interface PaymentMethodSelectorProps {
  selectedMethods: PaymentMethodDetails[];
  onMethodsChange: (methods: PaymentMethodDetails[]) => void;
  companyProfile?: CompanyProfile;
}

export function PaymentMethodSelector({ 
  selectedMethods, 
  onMethodsChange,
  companyProfile 
}: PaymentMethodSelectorProps) {
  const [methods, setMethods] = useState<PaymentMethodDetails[]>([]);
  
  // Translate payment method type to display name
  const methodLabels: Record<string, string> = {
    'card': 'Carte bancaire',
    'transfer': 'Virement bancaire',
    'paypal': 'PayPal',
    'check': 'Chèque',
    'cash': 'Espèces',
    'payoneer': 'Payoneer', 
    'other': 'Autre'
  };

  useEffect(() => {
    // Initialize with selected methods or default methods
    if (selectedMethods && selectedMethods.length > 0) {
      setMethods(selectedMethods);
    } else {
      // Initialize with default empty methods
      const defaultMethods: PaymentMethodDetails[] = [
        { 
          type: 'card', 
          enabled: false,
          details: 'Paiement sécurisé par carte bancaire'
        },
        { 
          type: 'transfer', 
          enabled: false,
          details: companyProfile ? `Virement sur le compte ${companyProfile.bankAccount}` : 'Virement bancaire'
        },
        { 
          type: 'paypal', 
          enabled: false,
          details: companyProfile?.paypal || 'Paiement via PayPal'
        },
        { 
          type: 'check', 
          enabled: false,
          details: `Chèque à l'ordre de ${companyProfile?.accountHolder || '[Nom du bénéficiaire]'}`
        },
        { 
          type: 'cash', 
          enabled: false,
          details: 'Paiement en espèces'
        }
      ];
      setMethods(defaultMethods);
    }
  }, [companyProfile]);

  const handleMethodToggle = (index: number, enabled: boolean) => {
    const updatedMethods = [...methods];
    updatedMethods[index] = { ...updatedMethods[index], enabled };
    setMethods(updatedMethods);
    onMethodsChange(updatedMethods.filter(m => m.enabled));
  };

  const handleMethodDetailsChange = (index: number, details: string) => {
    const updatedMethods = [...methods];
    updatedMethods[index] = { ...updatedMethods[index], details };
    setMethods(updatedMethods);
    onMethodsChange(updatedMethods.filter(m => m.enabled));
  };

  const renderMethodCard = (method: PaymentMethodDetails, index: number, Icon: React.ComponentType<any>, methodKey: string) => {
    return (
      <div key={methodKey} className="p-4 border rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Icon className="h-5 w-5 text-primary" />
            <Label htmlFor={`method-${methodKey}`}>{methodLabels[methodKey]}</Label>
          </div>
          <Switch
            id={`method-${methodKey}`}
            checked={method.enabled}
            onCheckedChange={(checked) => handleMethodToggle(index, checked)}
          />
        </div>
        
        {method.enabled && (
          <div className="mt-2">
            <Textarea
              placeholder={`Instructions pour le paiement par ${methodLabels[methodKey].toLowerCase()}`}
              value={method.details || ''}
              onChange={(e) => handleMethodDetailsChange(index, e.target.value)}
              className="h-20"
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {methods.map((method, index) => {
        if (method.type === 'card') {
          return renderMethodCard(method, index, CreditCard, 'card');
        }
        if (method.type === 'transfer') {
          return renderMethodCard(method, index, Banknote, 'transfer');
        }
        if (method.type === 'paypal') {
          return renderMethodCard(method, index, Wallet, 'paypal');
        }
        if (method.type === 'check') {
          return renderMethodCard(method, index, CheckIcon, 'check');
        }
        if (method.type === 'cash') {
          return renderMethodCard(method, index, DollarSign, 'cash');
        }
        return null;
      })}
    </div>
  );
}
