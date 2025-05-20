import React, { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash, Plus, ArrowLeft, ArrowRight, Save, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { generateInvoicePreview } from "@/services/pdfGenerator";
import { createStripeCheckoutSession } from "@/services/stripe";
import { InvoicePreview } from "@/components/InvoicePreview";
import { InvoicePaymentLink } from "@/components/InvoicePaymentLink";
import { PaymentMethodSelector } from "@/components/PaymentMethodSelector";
import { PaymentTermsSelector } from "@/components/PaymentTermsSelector";
import { ClientSelector, Client } from "@/components/ClientSelector";
import { PaymentMethodDetails, ServiceLine, InvoiceData, CompanyProfile, PaymentTermTemplate, DiscountInfo, SignatureData } from "@/types/invoice";
import { fetchProducts, formatPrice, Product } from "@/services/productService";
import { DiscountSelector } from "@/components/DiscountSelector";
import { CustomInvoiceText } from "@/components/CustomInvoiceText";
import { SignatureCanvas } from "@/components/SignatureCanvas";
import { SignatureSelector } from "@/components/SignatureSelector";
import { SignatureDisplay } from "@/components/SignatureDisplay";
import { createQuote, updateQuote, updateQuoteItems, fetchQuoteById, generateQuoteNumber } from '@/services/quoteService';
import { savePaymentTermTemplate } from "@/services/paymentTermsService";

// Define invoice template types
const invoiceTemplates = [
  {
    id: "classic",
    name: "Classique",
    description: "Un design professionnel et intemporel",
    previewBg: "bg-bleuclair",
    accent: "border-credornoir",
  },
  {
    id: "modern",
    name: "Moderne",
    description: "Un style épuré et minimaliste",
    previewBg: "bg-white",
    accent: "border-violet",
  },
  {
    id: "elegant",
    name: "Élégant",
    description: "Sophistiqué avec une typographie raffinée",
    previewBg: "bg-gray-50",
    accent: "border-credornoir",
  },
  {
    id: "colorful",
    name: "Dynamique",
    description: "Utilisation audacieuse des couleurs",
    previewBg: "bg-white",
    accent: "border-vertlime",
  },
  {
    id: "poppins-orange",
    name: "Poppins Orange",
    description: "Un style contrasté avec touches d'orange",
    previewBg: "bg-orange-50",
    accent: "border-orange-500",
  }
];

// Define the interface for the preview data
interface PreviewData {
  htmlContent: string;
  previewUrl?: string;
}

interface InvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerateInvoice?: (invoiceData: InvoiceData) => Promise<void>;
  isGenerating?: boolean;
}

