
import React from 'react';
import { Card } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Jan', total: 2500 },
  { name: 'Feb', total: 3500 },
  { name: 'Mar', total: 4200 },
  { name: 'Apr', total: 3800 },
  { name: 'May', total: 5000 },
  { name: 'Jun', total: 4800 },
  { name: 'Jul', total: 6300 },
  { name: 'Aug', total: 5400 },
  { name: 'Sep', total: 7200 },
  { name: 'Oct', total: 7000 },
  { name: 'Nov', total: 9000 },
  { name: 'Dec', total: 10200 },
];

export function Overview() {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-medium mb-4">Chiffre d'affaires</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{
              top: 5,
              right: 10,
              left: 10,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip
              formatter={(value: number) => 
                new Intl.NumberFormat('fr-FR', {
                  style: 'currency',
                  currency: 'EUR',
                }).format(value)
              }
            />
            <Line 
              type="monotone" 
              dataKey="total" 
              stroke="#3B82F6" 
              strokeWidth={2} 
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
