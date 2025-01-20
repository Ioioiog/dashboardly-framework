import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useUserRole } from "@/hooks/use-user-role";
import { supabase } from "@/integrations/supabase/client";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { TenantInviteDialog } from "@/components/tenants/TenantInviteDialog";
import { useProperties } from "@/hooks/useProperties";
import { useToast } from "@/hooks/use-toast";

export default function Tenants() {
  const [tenants, setTenants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { userRole } = useUserRole();
  const properties = useProperties();
  const { toast } = useToast();

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    try {
      setIsLoading(true);
      console.log("Fetching tenants data...");
      
      const { data: tenantsData, error } = await supabase
        .from('tenancies')
        .select(`
          tenant_id,
          start_date,
          end_date,
          status,
          profiles!tenancies_tenant_id_fkey (
            id,
            first_name,
            last_name,
            email,
            phone,
            role
          ),
          properties (
            id,
            name,
            address
          )
        `)
        .eq('status', 'active');

      if (error) {
        console.error("Error fetching tenants:", error);
        toast({
          title: "Error",
          description: "Failed to fetch tenants. Please try again.",
          variant: "destructive",
        });
        return;
      }

      console.log("Tenants data fetched:", tenantsData);

      const formattedTenants = tenantsData
        .filter(tenancy => tenancy.profiles && tenancy.properties)
        .map(tenancy => ({
          id: tenancy.profiles.id,
          first_name: tenancy.profiles.first_name,
          last_name: tenancy.profiles.last_name,
          email: tenancy.profiles.email,
          phone: tenancy.profiles.phone,
          role: tenancy.profiles.role,
          property: {
            id: tenancy.properties.id,
            name: tenancy.properties.name,
            address: tenancy.properties.address,
          },
          tenancy: {
            start_date: tenancy.start_date,
            end_date: tenancy.end_date,
            status: tenancy.status,
          },
        }));

      setTenants(formattedTenants);
    } catch (error) {
      console.error("Error in fetchTenants:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while fetching tenants.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardSidebar>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Tenants</CardTitle>
          <TenantInviteDialog properties={properties.properties} />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div>Loading...</div>
          ) : (
            <div>{/* TenantList component will go here */}</div>
          )}
        </CardContent>
      </Card>
    </DashboardSidebar>
  );
}