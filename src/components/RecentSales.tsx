
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/utils/formatters';

interface Sale {
  id: string;
  customer: {
    name: string;
    email: string;
    imageUrl?: string;
  };
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  date: string;
}

const recentSales: Sale[] = [
  {
    id: '1',
    customer: {
      name: 'Olivia Martin',
      email: 'olivia.martin@email.com',
    },
    amount: 1999.99,
    status: 'paid',
    date: '2025-04-11'
  },
  {
    id: '2',
    customer: {
      name: 'Jackson Lee',
      email: 'jackson.lee@email.com',
    },
    amount: 1599.00,
    status: 'pending',
    date: '2025-04-10'
  },
  {
    id: '3',
    customer: {
      name: 'Isabella Nguyen',
      email: 'isabella.nguyen@email.com',
    },
    amount: 699.00,
    status: 'paid',
    date: '2025-04-09'
  },
  {
    id: '4',
    customer: {
      name: 'William Kim',
      email: 'will.kim@email.com',
    },
    amount: 2999.00,
    status: 'paid',
    date: '2025-04-08'
  },
  {
    id: '5',
    customer: {
      name: 'Sofia Davis',
      email: 'sofia.davis@email.com',
    },
    amount: 899.00,
    status: 'failed',
    date: '2025-04-07'
  }
];

export function RecentSales() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ventes Récentes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {recentSales.map((sale) => (
            <div className="flex items-center" key={sale.id}>
              <Avatar className="h-9 w-9 mr-3">
                <AvatarImage src={sale.customer.imageUrl} alt={sale.customer.name} />
                <AvatarFallback>{sale.customer.name.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{sale.customer.name}</p>
                    <p className="text-xs text-muted-foreground">{sale.customer.email}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium ${sale.status === 'paid' ? 'text-green-500' : sale.status === 'pending' ? 'text-yellow-500' : 'text-red-500'}`}>
                      {formatCurrency(sale.amount)}
                    </p>
                    <p className="text-xs text-muted-foreground">{new Date(sale.date).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
