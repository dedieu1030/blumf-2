
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { Status } from "@/types/invoice";

interface InvoiceStatusProps {
  status: Status;
  className?: string;
  onStatusChange?: () => void; // Ensuring this prop is defined
}

export function InvoiceStatus({ status, className, onStatusChange }: InvoiceStatusProps) {
  const { t } = useTranslation();
  
  const getStatusDetails = (status: Status) => {
    switch (status) {
      case "paid":
        return {
          label: t("paidStatus"),
          className: "bg-success/20 text-success hover:bg-success/30 border-success/20"
        };
      case "pending":
        return {
          label: t("pendingStatus"),
          className: "bg-info/20 text-info hover:bg-info/30 border-info/20"
        };
      case "overdue":
        return {
          label: t("overdueStatus"),
          className: "bg-destructive/20 text-destructive hover:bg-destructive/30 border-destructive/20"
        };
      case "draft":
        return {
          label: t("draftStatus"),
          className: "bg-muted text-muted-foreground hover:bg-muted/80"
        };
      case "cancelled":
        return {
          label: t("cancelledStatus", "Annulée"),
          className: "bg-gray-200 text-gray-700 hover:bg-gray-300"
        };
      default:
        return {
          label: t("unknownStatus"),
          className: "bg-muted text-muted-foreground"
        };
    }
  };

  const { label, className: statusClassName } = getStatusDetails(status);

  return (
    <Badge 
      variant="outline" 
      className={cn("rounded-md font-normal", statusClassName, className)}
      onClick={onStatusChange} // Using the prop
    >
      {label}
    </Badge>
  );
}

export default InvoiceStatus;