export function InvoiceDialog({ open, onOpenChange, onGenerateInvoice, isGenerating = false }: InvoiceDialogProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 6; 
  const [isLoading, setIsLoading] = useState(false);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);

  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [saveClient, setSaveClient] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("classic");
  const [serviceLines, setServiceLines] = useState<ServiceLine[]>([
    {
      id: Date.now().toString(),
      description: "",
      quantity: 1,
      unit_price: 0,
      tax_rate: 20,
      total: 0
    }
  ]);
  const [notes, setNotes] = useState("");
  const [signature, setSignature] = useState("");
  const [subtotal, setSubtotal] = useState(0);
  const [taxTotal, setTaxTotal] = useState(0);
  const [total, setTotal] = useState(0);

  const [globalDiscount, setGlobalDiscount] = useState<DiscountInfo | undefined>(undefined);
  const [introText, setIntroText] = useState("");
  const [conclusionText, setConclusionText] = useState("");
  const [footerText, setFooterText] = useState("");

  const [paymentDelay, setPaymentDelay] = useState("15");
  const [dueDate, setDueDate] = useState("");
  const [customTerms, setCustomTerms] = useState("");
  const [useCustomTerms, setUseCustomTerms] = useState(false);
  const [selectedTermTemplateId, setSelectedTermTemplateId] = useState("");
  const [paymentTermsTemplates, setPaymentTermsTemplates] = useState<PaymentTermTemplate[]>([]);
  
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodDetails[]>([
    { method: "card", enabled: true }
  ]);
  const [defaultPaymentMethods, setDefaultPaymentMethods] = useState<PaymentMethodDetails[]>([]);

  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null);

  const [signatureDialogOpen, setSignatureDialogOpen] = useState(false);
  const [signatureData, setSignatureData] = useState<SignatureData | undefined>(undefined);

  useEffect(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 90 + 10);
    
    setInvoiceNumber(`INV-${year}${month}${day}-${random}`);
  }, []);

  useEffect(() => {
    const savedProfile = localStorage.getItem('companyProfile');
    if (savedProfile) {
      try {
        const profile = JSON.parse(savedProfile);
        setCompanyProfile(profile);
      } catch (e) {
        console.error("Erreur lors du parsing du profil d'entreprise", e);
      }
    }
    
    const savedMethods = localStorage.getItem('defaultPaymentMethods');
    if (savedMethods) {
      try {
        const methods = JSON.parse(savedMethods);
        setDefaultPaymentMethods(methods);
        setPaymentMethods(methods);
      } catch (e) {
        console.error("Erreur lors du parsing des méthodes de paiement", e);
      }
    }
    
    const savedTerms = localStorage.getItem('paymentTermsTemplates');
    if (savedTerms) {
      try {
        const terms = JSON.parse(savedTerms);
        setPaymentTermsTemplates(terms);
        
        const defaultTemplate = terms.find((t: PaymentTermTemplate) => t.isDefault);
        if (defaultTemplate) {
          setSelectedTermTemplateId(defaultTemplate.id);
          setPaymentDelay(defaultTemplate.days.toString());
          if (defaultTemplate.customDate) setDueDate(defaultTemplate.customDate);
          setCustomTerms(defaultTemplate.termsText);
          setUseCustomTerms(true);
        }
      } catch (e) {
        console.error("Erreur lors du parsing des modèles de conditions", e);
      }
    }
  }, []);

  const updateServiceLine = (id: string, field: keyof ServiceLine | 'tva' | 'discount', value: any) => {
    setServiceLines(serviceLines.map(line => {
      if (line.id === id) {
        if (field === 'tva') {
          return { ...line, tax_rate: parseFloat(value) || 0 };
        } else if (field === 'discount') {
          return { ...line, discount: value };
        } else {
          return { ...line, [field]: value };
        }
      }
      return line;
    }));
  };

  useEffect(() => {
    let calculatedSubtotal = 0;
    let calculatedTaxTotal = 0;
    
    serviceLines.forEach(line => {
      const lineQuantity = typeof line.quantity === 'string' ? parseFloat(line.quantity) || 0 : line.quantity;
      const lineUnitPrice = typeof line.unit_price === 'string' ? parseFloat(line.unit_price) || 0 : line.unit_price;
      const lineTaxRate = typeof line.tax_rate === 'string' ? parseFloat(line.tax_rate) || 0 : (line.tax_rate || 0);
      
      let lineTotal = lineQuantity * lineUnitPrice;
      
      if (line.discount && line.discount.value > 0) {
        if (line.discount.type === 'percentage') {
          const discountAmount = lineTotal * (line.discount.value / 100);
          lineTotal -= discountAmount;
          line.discount.amount = Number(discountAmount.toFixed(2));
        } else {
          lineTotal = Math.max(0, lineTotal - line.discount.value);
          line.discount.amount = line.discount.value;
        }
      }
      
      const lineTaxAmount = lineTotal * (lineTaxRate / 100);
      
      calculatedSubtotal += lineTotal;
      calculatedTaxTotal += lineTaxAmount;
    });
    
    let calculatedTotal = calculatedSubtotal + calculatedTaxTotal;
    
    if (globalDiscount && globalDiscount.value > 0) {
      if (globalDiscount.type === 'percentage') {
        const discountAmount = calculatedSubtotal * (globalDiscount.value / 100);
        calculatedTotal -= discountAmount;
        setGlobalDiscount({
          ...globalDiscount,
          amount: Number(discountAmount.toFixed(2))
        });
      } else {
        calculatedTotal = Math.max(0, calculatedTotal - globalDiscount.value);
        setGlobalDiscount({
          ...globalDiscount,
          amount: globalDiscount.value
        });
      }
    }
    
    setSubtotal(calculatedSubtotal);
    setTaxTotal(calculatedTaxTotal);
    setTotal(calculatedTotal);
    
    const updatedServiceLines = serviceLines.map(line => {
      const quantity = typeof line.quantity === 'string' ? parseFloat(line.quantity) || 0 : line.quantity;
      const unitPrice = typeof line.unit_price === 'string' ? parseFloat(line.unit_price) || 0 : line.unit_price;
      let totalPrice = quantity * unitPrice;
      
      if (line.discount && line.discount.value > 0) {
        if (line.discount.type === 'percentage') {
          totalPrice *= (1 - line.discount.value / 100);
        } else {
          totalPrice = Math.max(0, totalPrice - line.discount.value);
        }
      }
      
      return {
        ...line,
        total: totalPrice,
      };
    });
    
    if (JSON.stringify(updatedServiceLines) !== JSON.stringify(serviceLines)) {
      setServiceLines(updatedServiceLines);
    }
  }, [serviceLines, globalDiscount]);

  const addServiceLine = () => {
    setServiceLines([
      ...serviceLines,
      {
        id: Date.now().toString(),
        description: "",
        quantity: 1,
        unit_price: 0,
        tax_rate: 20,
        total: 0
      }
    ]);
  };

  const removeServiceLine = (id: string) => {
    if (serviceLines.length > 1) {
      setServiceLines(serviceLines.filter(line => line.id !== id));
    } else {
      toast({
        title: "Action impossible",
        description: "Vous devez conserver au moins une ligne de prestation",
        variant: "destructive"
      });
    }
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const saveAsDraft = () => {
    toast({
      title: "Brouillon enregistré",
      description: "Votre facture a été sauvegardée comme brouillon"
    });
    
    onOpenChange(false);
    navigate("/invoices");
  };

  const handlePreviewInvoice = async () => {
    setIsLoading(true);
    
    try {
      if (!companyProfile) {
        const savedProfile = localStorage.getItem('companyProfile');
        if (savedProfile) {
          try {
            setCompanyProfile(JSON.parse(savedProfile));
          } catch (e) {
            console.error("Error parsing company profile", e);
            toast({
              title: "Erreur",
              description: "Impossible de charger le profil d'entreprise",
              variant: "destructive"
            });
            setIsLoading(false);
            return;
          }
        } else {
          toast({
            title: "Profil manquant",
            description: "Veuillez configurer votre profil d'entreprise dans les paramètres",
            variant: "destructive"
          });
          setIsLoading(false);
          return;
        }
      }
      
      const numericTaxRate = typeof companyProfile?.taxRate === 'string' 
        ? parseFloat(companyProfile.taxRate) || 0
        : Number(companyProfile?.taxRate || 0);
      
      const invoiceData: InvoiceData = {
        invoiceNumber,
        invoiceDate: invoiceDate,
        issueDate: invoiceDate,
        dueDate: paymentDelay === "custom" ? dueDate : "",
        clientName,
        clientEmail,
        clientAddress,
        clientPhone: "",
        issuerInfo: companyProfile || {
          name: "",
          address: "",
          email: "",
          emailType: "professional", 
          phone: "",
          bankAccount: "",
          bankName: "",
          accountHolder: "",
          taxRate: 20,
          termsAndConditions: "",
          thankYouMessage: "",
          defaultCurrency: "EUR"
        },
        serviceLines: serviceLines,
        items: serviceLines,
        subtotal,
        taxRate: numericTaxRate,
        taxAmount: taxTotal,
        total: total,
        totalAmount: total,
        paymentDelay,
        paymentMethods,
        notes,
        templateId: selectedTemplate,
        paymentTermsId: selectedTermTemplateId,
        customPaymentTerms: useCustomTerms ? customTerms : "",
        discount: globalDiscount,
        introText: introText || undefined,
        conclusionText: conclusionText || undefined,
        footerText: footerText || undefined
      };
      
      const result = await generateInvoicePreview(invoiceData, selectedTemplate);
      
      if (result.success) {
        setPreviewData({
          htmlContent: result.htmlContent,
          previewUrl: result.previewUrl
        });
        setPreviewOpen(true);
        toast({
          title: "Aperçu généré",
          description: "Voici un aperçu de votre facture"
        });
      } else {
        toast({
          title: "Erreur",
          description: "Impossible de générer l'aperçu",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Preview generation error:', error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la génération de l'aperçu",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateAndSendInvoice = async () => {
    if (!clientName || !clientEmail) {
      toast({
        title: "Information requise",
        description: "Veuillez compléter les informations client avant d'envoyer la facture",
        variant: "destructive"
      });
      return;
    }

    if (!companyProfile) {
      const savedProfile = localStorage.getItem('companyProfile');
      if (savedProfile) {
        try {
          setCompanyProfile(JSON.parse(savedProfile));
        } catch (e) {
          console.error("Error parsing company profile", e);
          toast({
            title: "Erreur",
            description: "Impossible de charger le profil d'entreprise",
            variant: "destructive"
          });
          return;
        }
      } else {
        toast({
          title: "Profil manquant",
          description: "Veuillez configurer votre profil d'entreprise dans les paramètres",
          variant: "destructive"
        });
        return;
      }
    }

    setIsLoading(true);
    
    try {
      const numericTaxRate = typeof companyProfile?.taxRate === 'string' 
        ? parseFloat(companyProfile.taxRate) || 0
        : Number(companyProfile?.taxRate || 0);
      
      const invoiceData: InvoiceData = {
        invoiceNumber,
        invoiceDate: invoiceDate,
        issueDate: invoiceDate,
        dueDate: paymentDelay === "custom" ? dueDate : "",
        clientName,
        clientEmail,
        clientAddress,
        clientPhone: "",
        issuerInfo: companyProfile || {
          name: "",
          address: "",
          email: "",
          emailType: "professional",
          phone: "",
          bankAccount: "",
          bankName: "",
          accountHolder: "",
          taxRate: 20,
          termsAndConditions: "",
          thankYouMessage: "",
          defaultCurrency: "EUR"
        },
        serviceLines: serviceLines,
        items: serviceLines,
        subtotal,
        taxRate: numericTaxRate,
        taxAmount: taxTotal,
        total: total,
        totalAmount: total,
        paymentDelay,
        paymentMethods,
        notes,
        templateId: selectedTemplate,
        paymentTermsId: selectedTermTemplateId,
        customPaymentTerms: useCustomTerms ? customTerms : "",
        discount: globalDiscount,
        introText: introText || undefined,
        conclusionText: conclusionText || undefined,
        footerText: footerText || undefined
      };
      
      invoiceData.signature = signatureData;
      invoiceData.signatureDate = new Date().toISOString();
      
      const stripeSession = await createStripeCheckoutSession(invoiceData);
      
      if (stripeSession.success && stripeSession.url) {
        setPaymentUrl(stripeSession.url);
        
        toast({
          title: "Facture générée",
          description: "La facture a été générée avec un lien de paiement Stripe"
        });
        
        setTimeout(() => {
          onOpenChange(false);
          navigate("/invoices");
        }, 1500);
      } else {
        toast({
          title: "Erreur de paiement",
          description: stripeSession.error || "Impossible de créer le lien de paiement",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Invoice generation error:', error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la génération de la facture",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="invoice-number">Numéro de facture</Label>
              <Input 
                id="invoice-number" 
                value={invoiceNumber} 
                onChange={(e) => setInvoiceNumber(e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="invoice-date">Date d'émission</Label>
              <Input 
                id="invoice-date" 
                type="date" 
                value={invoiceDate} 
                onChange={(e) => setInvoiceDate(e.target.value)} 
              />
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-4 py-4">
            <div className="mb-4">
              <ClientSelector onClientSelect={handleClientSelect} />
              <div className="text-center my-4 text-sm text-muted-foreground">- ou -</div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="client-name">Nom / Raison sociale</Label>
              <Input 
                id="client-name" 
                placeholder="SCI Legalis" 
                value={clientName}
                onChange={(e) => setClientName(e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client-email">Email</Label>
              <Input 
                id="client-email" 
                type="email" 
                placeholder="contact@sci-legalis.fr"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client-address">Adresse</Label>
              <Textarea 
                id="client-address" 
                placeholder="15 rue du Palais, 75001 Paris" 
                className="min-h-[80px]"
                value={clientAddress}
                onChange={(e) => setClientAddress(e.target.value)} 
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="save-client" 
                checked={saveClient} 
                onCheckedChange={(checked) => setSaveClient(checked as boolean)} 
              />
              <Label htmlFor="save-client">Sauvegarder ce client dans mes contacts</Label>
            </div>
          </div>
        );
      
      case 3:
        return (
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-12 gap-4 font-medium text-sm mb-2 hidden md:grid">
              <div className="col-span-4">Description</div>
              <div className="col-span-2">Quantité</div>
              <div className="col-span-2">Prix unitaire (€)</div>
              <div className="col-span-1">TVA (%)</div>
              <div className="col-span-2">Réduction</div>
              <div className="col-span-1">Total</div>
            </div>
            
            {serviceLines.map((line, index) => (
              <div key={line.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-4 border-t first:border-t-0">
                <div className="md:col-span-4 space-y-2">
                  <Label htmlFor={`description-${index}`} className="md:hidden">Description</Label>
                  <Textarea 
                    id={`description-${index}`}
                    value={line.description}
                    onChange={(e) => updateServiceLine(line.id, "description", e.target.value)}
                    placeholder="Consultation juridique - Droit des sociétés" 
                    className="min-h-[80px]" 
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor={`quantity-${index}`} className="md:hidden">Quantité</Label>
                  <Input 
                    id={`quantity-${index}`}
                    value={line.quantity}
                    onChange={(e) => updateServiceLine(line.id, "quantity", e.target.value)}
                    placeholder="2" 
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor={`unit-price-${index}`} className="md:hidden">Prix unitaire (€)</Label>
                  <Input 
                    id={`unit-price-${index}`}
                    value={line.unit_price}
                    onChange={(e) => updateServiceLine(line.id, "unit_price", e.target.value)}
                    placeholder="200.00" 
                  />
                </div>
                <div className="md:col-span-1 space-y-2">
                  <Label htmlFor={`tva-${index}`} className="md:hidden">TVA (%)</Label>
                  <Input 
                    id={`tva-${index}`}
                    value={line.tax_rate}
                    onChange={(e) => updateServiceLine(line.id, "tax_rate", e.target.value)}
                    placeholder="20" 
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor={`discount-${index}`} className="md:hidden">Réduction</Label>
                  <DiscountSelector
                    discount={line.discount}
                    onDiscountChange={(discount) => updateServiceLine(line.id, "discount", discount)}
                    baseAmount={parseFloat(line.quantity) * parseFloat(line.unit_price)}
                    compact={true}
                  />
                </div>
                <div className="md:col-span-1 space-y-2 flex flex-row items-center">
                  <div className="flex-1">
                    <Label htmlFor={`total-${index}`} className="md:hidden">Total (€)</Label>
                    <Input 
                      id={`total-${index}`}
                      value={line.total}
                      disabled
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeServiceLine(line.id)}
                    disabled={serviceLines.length <= 1}
                    className="md:ml-2"
                  >
                    <Trash className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
            
            <div className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => setIsProductModalOpen(true)}
                className="mr-2"
              >
                Sélectionner du catalogue
              </Button>
              
              <Button variant="outline" onClick={addServiceLine}>
                <Plus className="mr-2 h-4 w-4" />
                Ajouter une ligne
              </Button>
            </div>
            
            <div className="border-t pt-4 space-y-4">
              <div className="flex justify-end">
                <div className="md:w-1/2 lg:w-1/3">
                  <Label>Remise globale</Label>
                  <DiscountSelector
                    discount={globalDiscount}
                    onDiscountChange={setGlobalDiscount}
                    baseAmount={subtotal}
                    label="Remise sur le total"
                  />
                </div>
              </div>
              
              <div className="flex justify-between">
                <span className="font-medium">Sous-total</span>
                <span>{subtotal.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">TVA</span>
                <span>{taxTotal.toFixed(2)} €</span>
              </div>
              {globalDiscount && globalDiscount.value > 0 && globalDiscount.amount && (
                <div className="flex justify-between text-red-500">
                  <span className="font-medium">Remise{globalDiscount.description ? ` (${globalDiscount.description})` : ''}</span>
                  <span>-{globalDiscount.amount.toFixed(2)} €</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>{total.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Commission Stripe (0.5%)</span>
                <span>{(total * 0.005).toFixed(2)} €</span>
              </div>
            </div>
          </div>
        );
      
      case 4:
        return (
          <div className="space-y-6 py-4">
            <div className="mb-8">
              <h3 className="text-lg font-medium mb-4">Conditions de paiement</h3>
              <PaymentTermsSelector
                paymentDelay={paymentDelay}
                onPaymentDelayChange={setPaymentDelay}
                dueDate={dueDate}
                onDueDateChange={setDueDate}
                customTerms={customTerms}
                onCustomTermsChange={setCustomTerms}
                useCustomTerms={useCustomTerms}
                onUseCustomTermsChange={setUseCustomTerms}
                defaultTerms="Paiement à réception de facture. Des pénalités de retard de 3 fois le taux d'intérêt légal seront appliquées en cas de paiement après la date d'échéance."
                onSaveAsTemplate={savePaymentTermTemplate}
                onSelectTemplate={setSelectedTermTemplateId}
                selectedTemplateId={selectedTermTemplateId}
              />
            </div>
            
            <div className="border-t pt-6">
              <PaymentMethodSelector
                methods={paymentMethods}
                onChange={setPaymentMethods}
                companyProfile={companyProfile}
              />
            </div>
            
            <div className="border-t pt-6">
              <Label className="block mb-4 text-lg font-medium">Template de facture</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {invoiceTemplates.map(template => (
                  <div
                    key={template.id}
                    className={`relative flex flex-col rounded-lg border-2 p-2 cursor-pointer transition-all ${
                      selectedTemplate === template.id ? `ring-2 ring-violet ${template.accent}` : "border-gray-200"
                    }`}
                    onClick={() => setSelectedTemplate(template.id)}
                  >
                    <div className={`${template.previewBg} h-24 w-full mb-3 rounded`}>
                    </div>
                    <div className="text-left">
                      <h3 className="font-medium text-base">{template.name}</h3>
                      <p className="text-sm text-muted-foreground">{template.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      
      case 5:
        return (
          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <h2 className="text-lg font-medium">Textes personnalisés</h2>
              <p className="text-sm text-muted-foreground">
                Personnalisez votre facture avec des textes d'introduction, de conclusion et de pied de page.
              </p>
              
              <CustomInvoiceText
                introText={introText}
                onIntroTextChange={setIntroText}
                conclusionText={conclusionText}
                onConclusionTextChange={setConclusionText}
                footerText={footerText}
                onFooterTextChange={setFooterText}
              />
            </div>
          </div>
        );
      
      case 6:
        return (
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="signature">Signature</Label>
              <div 
                className="border rounded-md bg-gray-50 p-4 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => setSignatureDialogOpen(true)}
              >
                {signatureData ? (
                  <SignatureDisplay signatureData={signatureData} />
                ) : (
                  <div className="h-24 flex items-center justify-center">
                    <p className="text-muted-foreground">Cliquez pour signer</p>
                  </div>
                )}
              </div>
              
              <Dialog open={signatureDialogOpen} onOpenChange={setSignatureDialogOpen}>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Votre signature</DialogTitle>
                  </DialogHeader>
                  
                  <div className="flex space-x-4 mb-4">
                    <div className="w-full">
                      <SignatureCanvas 
                        onSignatureChange={(sig) => {
                          setSignatureData(sig);
                          if (sig) {
                            setSignatureDialogOpen(false);
                          }
                        }}
                        signatureData={signatureData}
                      />
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <SignatureSelector onSelect={(sig) => {
                      setSignatureData(sig);
                      setSignatureDialogOpen(false);
                    }} />
                  </div>
                  
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setSignatureDialogOpen(false)}>
                      Annuler
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes et conditions</Label>
              <Textarea 
                id="notes" 
                placeholder="Ajoutez des informations complémentaires ou des conditions..." 
                className="min-h-[100px]"
                value={notes}
                onChange={(e) => setNotes(e.target.value)} 
              />
            </div>
            
            {paymentUrl && qrCodeUrl && (
              <div className="mt-6 p-4 border rounded-md bg-gray-50">
                <h3 className="font-medium mb-2">Lien de paiement Stripe généré</h3>
                <div className="flex flex-col md:flex-row items-center gap-4">
                  <div className="flex-shrink-0">
                    <img 
                      src={qrCodeUrl} 
                      alt="QR Code de paiement" 
                      className="w-32 h-32 border"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-2">
                      Scannez ce QR code ou utilisez le lien ci-dessous pour effectuer le paiement:
                    </p>
                    <div className="flex items-center gap-2">
                      <Input 
                        value={paymentUrl} 
                        readOnly 
                        className="text-xs"
                      />
                      <Button 
                        size="sm" 
                        onClick={() => window.open(paymentUrl, '_blank')}
                      >
                        Ouvrir
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      
      default:
        return null;
    }
  };

  const handleClientSelect = (client: Client) => {
    setClientName(client.client_name);
    setClientEmail(client.email);
    setClientAddress(client.address);
    setSaveClient(false);
    
    toast({
      title: "Client sélectionné",
      description: `${client.client_name} a été sélectionné pour cette facture.`
    });
  };

  const [productCatalog, setProductCatalog] = useState<Product[]>([]);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  useEffect(() => {
    const loadProducts = async () => {
      const products = await fetchProducts();
      setProductCatalog(products);
    };
    
    if (open) {
      loadProducts();
    }
  }, [open]);

  const handleAddProductFromCatalog = (product: Product) => {
    if (!product) return;

    const newServiceLine: ServiceLine = {
      id: Date.now().toString(),
      description: product.description || product.name,
      quantity: 1,
      unit_price: (product.price_cents / 100),
      tax_rate: product.tax_rate?.toString() || "20",
      total: (product.price_cents / 100)
    };

    setServiceLines([...serviceLines, newServiceLine]);
    setIsProductModalOpen(false);
  };

  const stepTitles = [
    "Détails de la facture",
    "Informations client",
    "Services et tarification",
    "Conditions de paiement",
    "Textes personnalisés",
    "Notes et signature"
  ];

  const renderProductCatalogModal = () => {
    return (
      <Dialog open={isProductModalOpen} onOpenChange={setIsProductModalOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Sélectionner un produit ou service</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            {productCatalog.length === 0 ? (
              <div className="text-center p-8">
                <p>Aucun produit disponible dans votre catalogue.</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Vous pouvez en ajouter depuis l'onglet Produits/Services dans les paramètres.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {productCatalog.map(product => (
                  <div 
                    key={product.id}
                    className="flex justify-between items-center p-4 border rounded-md hover:bg-muted/50 cursor-pointer"
                    onClick={() => handleAddProductFromCatalog(product)}
                  >
                    <div>
                      <h3 className="font-medium">{product.name}</h3>
                      {product.description && (
                        <p className="text-sm text-muted-foreground">{product.description}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatPrice(product.price_cents)}</p>
                      {product.tax_rate && (
                        <p className="text-xs text-muted-foreground">TVA: {product.tax_rate}%</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsProductModalOpen(false)}>
              Annuler
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[900px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {stepTitles[currentStep - 1]}
            </DialogTitle>
          </DialogHeader>
          
          <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden mt-1 mb-4">
            <div 
              className="bg-violet h-full transition-all duration-300 ease-in-out" 
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
          
          {renderStepContent()}
          
          <DialogFooter className="flex justify-between items-center pt-4">
            <div className="flex-1">
              {currentStep > 1 && (
                <Button 
                  variant="outline" 
                  onClick={prevStep}
                  disabled={isLoading}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Précédent
                </Button>
              )}
            </div>
            
            <div className="text-sm text-muted-foreground">
              Étape {currentStep} sur {totalSteps}
            </div>
            
            <div className="flex flex-1 justify-end gap-2">
              {currentStep === totalSteps ? (
                <>
                  <Button 
                    variant="outline" 
                    onClick={saveAsDraft}
                    disabled={isLoading}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Brouillon
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handlePreviewInvoice}
                    disabled={isLoading}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Aperçu
                  </Button>
                  <Button 
                    className="bg-violet hover:bg-violet/90" 
                    onClick={generateAndSendInvoice}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <span className="animate-spin h-4 w-4 rounded-full border-2 border-white border-opacity-50 border-t-transparent mr-2"></span>
                        Traitement...
                      </div>
                    ) : (
                      "Générer"
                    )}
                  </Button>
                </>
              ) : (
                <Button 
                  onClick={nextStep}
                  disabled={isLoading}
                >
                  Suivant
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh]">
          <DialogHeader className="pb-0">
            <DialogTitle>Aperçu de la facture</DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-hidden">
            {renderPreviewContent()}
          </div>
          
          <DialogFooter className="pt-2">
            <Button 
              variant="outline" 
              onClick={() => setPreviewOpen(false)}
              size="sm"
            >
              Fermer
            </Button>
            <Button 
              className="bg-violet hover:bg-violet/90"
              onClick={() => {
                setPreviewOpen(false);
                generateAndSendInvoice();
              }}
              size="sm"
            >
              Générer et envoyer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {renderProductCatalogModal()}
    </>
  );
}
