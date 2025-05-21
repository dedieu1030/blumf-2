
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import { toast } from "sonner";
import { sendReminderForInvoice } from '@/services/reminderService';

export interface InvoiceReminderProps {
  invoiceId: string;
}

export function InvoiceReminder({ invoiceId }: InvoiceReminderProps) {
  const [isSending, setIsSending] = useState(false);
  
  const handleSendReminder = async () => {
    try {
      setIsSending(true);
      const result = await sendReminderForInvoice(invoiceId);
      
      if (result.success) {
        toast.success('Rappel envoyé avec succès');
      } else {
        toast.error(result.error || 'Erreur lors de l\'envoi du rappel');
      }
    } catch (error) {
      console.error('Error sending reminder:', error);
      toast.error('Erreur lors de l\'envoi du rappel');
    } finally {
      setIsSending(false);
    }
  };
  
  return (
    <Button 
      variant="outline" 
      size="sm"
      onClick={handleSendReminder} 
      disabled={isSending}
      className="text-yellow-500 border-yellow-500 hover:bg-yellow-50 hover:text-yellow-600"
    >
      <Mail className="h-4 w-4 mr-2" />
      {isSending ? 'Envoi...' : 'Envoyer un rappel'}
    </Button>
  );
}
