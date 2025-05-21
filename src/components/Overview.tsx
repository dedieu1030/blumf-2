
import React from 'react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { useTranslation } from "react-i18next";

interface OverviewData {
  name: string;
  total: number;
}

const defaultData: OverviewData[] = [
  { name: "Jan", total: 1200 },
  { name: "Feb", total: 2100 },
  { name: "Mar", total: 1800 },
  { name: "Apr", total: 1600 },
  { name: "May", total: 2800 },
  { name: "Jun", total: 2300 },
  { name: "Jul", total: 2500 },
  { name: "Aug", total: 3100 },
  { name: "Sep", total: 2900 },
  { name: "Oct", total: 1900 },
  { name: "Nov", total: 2600 },
  { name: "Dec", total: 3200 },
];

interface OverviewProps {
  data?: OverviewData[];
}

export function Overview({ data = defaultData }: OverviewProps) {
  const { t } = useTranslation();

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis
          dataKey="name"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `€${value}`}
        />
        <Tooltip 
          formatter={(value: number) => [`€${value}`, t("revenue", "Revenu")]}
          labelFormatter={(label) => t(label.toLowerCase())}
        />
        <Bar
          dataKey="total"
          fill="#4F46E5"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

export default Overview;
