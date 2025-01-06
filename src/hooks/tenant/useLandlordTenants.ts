import { supabase } from "@/integrations/supabase/client";
import type { Property } from "@/types/tenant";

export async function fetchLandlordTenants(userId: string) {
  console.group("🏠 Fetching landlord tenants for:", userId);
  
  // First fetch properties owned by the landlord
  const { data: properties, error: propertiesError } = await supabase
    .from("properties")
    .select("id, name, address")
    .eq("landlord_id", userId);

  if (propertiesError) {
    console.error("❌ Error fetching properties:", propertiesError);
    throw propertiesError;
  }

  console.log("📍 Properties found:", properties.length);
  properties.forEach((prop, index) => {
    console.log(`  ${index + 1}. ${prop.name} (${prop.address})`);
  });

  // Fetch both active tenancies and pending invitations with profile information
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
        tenant:profiles!tenancies_tenant_id_fkey (
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
    console.error("❌ Error fetching tenancies:", tenanciesResponse.error);
    throw tenanciesResponse.error;
  }

  if (invitationsResponse.error) {
    console.error("❌ Error fetching invitations:", invitationsResponse.error);
    throw invitationsResponse.error;
  }

  // Log detailed information
  console.group("👥 Active and Past Tenancies:");
  tenanciesResponse.data.forEach((tenancy, index) => {
    console.log(`  ${index + 1}. ${tenancy.tenant.first_name} ${tenancy.tenant.last_name}`);
    console.log(`     📅 Period: ${tenancy.start_date} - ${tenancy.end_date || 'Ongoing'}`);
    console.log(`     🏠 Property: ${tenancy.property.name}`);
    console.log(`     📊 Status: ${tenancy.status}`);
    console.log(`     📧 Contact: ${tenancy.tenant.email}`);
    console.log('     ---');
  });
  console.groupEnd();

  // Format the response data
  const tenancies = tenanciesResponse.data.map((tenancy) => ({
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
  }));

  const invitations = invitationsResponse.data.map((invitation) => ({
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

  console.log("✅ Data fetch completed");
  console.groupEnd();

  return { 
    tenancies: [...tenancies, ...invitations],
    properties: properties as Property[]
  };
}