
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { FilePlus, FileText, Plus } from "lucide-react";
import { useState } from "react";
import { InvoiceDialog } from "./InvoiceDialog";
import { useIsMobile } from "@/hooks/use-mobile";

export const QuickAction = () => {
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false);
  const isMobile = useIsMobile();

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            size={isMobile ? "sm" : "default"}
            className="bg-violet hover:bg-violet/90 whitespace-nowrap"
          >
            {isMobile ? (
              <Plus className="h-4 w-4" />
            ) : (
              <>
                <Plus className="mr-1 h-4 w-4" /> Créer
              </>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setInvoiceDialogOpen(true)}>
            <FileText className="mr-2 h-4 w-4" /> Nouvelle facture
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <InvoiceDialog 
        open={invoiceDialogOpen}
        onOpenChange={setInvoiceDialogOpen}
      />
    </>
  );
};
