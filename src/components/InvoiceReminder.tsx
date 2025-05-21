
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { toast } from "sonner";

interface InvoiceReminderProps {
  invoiceId: string;
}

export function InvoiceReminder({ invoiceId }: InvoiceReminderProps) {
  const [isSending, setIsSending] = useState(false);

  const sendReminder = async () => {
    setIsSending(true);
    
    try {
      // Simuler l'envoi d'un rappel
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Afficher un message de succès
      toast.success("Rappel envoyé avec succès");
    } catch (error) {
      console.error("Erreur lors de l'envoi du rappel:", error);
      toast.error("Erreur lors de l'envoi du rappel");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      className="text-amber-500 border-amber-300 hover:bg-amber-50 hover:text-amber-600"
      onClick={sendReminder}
      disabled={isSending}
    >
      <Bell className="h-4 w-4 mr-1" />
      {isSending ? "Envoi..." : "Rappel"}
    </Button>
  );
}
