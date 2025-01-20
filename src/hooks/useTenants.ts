import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tenant } from "@/types/tenant";

export function useTenants() {
  return useQuery({
    queryKey: ["tenants"],
    queryFn: async (): Promise<Tenant[]> => {
      console.log("Starting tenant data fetch...");
      
      try {
        // First, let's log the current user's ID
        const { data: { user } } = await supabase.auth.getUser();
        console.log("Current user ID:", user?.id);

        // Get the user's profile to verify role
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user?.id)
          .single();
        console.log("User profile:", profile);

        const { data: tenantsData, error: tenantsError } = await supabase
          .from('tenancies')
          .select(`
            tenant_id,
            start_date,
            end_date,
            status,
            tenant:profiles!tenancies_tenant_id_fkey (
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
          console.error("Error details:", {
            message: tenantsError.message,
            details: tenantsError.details,
            hint: tenantsError.hint
          });
          throw new Error(`Failed to fetch tenants: ${tenantsError.message}`);
        }

        if (!tenantsData) {
          console.log("No tenants data returned");
          return [];
        }

        console.log("Raw tenants data:", tenantsData);
        console.log("Number of tenancies found:", tenantsData.length);

        // Filter out tenancies with missing profile data
        const validTenancies = tenantsData.filter(tenancy => {
          const isValid = tenancy.tenant && tenancy.properties;
          if (!isValid) {
            console.log("Found invalid tenancy:", tenancy);
          }
          return isValid;
        });
        
        console.log("Number of valid tenancies:", validTenancies.length);
        
        // Transform the data to match our Tenant interface
        const formattedTenants = validTenancies.map((tenancy) => {
          console.log("Processing tenancy:", {
            tenantId: tenancy.tenant.id,
            tenantEmail: tenancy.tenant.email,
            propertyName: tenancy.properties.name
          });
          return {
            id: tenancy.tenant.id,
            first_name: tenancy.tenant.first_name,
            last_name: tenancy.tenant.last_name,
            email: tenancy.tenant.email,
            phone: tenancy.tenant.phone,
            role: tenancy.tenant.role,
            created_at: tenancy.tenant.created_at,
            updated_at: tenancy.tenant.updated_at,
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

        console.log("Final formatted tenants:", formattedTenants);
        return formattedTenants;
      } catch (error) {
        console.error("Unexpected error in useTenants:", error);
        throw error;
      }
    },
    retry: 1,
    staleTime: 30000, // Consider data fresh for 30 seconds
  });
}