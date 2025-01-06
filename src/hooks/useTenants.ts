import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tenant, Property } from "@/types/tenant";

async function fetchTenants(userId: string) {
  console.log("Fetching tenants for landlord:", userId);
  
  // First fetch properties owned by the landlord
  const { data: properties, error: propertiesError } = await supabase
    .from("properties")
    .select("id, name, address")
    .eq("landlord_id", userId);

  if (propertiesError) {
    console.error("Error fetching properties:", propertiesError);
    throw propertiesError;
  }

  const propertyIds = properties.map(p => p.id);
  
  // Then fetch tenancies with tenant profile data for those properties
  const { data: tenancies, error: tenanciesError } = await supabase
    .from("tenancies")
    .select(`
      tenant_id,
      start_date,
      end_date,
      status,
      properties:property_id (
        id,
        name,
        address
      ),
      tenant:tenant_id (
        id,
        first_name,
        last_name,
        email,
        phone
      )
    `)
    .in('property_id', propertyIds);

  if (tenanciesError) {
    console.error("Error fetching tenancies:", tenanciesError);
    throw tenanciesError;
  }

  console.log("Fetched tenants:", tenancies);
  
  return { 
    tenancies: tenancies.map((tenancy) => ({
      id: tenancy.tenant?.id,
      first_name: tenancy.tenant?.first_name,
      last_name: tenancy.tenant?.last_name,
      email: tenancy.tenant?.email,
      phone: tenancy.tenant?.phone,
      property: tenancy.properties || { id: '', name: '', address: '' },
      tenancy: {
        start_date: tenancy.start_date,
        end_date: tenancy.end_date,
        status: tenancy.status
      }
    })) as Tenant[],
    properties: properties as Property[]
  };
}

export function useTenants(userId: string) {
  return useQuery({
    queryKey: ["tenants", userId],
    queryFn: () => fetchTenants(userId),
  });
}