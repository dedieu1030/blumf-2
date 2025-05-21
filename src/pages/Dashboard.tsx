
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, CreditCard, Package, Users, FileText } from "lucide-react";
import { RecentSales } from "@/components/RecentSales";
import { Overview } from "@/components/Overview";
import { useTranslation } from "react-i18next";
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { getMockRecentInvoices, getMockOverdueInvoices } from '@/services/mockDataService';

import { DashboardStats } from "@/components/DashboardStats";
import { InvoiceList } from "@/components/InvoiceList";
import { Header } from "@/components/Header";
import { QuickAction } from "@/components/QuickAction";
import { Invoice } from "@/types/invoice";

const Dashboard = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [overdueInvoices, setOverdueInvoices] = useState<Invoice[]>([]);
  const [recentInvoices, setRecentInvoices] = useState<Invoice[]>([]);

  // Load recent invoices
  useEffect(() => {
    const fetchRecentInvoices = async () => {
      try {
        const { data, error } = await supabase
          .from('invoices')
          .select('*, clients(*)')
          .order('created_at', { ascending: false })
          .limit(3);

        if (error) throw error;
        setRecentInvoices(data.map((invoice: any) => ({
          ...invoice,
          // Add safe access for client_name with fallback
          client_name: invoice.clients?.client_name || "Unknown Client"
        })));
      } catch (error) {
        console.error('Error loading recent invoices:', error);
        // Fallback to mock data
        setRecentInvoices(getMockRecentInvoices());
      }
    };

    fetchRecentInvoices();
  }, [supabase]);

  // Load overdue invoices
  useEffect(() => {
    const fetchOverdueInvoices = async () => {
      try {
        const { data, error } = await supabase
          .from('invoices')
          .select('*, clients(*)')
          .eq('status', 'overdue')
          .order('due_date', { ascending: false })
          .limit(3);

        if (error) throw error;
        setOverdueInvoices(data.map((invoice: any) => ({
          ...invoice,
          // Add safe access for client_name with fallback
          client_name: invoice.clients?.client_name || "Unknown Client"
        })));
      } catch (error) {
        console.error('Error loading overdue invoices:', error);
        // Fallback to mock data
        setOverdueInvoices(getMockOverdueInvoices());
      }
    };

    fetchOverdueInvoices();
  }, [supabase]);

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("totalRevenue", "Revenu total")}</CardTitle>
            <FileText className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45 231,89 €</div>
            <p className="text-sm text-green-500">+20.1% {t("fromLastMonth", "du mois dernier")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("subscriptions", "Abonnements")}</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+2350</div>
            <p className="text-sm text-green-500">+180.1% {t("fromLastMonth", "du mois dernier")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("salesCount", "Ventes")}</CardTitle>
            <CreditCard className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12,234</div>
            <p className="text-sm text-red-500">-19% {t("fromLastMonth", "du mois dernier")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("activeProjects", "Projets actifs")}</CardTitle>
            <Package className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+573</div>
            <p className="text-sm text-green-500">+201 {t("fromLastMonth", "du mois dernier")}</p>
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 gap-6 mt-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl">{t("recentInvoices", "Factures récentes")}</CardTitle>
              <CardDescription>{t("last5Invoices", "Les 5 dernières factures créées")}</CardDescription>
            </div>
            <Link to="/invoices">
              <Button variant="ghost" size="sm" className="gap-1">
                <FileText className="h-4 w-4" /> {t("allInvoices", "Toutes les factures")}
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <InvoiceList 
              invoices={recentInvoices}
              limit={5}
            />
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default Dashboard;
