import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react"; // Changed from radix-ui
import { useToast } from "@/hooks/use-toast";
import { DateRange } from "react-day-picker";
import { v4 as uuidv4 } from 'uuid';
import {
  InvoiceData,
  ServiceLine,
  PaymentMethodDetails,
  CompanyProfile,
  PaymentTermTemplate,
  DiscountInfo
} from "@/types/invoice";
import { PaymentMethodSelector } from "./PaymentMethodSelector";
import { PaymentTermsSelector } from "./PaymentTermsSelector";
import { getPaymentTermsTemplates } from "@/services/paymentTermsService";
import { InputCurrency } from "@/components/ui/input-currency";

interface InvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice?: InvoiceData;
  onSuccess?: () => void;
  companyProfile?: CompanyProfile;
  onGenerateInvoice?: (invoiceData: InvoiceData) => Promise<void>;
  isGenerating?: boolean;
}

export function InvoiceDialog({
  open,
  onOpenChange,
  invoice,
  onSuccess,
  companyProfile,
  onGenerateInvoice,
  isGenerating
}: InvoiceDialogProps) {
  const { toast } = useToast();
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceDate, setInvoiceDate] = useState<Date | undefined>(undefined);
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [clientId, setClientId] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [items, setItems] = useState<ServiceLine[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [taxRate, setTaxRate] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [total, setTotal] = useState(0);
  const [notes, setNotes] = useState("");
  const [terms, setTerms] = useState("");
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodDetails[]>([]);
  const [paymentTermsId, setPaymentTermsId] = useState("");
  const [customPaymentTerms, setCustomPaymentTerms] = useState("");
  const [introText, setIntroText] = useState("");
  const [conclusionText, setConclusionText] = useState("");
  const [footerText, setFooterText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [date, setDate] = React.useState<DateRange>({
    from: invoiceDate,
    to: dueDate,
  });
  const [paymentTermsTemplates, setPaymentTermsTemplates] = useState<PaymentTermTemplate[]>([]);

  useEffect(() => {
    if (invoice) {
      setInvoiceNumber(invoice.invoiceNumber || "");
      setInvoiceDate(invoice.invoiceDate ? new Date(invoice.invoiceDate) : undefined);
      setDueDate(invoice.dueDate ? new Date(invoice.dueDate) : undefined);
      setClientId(invoice.clientId || "");
      setClientName(invoice.clientName || "");
      setClientEmail(invoice.clientEmail || "");
      setClientAddress(invoice.clientAddress || "");
      setClientPhone(invoice.clientPhone || "");
      setItems(invoice.items || []);
      setSubtotal(invoice.subtotal || 0);
      setTaxRate(invoice.taxRate || 0);
      setTaxAmount(invoice.taxAmount || 0);
      if (invoice.discount) {
        setDiscountType(invoice.discount.type || 'percentage');
        setDiscountValue(invoice.discount.value || 0);
        setDiscountAmount(invoice.discount.amount || 0);
      } else {
        setDiscountType('percentage');
        setDiscountValue(0);
        setDiscountAmount(0);
      }
      setTotal(invoice.total || 0);
      setNotes(invoice.notes || "");
      setTerms(invoice.terms || "");
      setPaymentMethods(invoice.paymentMethods || []);
      setPaymentTermsId(invoice.paymentTermsId || "");
      setCustomPaymentTerms(invoice.customPaymentTerms || "");
      setIntroText(invoice.introText || "");
      setConclusionText(invoice.conclusionText || "");
      setFooterText(invoice.footerText || "");
      setDate({
        from: invoiceDate,
        to: dueDate,
      });
    } else {
      // Reset form fields for new invoice
      setInvoiceNumber("");
      setInvoiceDate(undefined);
      setDueDate(undefined);
      setClientId("");
      setClientName("");
      setClientEmail("");
      setClientAddress("");
      setClientPhone("");
      setItems([]);
      setSubtotal(0);
      setTaxRate(0);
      setTaxAmount(0);
      setDiscountType('percentage');
      setDiscountValue(0);
      setDiscountAmount(0);
      setTotal(0);
      setNotes("");
      setTerms("");
      setPaymentMethods([]);
      setPaymentTermsId("");
      setCustomPaymentTerms("");
      setIntroText("");
      setConclusionText("");
      setFooterText("");
      setDate({ from: undefined, to: undefined });
    }
  }, [invoice]);

  useEffect(() => {
    calculateTotals();
  }, [items, taxRate, discountType, discountValue]);

  const calculateTotals = () => {
    let newSubtotal = 0;
    items.forEach((item) => {
      newSubtotal += item.quantity * item.unit_price;
    });
    setSubtotal(newSubtotal);

    const newTaxAmount = newSubtotal * (taxRate / 100);
    setTaxAmount(newTaxAmount);

    let newDiscountAmount = 0;
    if (discountType === 'percentage') {
      newDiscountAmount = newSubtotal * (discountValue / 100);
    } else {
      newDiscountAmount = discountValue;
    }
    setDiscountAmount(newDiscountAmount);

    const newTotal = newSubtotal + newTaxAmount - newDiscountAmount;
    setTotal(newTotal);
  };

  const handleItemChange = (id: string, field: keyof ServiceLine, value: any) => {
    setItems((prevItems) => {
      return prevItems.map((item) => {
        if (item.id === id) {
          return { ...item, [field]: value };
        }
        return item;
      });
    });
  };

  const addItem = () => {
    const newItem: ServiceLine = {
      id: uuidv4(),
      description: "",
      quantity: 1,
      unit_price: 0,
      total: 0,
    };
    setItems((prevItems) => [...prevItems, newItem]);
  };

  const removeItem = (id: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);

    try {
      const invoiceData: InvoiceData = {
        invoiceNumber,
        invoiceDate: invoiceDate?.toISOString(),
        dueDate: dueDate?.toISOString(),
        clientId,
        clientName,
        clientEmail,
        clientAddress,
        clientPhone,
        items,
        subtotal,
        taxRate,
        taxAmount,
        discount: {
          type: discountType,
          value: discountValue,
          amount: discountAmount,
        },
        total,
        notes,
        terms,
        paymentMethods,
        paymentTermsId,
        customPaymentTerms,
        introText,
        conclusionText,
        footerText,
        issuerInfo: companyProfile,
        serviceLines: items,
      };

      if (onGenerateInvoice) {
        await onGenerateInvoice(invoiceData);
      } else {
        // Here you would typically call your API to save the invoice data
        // For this example, we'll just simulate a successful save
        await new Promise((resolve) => setTimeout(resolve, 1000));

        toast({
          title: "Success",
          description: "Invoice saved successfully.",
        });

        onSuccess?.();
      }
      
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving invoice:", error);
      toast({
        title: "Error",
        description: "Failed to save invoice.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentTermsSelect = (template: PaymentTermTemplate) => {
    setPaymentTermsId(template.id);
    setCustomPaymentTerms(template.termsText || '');
  };

  const handleDiscountTypeChange = (value: string) => {
    if (value === 'percentage' || value === 'fixed') {
      setDiscountType(value);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>{invoice ? "Edit Invoice" : "New Invoice"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="invoiceNumber">Invoice Number</Label>
              <Input
                id="invoiceNumber"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div>
              <Label htmlFor="invoiceDate">Invoice Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !invoiceDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {invoiceDate ? format(invoiceDate, "P", { locale: enUS }) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    locale={enUS}
                    selected={invoiceDate}
                    onSelect={setDateFromCalendar}
                    disabled={isLoading}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="clientId">Client ID</Label>
              <Input
                id="clientId"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div>
              <Label htmlFor="clientName">Client Name</Label>
              <Input
                id="clientName"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="clientEmail">Client Email</Label>
              <Input
                id="clientEmail"
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div>
              <Label htmlFor="clientPhone">Client Phone</Label>
              <Input
                id="clientPhone"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="clientAddress">Client Address</Label>
            <Textarea
              id="clientAddress"
              value={clientAddress}
              onChange={(e) => setClientAddress(e.target.value)}
              placeholder="Client address..."
              disabled={isLoading}
            />
          </div>

          <div>
            <Label>Items</Label>
            {items.map((item) => (
              <div key={item.id} className="grid grid-cols-5 gap-2 mb-2">
                <Input
                  type="text"
                  placeholder="Description"
                  value={item.description}
                  onChange={(e) => handleItemChange(item.id, "description", e.target.value)}
                  disabled={isLoading}
                />
                <Input
                  type="number"
                  placeholder="Quantity"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(item.id, "quantity", Number(e.target.value))}
                  disabled={isLoading}
                />
                <InputCurrency
                  placeholder="Unit Price"
                  value={item.unit_price}
                  onValueChange={(value) => handleItemChange(item.id, "unit_price", value)}
                  disabled={isLoading}
                />
                <InputCurrency
                  placeholder="Total Price"
                  value={item.total}
                  onValueChange={(value) => handleItemChange(item.id, "total", value)}
                  disabled={isLoading}
                />
                <Button type="button" variant="destructive" size="sm" onClick={() => removeItem(item.id)} disabled={isLoading}>
                  Remove
                </Button>
              </div>
            ))}
            <Button type="button" variant="secondary" size="sm" onClick={addItem} disabled={isLoading}>
              Add Item
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="taxRate">Tax Rate (%)</Label>
              <Input
                id="taxRate"
                type="number"
                value={taxRate}
                onChange={(e) => setTaxRate(Number(e.target.value))}
                disabled={isLoading}
              />
            </div>
            <div>
              <Label htmlFor="discountType">Discount Type</Label>
              <Select value={discountType} onValueChange={handleDiscountTypeChange} disabled={isLoading}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select discount type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage</SelectItem>
                  <SelectItem value="fixed">Fixed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="discountValue">Discount Value</Label>
              <Input
                id="discountValue"
                type="number"
                value={discountValue}
                onChange={(e) => setDiscountValue(Number(e.target.value))}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Subtotal: {subtotal}</Label>
            </div>
            <div>
              <Label>Tax Amount: {taxAmount}</Label>
            </div>
            <div>
              <Label>Total: {total}</Label>
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes here..."
              disabled={isLoading}
            />
          </div>

          <div>
            <Label htmlFor="terms">Terms</Label>
            <Textarea
              id="terms"
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              placeholder="Add terms and conditions here..."
              disabled={isLoading}
            />
          </div>

          <div>
            <Label>Payment Methods</Label>
            <PaymentMethodSelector
              selectedMethods={paymentMethods}
              onMethodsChange={setPaymentMethods}
              companyProfile={companyProfile}
            />
          </div>

          <div>
            <PaymentTermsSelector
              onSelect={handlePaymentTermsSelect}
              customTerms={customPaymentTerms}
              onCustomTermsChange={setCustomPaymentTerms}
            />
          </div>

          <div>
            <Label htmlFor="introText">Introductory Text</Label>
            <Textarea
              id="introText"
              value={introText}
              onChange={(e) => setIntroText(e.target.value)}
              placeholder="Enter introductory text..."
              className="min-h-[100px]"
            />
          </div>

          <div>
            <Label htmlFor="conclusionText">Conclusion Text</Label>
            <Textarea
              id="conclusionText"
              value={conclusionText}
              onChange={(e) => setConclusionText(e.target.value)}
              placeholder="Enter conclusion text..."
              className="min-h-[100px]"
            />
          </div>

          <div>
            <Label htmlFor="footerText">Footer Text</Label>
            <Textarea
              id="footerText"
              value={footerText}
              onChange={(e) => setFooterText(e.target.value)}
              placeholder="Enter footer text..."
              className="min-h-[100px]"
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting || isLoading || isGenerating}>
              {isSubmitting || isGenerating ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );

  function setDateFromCalendar(date: Date | undefined) {
    setDate({ from: date, to: date });
    setInvoiceDate(date);
    setDueDate(date);
  }
}
