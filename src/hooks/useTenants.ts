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

        // First get all active tenancies
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

        // Then get all pending invitations
        const { data: invitationsData, error: invitationsError } = await supabase
          .from('tenant_invitations')
          .select(`
            id,
            email,
            first_name,
            last_name,
            status,
            start_date,
            end_date,
            expiration_date,
            tenant_invitation_properties!inner (
              property:properties (
                id,
                name,
                address
              )
            )
          `)
          .eq('status', 'pending')
          .eq('used', false)
          .gt('expiration_date', new Date().toISOString());

        if (invitationsError) {
          console.error("Error fetching invitations:", invitationsError);
          throw new Error("Failed to fetch invitations");
        }

        console.log("Raw tenants data:", tenantsData);
        console.log("Raw invitations data:", invitationsData);

        // Filter out tenancies with missing tenant or property data
        const validTenancies = tenantsData?.filter(tenancy => {
          if (!tenancy.tenant || !tenancy.properties) {
            console.log("Found invalid tenancy:", tenancy);
            return false;
          }
          return true;
        }) || [];

        // Transform tenancies data
        const tenancyTenants = validTenancies.map(tenancy => ({
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

        // Transform invitations data
        const invitationTenants = (invitationsData || []).map(invitation => ({
          id: invitation.id, // Using invitation ID as temporary tenant ID
          first_name: invitation.first_name,
          last_name: invitation.last_name,
          email: invitation.email,
          phone: null,
          role: 'tenant',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          property: {
            id: invitation.tenant_invitation_properties[0].property.id,
            name: invitation.tenant_invitation_properties[0].property.name,
            address: invitation.tenant_invitation_properties[0].property.address,
          },
          tenancy: {
            start_date: invitation.start_date,
            end_date: invitation.end_date,
            status: 'pending',
          },
          invitation: {
            id: invitation.id,
            expiration_date: invitation.expiration_date,
            status: invitation.status,
          },
        }));

        // Combine both sets of data
        const allTenants = [...tenancyTenants, ...invitationTenants];
        console.log("Final formatted tenants:", allTenants);
        return allTenants;
      } catch (error) {
        console.error("Unexpected error in useTenants:", error);
        throw error;
      }
    },
    retry: 1,
    staleTime: 30000, // Consider data fresh for 30 seconds
  });
}