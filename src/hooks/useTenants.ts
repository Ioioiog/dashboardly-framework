import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tenant } from "@/types/tenant";

export function useTenants() {
  return useQuery({
    queryKey: ["tenants"],
    queryFn: async (): Promise<Tenant[]> => {
      console.log("Starting tenant data fetch...");
      
      try {
        // First, verify authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError) {
          console.error("Auth error:", authError);
          throw new Error("Authentication failed");
        }

        if (!user) {
          console.error("No authenticated user found");
          return [];
        }

        console.log("Authenticated user ID:", user.id);

        // Get the user's profile to verify role
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error("Profile fetch error:", profileError);
          throw new Error("Failed to fetch user profile");
        }

        console.log("User profile:", profile);

        // Fetch all tenancies with related data and log each step
        const { data: tenantsData, error: tenantsError } = await supabase
          .from('tenancies')
          .select(`
            id,
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
          `);

        if (tenantsError) {
          console.error("Error fetching tenants:", tenantsError);
          throw new Error("Failed to fetch tenants");
        }

        console.log("Raw tenancies data:", tenantsData);

        // Log each tenancy status for debugging
        tenantsData?.forEach(tenancy => {
          console.log(`Tenancy for ${tenancy.tenant?.email}:`, {
            tenancyId: tenancy.id,
            status: tenancy.status,
            startDate: tenancy.start_date,
            endDate: tenancy.end_date
          });
        });

        // Filter out tenancies with missing tenant or property data
        const validTenancies = tenantsData?.filter(tenancy => {
          if (!tenancy.tenant || !tenancy.properties) {
            console.log("Found invalid tenancy:", tenancy);
            return false;
          }
          return true;
        });

        console.log("Number of valid tenancies:", validTenancies?.length);

        // Transform the data to match our Tenant interface
        const formattedTenants = validTenancies?.map(tenancy => {
          const tenant = {
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
          console.log(`Formatted tenant data for ${tenant.email}:`, tenant);
          return tenant;
        });

        console.log("Final formatted tenants:", formattedTenants);
        return formattedTenants || [];
      } catch (error) {
        console.error("Unexpected error in useTenants:", error);
        throw error;
      }
    },
    retry: 1,
    staleTime: 30000, // Consider data fresh for 30 seconds
  });
}