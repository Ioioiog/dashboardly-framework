import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tenant } from "@/types/tenant";

export function useTenants() {
  return useQuery({
    queryKey: ["tenants"],
    queryFn: async (): Promise<Tenant[]> => {
      console.log("Fetching tenants data...");
      
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

      if (!tenantsData) {
        console.log("No tenants data found");
        return [];
      }

      console.log("Tenants data fetched:", tenantsData);

      // Transform the data to match our Tenant interface
      const formattedTenants = tenantsData
        .filter(tenancy => tenancy.profiles && tenancy.properties) // Filter out any records with missing related data
        .map((tenancy) => ({
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
        }));

      return formattedTenants;
    },
  });
}