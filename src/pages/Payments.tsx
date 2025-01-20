import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PaymentList } from "@/components/payments/PaymentList";
import { PaymentDialog } from "@/components/payments/PaymentDialog";
import { PaymentFilters } from "@/components/payments/PaymentFilters";
import { useUserRole } from "@/hooks/use-user-role";
import { supabase } from "@/integrations/supabase/client";
import { PaymentWithRelations } from "@/integrations/supabase/types/payment";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";

export default function Payments() {
  const [payments, setPayments] = useState<PaymentWithRelations[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { userRole } = useUserRole();

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setIsLoading(true);
      console.log("Fetching payments...");

      const query = supabase
        .from("payments")
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

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      console.log("Payments fetched:", data);
      setPayments(data as PaymentWithRelations[]);
    } catch (error) {
      console.error("Error fetching payments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!userRole) return null;

  return (
    <div className="flex h-screen">
      <DashboardSidebar />
      <div className="flex-1 p-8 overflow-auto">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Payments</CardTitle>
            <div className="flex items-center gap-4">
              <PaymentFilters />
              {userRole === "landlord" && <PaymentDialog />}
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-6">Loading payments...</div>
            ) : (
              <PaymentList payments={payments} userRole={userRole} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}