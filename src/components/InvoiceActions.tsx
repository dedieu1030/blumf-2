
import React from 'react';
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Edit, MoreHorizontal, Trash2 } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { deleteInvoice } from '@/services/invoiceService';
import { InvoiceReminder } from './InvoiceReminder';

interface InvoiceActionsProps {
  invoice: any;
  onDelete: () => void;
}

export function InvoiceActions({ invoice, onDelete }: InvoiceActionsProps) {
  const navigate = useNavigate();

  const handleDelete = async () => {
    try {
      await deleteInvoice(invoice.id);
      toast.success('Facture supprimée avec succès');
      onDelete();
    } catch (error) {
      console.error("Error deleting invoice:", error);
      toast.error("Erreur lors de la suppression de la facture");
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <InvoiceReminder invoiceId={invoice.id} />
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Ouvrir le menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => navigate(`/invoices/edit/${invoice.id}`)}>
            <Edit className="mr-2 h-4 w-4" />
            Modifier
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDelete} className="text-red-500">
            <Trash2 className="mr-2 h-4 w-4" />
            Supprimer
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
