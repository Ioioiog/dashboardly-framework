import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tenant } from "@/types/tenant";

interface TenancyData {
  tenant: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    phone: string | null;
    role: string;
    created_at: string;
    updated_at: string;
  };
  properties: {
    id: string;
    name: string;
    address: string;
  };
  start_date: string;
  end_date: string | null;
  status: string;
}

export function useTenants() {
  return useQuery({
    queryKey: ["tenants"],
    queryFn: async (): Promise<Tenant[]> => {
      console.log("Starting tenant data fetch...");
      
      try {
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

        const { data: tenanciesData, error: tenantsError } = await supabase
          .from('tenancies')
          .select(`
            tenant:profiles!inner (
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
            ),
            start_date,
            end_date,
            status
          `)
          .eq('status', 'active');

        if (tenantsError) {
          console.error("Error fetching tenants:", tenantsError);
          throw new Error("Failed to fetch tenants");
        }

        if (!tenanciesData) {
          console.log("No tenants data returned");
          return [];
        }

        console.log("Raw tenants data:", tenanciesData);

        // Transform the data to match our Tenant interface
        const formattedTenants: Tenant[] = tenanciesData.map((tenancy: TenancyData) => ({
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