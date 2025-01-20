import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { InvoiceList } from "@/components/invoices/InvoiceList";
import { InvoiceDialog } from "@/components/invoices/InvoiceDialog";
import { InvoiceFilters } from "@/components/invoices/InvoiceFilters";
import { useUserRole } from "@/hooks/use-user-role";
import { supabase } from "@/integrations/supabase/client";
import { InvoiceWithRelations } from "@/integrations/supabase/types/invoice";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";

export default function Invoices() {
  const [invoices, setInvoices] = useState<InvoiceWithRelations[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState<'all' | 'pending' | 'paid' | 'overdue'>('all');
  const { userRole } = useUserRole();

  useEffect(() => {
    fetchInvoices();
  }, [userRole, status]);

  const fetchInvoices = async () => {
    try {
      setIsLoading(true);
      console.log("Fetching invoices...");

      const query = supabase
        .from("invoices")
        .select(`
          *,
          property:properties (
            name,
            address
          ),
          tenant_profile:profiles!invoices_tenant_id_fkey (
            first_name,
            last_name,
            email
          )
        `)
        .order("due_date", { ascending: false });

      if (status !== "all") {
        query.eq("status", status);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      // Transform the data to match InvoiceWithRelations type
      const transformedInvoices: InvoiceWithRelations[] = data.map(invoice => ({
        ...invoice,
        tenancy: {
          property: {
            name: invoice.property?.name || '',
            address: invoice.property?.address || ''
          },
          tenant: {
            first_name: invoice.tenant_profile?.first_name || '',
            last_name: invoice.tenant_profile?.last_name || '',
            email: invoice.tenant_profile?.email || ''
          }
        }
      }));

      console.log("Invoices fetched:", transformedInvoices);
      setInvoices(transformedInvoices);
    } catch (error) {
      console.error("Error fetching invoices:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = (newStatus: 'all' | 'pending' | 'paid' | 'overdue') => {
    setStatus(newStatus);
  };

  if (!userRole) return null;

  return (
    <DashboardSidebar>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Invoices</CardTitle>
          <div className="flex items-center gap-4">
            <InvoiceFilters 
              status={status} 
              onStatusChange={handleStatusChange} 
            />
            {userRole === "landlord" && (
              <InvoiceDialog 
                onInvoiceCreated={fetchInvoices} 
              />
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-6">Loading invoices...</div>
          ) : (
            <InvoiceList 
              invoices={invoices} 
              userRole={userRole} 
              onStatusUpdate={fetchInvoices}
            />
          )}
        </CardContent>
      </Card>
    </DashboardSidebar>
  );
}