
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface SaleInfo {
  name: string;
  email: string;
  amount: string;
  date: string;
}

const defaultSales: SaleInfo[] = [
  {
    name: "Olivia Martin",
    email: "olivia.martin@email.com",
    amount: "+ 1,999.00 €",
    date: "Il y a 2 heures"
  },
  {
    name: "Jackson Lee",
    email: "jackson.lee@email.com",
    amount: "+ 39.00 €",
    date: "Il y a 2 jours"
  },
  {
    name: "Isabella Nguyen",
    email: "isabella.nguyen@email.com",
    amount: "+ 299.00 €",
    date: "Il y a 3 jours"
  },
  {
    name: "William Kim",
    email: "will@email.com",
    amount: "+ 99.00 €",
    date: "Il y a 4 jours"
  },
  {
    name: "Sofia Davis",
    email: "sofia.davis@email.com",
    amount: "+ 459.00 €",
    date: "Il y a 5 jours"
  }
];

interface RecentSalesProps {
  sales?: SaleInfo[];
}

export function RecentSales({ sales = defaultSales }: RecentSalesProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-8">
      {sales.map((sale, index) => (
        <div className="flex items-center" key={`${sale.name}-${index}`}>
          <Avatar className="h-9 w-9">
            <AvatarImage src={`https://avatar.vercel.sh/${sale.name.toLowerCase().replace(/\s+/g, '-')}.png`} alt={sale.name} />
            <AvatarFallback>{sale.name.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{sale.name}</p>
            <p className="text-sm text-muted-foreground">{sale.email}</p>
          </div>
          <div className={cn("ml-auto font-medium", sale.amount.startsWith('+') ? 'text-green-500' : 'text-red-500')}>
            {sale.amount}
          </div>
        </div>
      ))}
    </div>
  );
}

export default RecentSales;
