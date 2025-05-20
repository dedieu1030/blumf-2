
import React, { useState, useEffect } from 'react';
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { PaymentMethodDetails, CompanyProfile } from "@/types/invoice";
import { CreditCard, Banknote, Wallet, CreditCard as CheckIcon, DollarSign, PiggyBank } from 'lucide-react';

type PaymentMethod = 'card' | 'transfer' | 'paypal' | 'check' | 'cash' | 'payoneer' | 'other';

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
    card: 'Carte bancaire',
    transfer: 'Virement bancaire',
    paypal: 'PayPal',
    check: 'Chèque',
    cash: 'Espèces',
    payoneer: 'Payoneer', 
    other: 'Autre'
  };

  useEffect(() => {
    // Initialize with selected methods or default methods
    if (selectedMethods && selectedMethods.length > 0) {
      setMethods(selectedMethods);
    } else {
      // Initialize with default empty methods
      const defaultMethods: PaymentMethodDetails[] = [
        { 
          type: 'card' as PaymentMethod, 
          enabled: false,
          details: 'Paiement sécurisé par carte bancaire'
        },
        { 
          type: 'transfer' as PaymentMethod, 
          enabled: false,
          details: companyProfile ? `Virement sur le compte ${companyProfile.bankAccount}` : 'Virement bancaire'
        },
        { 
          type: 'paypal' as PaymentMethod, 
          enabled: false,
          details: companyProfile?.paypal || 'Paiement via PayPal'
        },
        { 
          type: 'check' as PaymentMethod, 
          enabled: false,
          details: `Chèque à l'ordre de ${companyProfile?.accountHolder || '[Nom du bénéficiaire]'}`
        },
        { 
          type: 'cash' as PaymentMethod, 
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

  const renderCardMethod = (method: PaymentMethodDetails, index: number) => {
    return (
      <div key="card" className="p-4 border rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5 text-primary" />
            <Label htmlFor={`method-card`}>{methodLabels['card']}</Label>
          </div>
          <Switch
            id={`method-card`}
            checked={method.enabled}
            onCheckedChange={(checked) => handleMethodToggle(index, checked)}
          />
        </div>
        
        {method.enabled && (
          <div className="mt-2">
            <Textarea
              placeholder="Instructions pour le paiement par carte"
              value={method.details || ''}
              onChange={(e) => handleMethodDetailsChange(index, e.target.value)}
              className="h-20"
            />
          </div>
        )}
      </div>
    );
  };

  const renderBankTransferMethod = (method: PaymentMethodDetails, index: number) => {
    return (
      <div key="transfer" className="p-4 border rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Banknote className="h-5 w-5 text-primary" />
            <Label htmlFor={`method-transfer`}>{methodLabels['transfer']}</Label>
          </div>
          <Switch
            id={`method-transfer`}
            checked={method.enabled}
            onCheckedChange={(checked) => handleMethodToggle(index, checked)}
          />
        </div>
        
        {method.enabled && (
          <div className="mt-2">
            <Textarea
              placeholder="Informations bancaires pour le virement"
              value={method.details || ''}
              onChange={(e) => handleMethodDetailsChange(index, e.target.value)}
              className="h-20"
            />
          </div>
        )}
      </div>
    );
  };

  const renderPaypalMethod = (method: PaymentMethodDetails, index: number) => {
    return (
      <div key="paypal" className="p-4 border rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Wallet className="h-5 w-5 text-primary" />
            <Label htmlFor={`method-paypal`}>{methodLabels['paypal']}</Label>
          </div>
          <Switch
            id={`method-paypal`}
            checked={method.enabled}
            onCheckedChange={(checked) => handleMethodToggle(index, checked)}
          />
        </div>
        
        {method.enabled && (
          <div className="mt-2">
            <Input
              placeholder="Adresse email PayPal"
              value={method.details || ''}
              onChange={(e) => handleMethodDetailsChange(index, e.target.value)}
            />
          </div>
        )}
      </div>
    );
  };

  const renderCheckMethod = (method: PaymentMethodDetails, index: number) => {
    return (
      <div key="check" className="p-4 border rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckIcon className="h-5 w-5 text-primary" />
            <Label htmlFor={`method-check`}>{methodLabels['check']}</Label>
          </div>
          <Switch
            id={`method-check`}
            checked={method.enabled}
            onCheckedChange={(checked) => handleMethodToggle(index, checked)}
          />
        </div>
        
        {method.enabled && (
          <div className="mt-2">
            <Textarea
              placeholder="Instructions pour le paiement par chèque"
              value={method.details || ''}
              onChange={(e) => handleMethodDetailsChange(index, e.target.value)}
              className="h-20"
            />
          </div>
        )}
      </div>
    );
  };

  const renderCashMethod = (method: PaymentMethodDetails, index: number) => {
    return (
      <div key="cash" className="p-4 border rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5 text-primary" />
            <Label htmlFor={`method-cash`}>{methodLabels['cash']}</Label>
          </div>
          <Switch
            id={`method-cash`}
            checked={method.enabled}
            onCheckedChange={(checked) => handleMethodToggle(index, checked)}
          />
        </div>
        
        {method.enabled && (
          <div className="mt-2">
            <Textarea
              placeholder="Instructions pour le paiement en espèces"
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
          return renderCardMethod(method, index);
        }
        if (method.type === 'transfer') {
          return renderBankTransferMethod(method, index);
        }
        if (method.type === 'paypal') {
          return renderPaypalMethod(method, index);
        }
        if (method.type === 'check') {
          return renderCheckMethod(method, index);
        }
        if (method.type === 'cash') {
          return renderCashMethod(method, index);
        }
        return null;
      })}
    </div>
  );
}
