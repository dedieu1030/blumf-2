
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Status = "paid" | "pending" | "overdue" | "draft";

interface InvoiceStatusProps {
  status: Status;
  className?: string;
}

export function InvoiceStatus({ status, className }: InvoiceStatusProps) {
  const getStatusDetails = (status: Status) => {
    switch (status) {
      case "paid":
        return {
          label: "Payée",
          className: "bg-success/20 text-success hover:bg-success/30 border-success/20"
        };
      case "pending":
        return {
          label: "En attente",
          className: "bg-info/20 text-info hover:bg-info/30 border-info/20"
        };
      case "overdue":
        return {
          label: "En retard",
          className: "bg-destructive/20 text-destructive hover:bg-destructive/30 border-destructive/20"
        };
      case "draft":
        return {
          label: "Brouillon",
          className: "bg-muted text-muted-foreground hover:bg-muted/80"
        };
      default:
        return {
          label: "Inconnu",
          className: "bg-muted text-muted-foreground"
        };
    }
  };

  const { label, className: statusClassName } = getStatusDetails(status);

  return (
    <Badge 
      variant="outline" 
      className={cn("rounded-md font-normal", statusClassName, className)}
    >
      {label}
    </Badge>
  );
}

export default InvoiceStatus;
