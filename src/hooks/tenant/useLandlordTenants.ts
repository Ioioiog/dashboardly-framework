import { supabase } from "@/integrations/supabase/client";
import type { Property } from "@/types/tenant";

export async function fetchLandlordTenants(userId: string) {
  console.log("Fetching landlord tenants for:", userId);
  
  // First fetch properties owned by the landlord
  const { data: properties, error: propertiesError } = await supabase
    .from("properties")
    .select("id, name, address")
    .eq("landlord_id", userId);

  if (propertiesError) {
    console.error("Error fetching properties:", propertiesError);
    throw propertiesError;
  }

  // Fetch both active tenancies and pending invitations
  const [tenanciesResponse, invitationsResponse] = await Promise.all([
    supabase
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
        profiles!tenancies_tenant_id_fkey (
          id,
          first_name,
          last_name,
          email,
          phone
        )
      `)
      .in('property_id', properties.map(p => p.id)),
    
    supabase
      .from("tenant_invitations")
      .select(`
        id,
        email,
        first_name,
        last_name,
        start_date,
        end_date,
        status,
        property:properties (
          id,
          name,
          address
        )
      `)
      .in('property_id', properties.map(p => p.id))
      .eq('status', 'pending')
  ]);

  if (tenanciesResponse.error) {
    console.error("Error fetching tenancies:", tenanciesResponse.error);
    throw tenanciesResponse.error;
  }

  if (invitationsResponse.error) {
    console.error("Error fetching invitations:", invitationsResponse.error);
    throw invitationsResponse.error;
  }

  console.log("Fetched tenancies:", tenanciesResponse.data);
  console.log("Fetched invitations:", invitationsResponse.data);
  
  // Combine tenancies and invitations into a unified format
  const tenancies = tenanciesResponse.data.map((tenancy: any) => ({
    id: tenancy.profiles.id,
    first_name: tenancy.profiles.first_name,
    last_name: tenancy.profiles.last_name,
    email: tenancy.profiles.email,
    phone: tenancy.profiles.phone,
    property: tenancy.property,
    tenancy: {
      start_date: tenancy.start_date,
      end_date: tenancy.end_date,
      status: tenancy.status
    }
  }));

  const invitations = invitationsResponse.data.map((invitation: any) => ({
    id: invitation.id,
    first_name: invitation.first_name,
    last_name: invitation.last_name,
    email: invitation.email,
    phone: null,
    property: invitation.property,
    tenancy: {
      start_date: invitation.start_date,
      end_date: invitation.end_date,
      status: 'invitation_pending'
    }
  }));

  return { 
    tenancies: [...tenancies, ...invitations],
    properties: properties as Property[]
  };
}