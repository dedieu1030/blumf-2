
import { DashboardStats } from "@/components/DashboardStats";
import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InvoiceList } from "@/components/InvoiceList";
import { useEffect, useState } from "react";
import { Invoice } from "@/types/invoice";
import { supabase } from "@/integrations/supabase/client";
import { QuickAction } from "@/components/QuickAction";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, FileText } from "lucide-react";

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [overdueInvoices, setOverdueInvoices] = useState<Invoice[]>([]);
  const [recentInvoices, setRecentInvoices] = useState<Invoice[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch stats totals
        const { data: invoiceStats, error: invoiceStatsError } = await supabase.rpc(
          'count_invoices_by_status'
        ).maybeSingle();

        if (invoiceStatsError && !invoiceStatsError.message.includes('does not exist')) {
          console.error("Error fetching invoice stats:", invoiceStatsError);
        }

        // Update overdue invoices
        const { data: overdueData, error: overdueError } = await supabase
          .from('invoices')
          .select('*, client:clients(*)')
          .eq('status', 'overdue')
          .order('due_date', { ascending: false });
          
        if (overdueError) {
          console.error("Error fetching overdue invoices:", overdueError);
        } else {
          // Transform data for overdue invoices
          const transformedOverdueInvoices: Invoice[] = (overdueData || [])?.map((invoice) => ({
            id: invoice.id,
            invoice_number: invoice.invoice_number,
            number: invoice.invoice_number, // For compatibility
            client_name: invoice.client?.client_name || "Client inconnu",
            client_id: invoice.client_id,
            amount: invoice.total_amount.toString(),
            date: invoice.issue_date,
            due_date: invoice.due_date,
            status: invoice.status as any
          }));

          setOverdueInvoices(transformedOverdueInvoices);
        }

        // Fetch recent invoices
        const { data: recentData, error: recentError } = await supabase
          .from('invoices')
          .select('*, client:clients(*)')
          .order('created_at', { ascending: false })
          .limit(5);

        if (recentError) {
          console.error("Error fetching recent invoices:", recentError);
        } else {
          // Transform data to match Invoice type
          const transformedInvoices: Invoice[] = (recentData || [])?.map((invoice) => ({
            id: invoice.id,
            invoice_number: invoice.invoice_number,
            number: invoice.invoice_number, // For compatibility
            client_name: invoice.client?.client_name || "Client inconnu",
            client_id: invoice.client_id,
            amount: invoice.total_amount.toString(),
            date: invoice.issue_date,
            due_date: invoice.due_date,
            status: invoice.status as any
          }));

          setRecentInvoices(transformedInvoices);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div>
      <Header
        title="Dashboard"
        description="Bienvenue sur votre tableau de bord"
        onOpenMobileMenu={() => {}}
        actions={<QuickAction />}
      />
      
      <DashboardStats
        overdueInvoices={overdueInvoices}
      />

      <div className="grid grid-cols-1 gap-6 mt-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl">Factures récentes</CardTitle>
              <CardDescription>Les 5 dernières factures créées</CardDescription>
            </div>
            <Link to="/invoices">
              <Button variant="ghost" size="sm" className="gap-1">
                <FileText className="h-4 w-4" /> Toutes les factures
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
    </div>
  );
};

export default Dashboard;
