import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Property } from "@/types/tenant";

interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
}

interface TenancyWithProfile {
  id: string;
  start_date: string;
  end_date: string | null;
  status: string;
  property: {
    id: string;
    name: string;
    address: string;
  };
  tenant: Profile;
}

async function fetchTenants(userId: string, userRole: "landlord" | "tenant") {
  console.log(`Fetching tenants for ${userRole}:`, userId);
  
  if (userRole === "landlord") {
    // First fetch properties owned by the landlord
    const { data: properties, error: propertiesError } = await supabase
      .from("properties")
      .select("id, name, address")
      .eq("landlord_id", userId);

    if (propertiesError) {
      console.error("Error fetching properties:", propertiesError);
      throw propertiesError;
    }

    // Then fetch tenancies with tenant profile data for those properties
    const { data: tenancies, error: tenanciesError } = await supabase
      .from("tenancies")
      .select(`
        id,
        start_date,
        end_date,
        status,
        property:properties (
          id,
          name,
          address
        ),
        tenant:profiles!tenancies_tenant_id_fkey (
          id,
          first_name,
          last_name,
          email,
          phone
        )
      `)
      .in('property_id', properties.map(p => p.id));

    if (tenanciesError) {
      console.error("Error fetching tenancies:", tenanciesError);
      throw tenanciesError;
    }

    console.log("Fetched tenancies:", tenancies);
    
    return { 
      tenancies: tenancies.map((tenancy: TenancyWithProfile) => ({
        id: tenancy.tenant.id,
        first_name: tenancy.tenant.first_name,
        last_name: tenancy.tenant.last_name,
        email: tenancy.tenant.email,
        phone: tenancy.tenant.phone,
        property: tenancy.property,
        tenancy: {
          start_date: tenancy.start_date,
          end_date: tenancy.end_date,
          status: tenancy.status
        }
      })),
      properties: properties as Property[]
    };
  } else {
    // Fetch tenant's own tenancy details
    const { data: tenancies, error: tenanciesError } = await supabase
      .from("tenancies")
      .select(`
        id,
        start_date,
        end_date,
        status,
        property:properties (
          id,
          name,
          address
        )
      `)
      .eq('tenant_id', userId)
      .single();

    if (tenanciesError) {
      console.error("Error fetching tenant details:", tenanciesError);
      throw tenanciesError;
    }

    // Fetch tenant's profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, first_name, last_name, email, phone")
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error("Error fetching profile:", profileError);
      throw profileError;
    }

    return {
      tenancies: [{
        id: profile.id,
        first_name: profile.first_name,
        last_name: profile.last_name,
        email: profile.email,
        phone: profile.phone,
        property: tenancies.property,
        tenancy: {
          start_date: tenancies.start_date,
          end_date: tenancies.end_date,
          status: tenancies.status
        }
      }],
      properties: [tenancies.property] as Property[]
    };
  }
}

export function useTenants(userId: string, userRole: "landlord" | "tenant") {
  return useQuery({
    queryKey: ["tenants", userId, userRole],
    queryFn: () => fetchTenants(userId, userRole),
  });
}