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
  const [status, setStatus] = useState("all");
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
          tenancy:tenancies (
            property:properties (
              name,
              address
            ),
            tenant:profiles (
              first_name,
              last_name,
              email
            )
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

      console.log("Invoices fetched:", data);
      setInvoices(data as InvoiceWithRelations[]);
    } catch (error) {
      console.error("Error fetching invoices:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
    fetchInvoices();
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
            <InvoiceList invoices={invoices} userRole={userRole} />
          )}
        </CardContent>
      </Card>
    </DashboardSidebar>
  );
}
