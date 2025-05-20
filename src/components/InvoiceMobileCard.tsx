
import React from 'react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Eye, Pencil, Trash2, MoreHorizontal } from 'lucide-react';
import { InvoiceStatus } from './InvoiceStatus';
import { Invoice, Status } from '@/types/invoice';

export interface InvoiceMobileCardProps {
  invoice: Invoice;
  onViewClick: () => void;
  onEditClick: () => void;
  onDeleteClick: () => void;
  onStatusChange: (newStatus: Status) => void;
}

export function InvoiceMobileCard({ 
  invoice, 
  onViewClick, 
  onEditClick, 
  onDeleteClick,
  onStatusChange 
}: InvoiceMobileCardProps) {
  
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <div className="font-medium">{invoice.invoice_number}</div>
            <div className="text-sm text-gray-500">{invoice.client?.client_name || invoice.client_name || 'N/A'}</div>
          </div>
          <InvoiceStatus status={invoice.status} />
        </div>
        
        <div className="flex justify-between mt-2">
          <div className="text-sm">
            <div>Date: {invoice.date ? new Date(invoice.date).toLocaleDateString() : 'N/A'}</div>
            <div className="font-medium">Montant: {typeof invoice.amount === 'number' ? `${invoice.amount} €` : invoice.amount}</div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-end p-2 pt-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
              Actions
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onViewClick}>
              <Eye className="mr-2 h-4 w-4" /> Voir
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onEditClick}>
              <Pencil className="mr-2 h-4 w-4" /> Modifier
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDeleteClick} className="text-red-500">
              <Trash2 className="mr-2 h-4 w-4" /> Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardFooter>
    </Card>
  );
}
