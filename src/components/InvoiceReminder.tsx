
import React from 'react';
import { Button } from '@/components/ui/button';
import { SendIcon } from 'lucide-react';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { sendReminderForInvoice } from '@/services/reminderService';

interface InvoiceReminderProps {
  invoiceId: string;
  onSuccess?: () => void;
}

export function InvoiceReminder({ invoiceId, onSuccess }: InvoiceReminderProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isSending, setIsSending] = React.useState(false);

  const handleSendReminder = async () => {
    setIsSending(true);
    
    try {
      const result = await sendReminderForInvoice(invoiceId);
      
      if (result.success) {
        toast.success('Rappel envoyé avec succès');
        if (onSuccess) {
          onSuccess();
        }
      } else {
        // Use a type guard to check if error property exists
        if ('error' in result) {
          toast.error(`Erreur lors de l'envoi du rappel: ${result.error}`);
        } else {
          toast.error("Une erreur est survenue lors de l'envoi du rappel");
        }
      }
      setIsOpen(false);
    } catch (error) {
      console.error('Error sending reminder:', error);
      toast.error("Une erreur est survenue lors de l'envoi du rappel");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => setIsOpen(true)}
      >
        <SendIcon className="h-4 w-4 mr-1" /> 
        Envoyer un rappel
      </Button>
      
      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Envoyer un rappel</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir envoyer un rappel pour cette facture ? 
              Un email sera envoyé au client pour lui rappeler de régler sa facture.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleSendReminder} disabled={isSending}>
              {isSending ? 'Envoi en cours...' : 'Envoyer le rappel'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
