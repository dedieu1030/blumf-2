import { PaymentMethodDetails, CompanyProfile } from '@/types/invoice';
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreditCard, BanknoteIcon, ChevronsUpDown, Trash2 } from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "react-i18next";

export interface PaymentMethodSelectorProps {
  selectedMethods?: PaymentMethodDetails[]; // Renamed from methods to selectedMethods
  methods?: PaymentMethodDetails[]; // Added methods as alternative
  onChange?: (methods: PaymentMethodDetails[]) => void;
  onMethodsChange?: (methods: PaymentMethodDetails[]) => void; // Added for compatibility
  companyProfile: CompanyProfile;
  onSaveDefault?: (methods: PaymentMethodDetails[]) => void;
}

export function PaymentMethodSelector({ 
  selectedMethods, 
  methods, 
  onChange, 
  onMethodsChange,
  companyProfile, 
  onSaveDefault 
}: PaymentMethodSelectorProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<string>("bank");
  
  // Use either selectedMethods or methods, and ensure we have a non-null array
  const paymentMethods = selectedMethods || methods || [];
  
  // Use either onChange or onMethodsChange callback
  const handleMethodsChange = onChange || onMethodsChange || (() => {});
  
  const handleMethodChange = (index: number, field: keyof PaymentMethodDetails, value: any) => {
    const updatedMethods = [...paymentMethods];
    updatedMethods[index] = {
      ...updatedMethods[index],
      [field]: value
    };
    handleMethodsChange(updatedMethods);
  };
  
  const handleAddMethod = (type: string) => {
    const newMethod: PaymentMethodDetails = {
      type: type as any,
      enabled: true,
      details: '',
    };
    
    // Add specific fields based on type
    if (type === 'transfer') {
      newMethod.bankName = companyProfile?.bankName || '';
      newMethod.accountName = companyProfile?.accountHolder || '';
      newMethod.accountNumber = companyProfile?.bankAccount || '';
    } else if (type === 'paypal') {
      newMethod.paypalEmail = companyProfile?.paypal || companyProfile?.email || '';
    }
    
    handleMethodsChange([...paymentMethods, newMethod]);
    setActiveTab(type);
  };
  
  const handleRemoveMethod = (index: number) => {
    const updatedMethods = paymentMethods.filter((_, i) => i !== index);
    handleMethodsChange(updatedMethods);
  };
  
  const getMethodsByType = (type: string) => {
    return paymentMethods.filter(method => method.type === type);
  };
  
  const bankMethods = getMethodsByType('transfer');
  const cardMethods = getMethodsByType('card');
  const paypalMethods = getMethodsByType('paypal');
  const checkMethods = getMethodsByType('check');
  const cashMethods = getMethodsByType('cash');
  const otherMethods = getMethodsByType('other');
  
  const renderBankTransferForm = (method: PaymentMethodDetails, index: number) => {
    const methodIndex = paymentMethods.findIndex(m => m === method);
    
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="font-medium">{t('bankTransfer')}</div>
          <div className="flex items-center space-x-2">
            <Switch 
              checked={method.enabled} 
              onCheckedChange={(checked) => handleMethodChange(methodIndex, 'enabled', checked)}
            />
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => handleRemoveMethod(methodIndex)}
              className="text-destructive hover:text-destructive/90"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="space-y-3">
          <div>
            <Label htmlFor={`bank-name-${index}`}>{t('bankName')}</Label>
            <Input 
              id={`bank-name-${index}`}
              value={method.bankName || ''} 
              onChange={(e) => handleMethodChange(methodIndex, 'bankName', e.target.value)}
              placeholder={t('enterBankName')}
            />
          </div>
          
          <div>
            <Label htmlFor={`account-name-${index}`}>{t('accountHolder')}</Label>
            <Input 
              id={`account-name-${index}`}
              value={method.accountName || ''} 
              onChange={(e) => handleMethodChange(methodIndex, 'accountName', e.target.value)}
              placeholder={t('enterAccountHolder')}
            />
          </div>
          
          <div>
            <Label htmlFor={`account-number-${index}`}>{t('accountNumber')}</Label>
            <Input 
              id={`account-number-${index}`}
              value={method.accountNumber || ''} 
              onChange={(e) => handleMethodChange(methodIndex, 'accountNumber', e.target.value)}
              placeholder={t('enterAccountNumber')}
            />
          </div>
          
          <div>
            <Label htmlFor={`iban-${index}`}>IBAN</Label>
            <Input 
              id={`iban-${index}`}
              value={method.iban || ''} 
              onChange={(e) => handleMethodChange(methodIndex, 'iban', e.target.value)}
              placeholder={t('enterIBAN')}
            />
          </div>
          
          <div>
            <Label htmlFor={`swift-${index}`}>SWIFT/BIC</Label>
            <Input 
              id={`swift-${index}`}
              value={method.swift || ''} 
              onChange={(e) => handleMethodChange(methodIndex, 'swift', e.target.value)}
              placeholder={t('enterSWIFT')}
            />
          </div>
        </div>
      </div>
    );
  };
  
  const renderPayPalForm = (method: PaymentMethodDetails, index: number) => {
    const methodIndex = paymentMethods.findIndex(m => m === method);
    
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="font-medium">PayPal</div>
          <div className="flex items-center space-x-2">
            <Switch 
              checked={method.enabled} 
              onCheckedChange={(checked) => handleMethodChange(methodIndex, 'enabled', checked)}
            />
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => handleRemoveMethod(methodIndex)}
              className="text-destructive hover:text-destructive/90"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div>
          <Label htmlFor={`paypal-email-${index}`}>{t('paypalEmail')}</Label>
          <Input 
            id={`paypal-email-${index}`}
            value={method.paypalEmail || ''} 
            onChange={(e) => handleMethodChange(methodIndex, 'paypalEmail', e.target.value)}
            placeholder={t('enterPayPalEmail')}
          />
        </div>
      </div>
    );
  };
  
  const renderOtherMethodForm = (method: PaymentMethodDetails, index: number) => {
    const methodIndex = paymentMethods.findIndex(m => m === method);
    
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="font-medium">
            {method.type === 'card' ? t('creditCard') : 
             method.type === 'check' ? t('check') :
             method.type === 'cash' ? t('cash') : t('otherPaymentMethod')}
          </div>
          <div className="flex items-center space-x-2">
            <Switch 
              checked={method.enabled} 
              onCheckedChange={(checked) => handleMethodChange(methodIndex, 'enabled', checked)}
            />
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => handleRemoveMethod(methodIndex)}
              className="text-destructive hover:text-destructive/90"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div>
          <Label htmlFor={`details-${index}`}>{t('paymentDetails')}</Label>
          <Input 
            id={`details-${index}`}
            value={method.details || ''} 
            onChange={(e) => handleMethodChange(methodIndex, 'details', e.target.value)}
            placeholder={t('enterPaymentDetails')}
          />
        </div>
      </div>
    );
  };
  
  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="bank">{t('bankTransfer')}</TabsTrigger>
          <TabsTrigger value="paypal">PayPal</TabsTrigger>
          <TabsTrigger value="other">{t('otherMethods')}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="bank" className="space-y-4">
          {bankMethods.length > 0 ? (
            bankMethods.map((method, index) => (
              <Card key={index}>
                <CardContent className="pt-4">
                  {renderBankTransferForm(method, index)}
                </CardContent>
              </Card>
            ))
          ) : (
            <Button 
              variant="outline" 
              onClick={() => handleAddMethod('transfer')}
              className="w-full"
            >
              <BanknoteIcon className="mr-2 h-4 w-4" />
              {t('addBankTransfer')}
            </Button>
          )}
        </TabsContent>
        
        <TabsContent value="paypal" className="space-y-4">
          {paypalMethods.length > 0 ? (
            paypalMethods.map((method, index) => (
              <Card key={index}>
                <CardContent className="pt-4">
                  {renderPayPalForm(method, index)}
                </CardContent>
              </Card>
            ))
          ) : (
            <Button 
              variant="outline" 
              onClick={() => handleAddMethod('paypal')}
              className="w-full"
            >
              <CreditCard className="mr-2 h-4 w-4" />
              {t('addPayPal')}
            </Button>
          )}
        </TabsContent>
        
        <TabsContent value="other" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cardMethods.length > 0 ? (
              cardMethods.map((method, index) => (
                <Card key={index}>
                  <CardContent className="pt-4">
                    {renderOtherMethodForm(method, index)}
                  </CardContent>
                </Card>
              ))
            ) : (
              <Button 
                variant="outline" 
                onClick={() => handleAddMethod('card')}
                className="w-full"
              >
                <CreditCard className="mr-2 h-4 w-4" />
                {t('addCreditCard')}
              </Button>
            )}
            
            {checkMethods.length > 0 ? (
              checkMethods.map((method, index) => (
                <Card key={index}>
                  <CardContent className="pt-4">
                    {renderOtherMethodForm(method, index)}
                  </CardContent>
                </Card>
              ))
            ) : (
              <Button 
                variant="outline" 
                onClick={() => handleAddMethod('check')}
                className="w-full"
              >
                <ChevronsUpDown className="mr-2 h-4 w-4" />
                {t('addCheck')}
              </Button>
            )}
            
            {cashMethods.length > 0 ? (
              cashMethods.map((method, index) => (
                <Card key={index}>
                  <CardContent className="pt-4">
                    {renderOtherMethodForm(method, index)}
                  </CardContent>
                </Card>
              ))
            ) : (
              <Button 
                variant="outline" 
                onClick={() => handleAddMethod('cash')}
                className="w-full"
              >
                <BanknoteIcon className="mr-2 h-4 w-4" />
                {t('addCash')}
              </Button>
            )}
            
            {otherMethods.length > 0 ? (
              otherMethods.map((method, index) => (
                <Card key={index}>
                  <CardContent className="pt-4">
                    {renderOtherMethodForm(method, index)}
                  </CardContent>
                </Card>
              ))
            ) : (
              <Button 
                variant="outline" 
                onClick={() => handleAddMethod('other')}
                className="w-full"
              >
                <ChevronsUpDown className="mr-2 h-4 w-4" />
                {t('addOtherMethod')}
              </Button>
            )}
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-end">
        <Button onClick={() => onSaveDefault && onSaveDefault(paymentMethods)}>
          {t('saveAsDefault')}
        </Button>
      </div>
    </div>
  );
}
