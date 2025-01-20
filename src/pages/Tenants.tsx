import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TenantList } from "@/components/tenants/TenantList";
import { useUserRole } from "@/hooks/use-user-role";
import { supabase } from "@/integrations/supabase/client";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";

export default function Tenants() {
  const [tenants, setTenants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { userRole } = useUserRole();

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, email");

      if (error) throw error;
      setTenants(data || []);
    } catch (error) {
      console.error("Error fetching tenants:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!userRole) return null;

  return (
    <DashboardSidebar>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Tenants</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-6">Loading tenants...</div>
          ) : (
            <TenantList tenants={tenants} />
          )}
        </CardContent>
      </Card>
    </DashboardSidebar>
  );
}
