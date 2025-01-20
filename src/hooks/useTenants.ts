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
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          console.error("Error getting current user:", userError);
          throw userError;
        }

        if (!user) {
          console.error("No user found");
          throw new Error("No authenticated user found");
        }

        console.log("Current user ID:", user.id);

        // Get the user's profile to verify role
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error("Error fetching user profile:", profileError);
          throw new Error(`Failed to fetch user profile: ${profileError.message}`);
        }

        console.log("User profile:", profile);

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
          `)
          .eq('status', 'active');

        if (tenantsError) {
          console.error("Error fetching tenants:", tenantsError);
          throw new Error(`Failed to fetch tenants: ${tenantsError.message}`);
        }

        if (!tenantsData) {
          console.log("No tenants data returned");
          return [];
        }

        console.log("Raw tenants data:", tenantsData);

        // Filter out tenancies with missing tenant or property data
        const validTenancies = tenantsData.filter(tenancy => {
          if (!tenancy.tenant || !tenancy.properties) {
            console.log("Found invalid tenancy:", tenancy);
            return false;
          }
          return true;
        });

        console.log("Number of valid tenancies:", validTenancies.length);

        // Transform the data to match our Tenant interface
        const formattedTenants = validTenancies.map(tenancy => ({
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
        }));

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