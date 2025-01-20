import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tenant } from "@/types/tenant";

export function useTenants() {
  return useQuery({
    queryKey: ["tenants"],
    queryFn: async (): Promise<Tenant[]> => {
      console.log("Starting tenant data fetch...");
      
      const { data: tenantsData, error: tenantsError } = await supabase
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
            role,
            created_at,
            updated_at
          ),
          properties (
            id,
            name,
            address
          )
        `)
        .eq('status', 'active');

      if (tenantsError) {
        console.error("Error fetching tenants:", tenantsError);
        throw tenantsError;
      }

      console.log("Raw tenants data from Supabase:", tenantsData);

      if (!tenantsData) {
        console.log("No tenants data found in database");
        return [];
      }

      // Transform the data to match our Tenant interface
      const formattedTenants = tenantsData
        .filter(tenancy => {
          if (!tenancy.profiles || !tenancy.properties) {
            console.warn("Incomplete tenancy data:", tenancy);
            return false;
          }
          return true;
        })
        .map((tenancy) => {
          console.log("Processing tenancy:", tenancy);
          return {
            id: tenancy.profiles.id,
            first_name: tenancy.profiles.first_name,
            last_name: tenancy.profiles.last_name,
            email: tenancy.profiles.email,
            phone: tenancy.profiles.phone,
            role: tenancy.profiles.role,
            created_at: tenancy.profiles.created_at,
            updated_at: tenancy.profiles.updated_at,
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
          };
        });

      console.log("Formatted tenants data:", formattedTenants);
      return formattedTenants;
    },
  });
}