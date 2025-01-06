import { supabase } from "@/integrations/supabase/client";
import type { Property } from "@/types/tenant";

export async function fetchTenantDetails(userId: string) {
  console.log("Fetching tenant details for:", userId);
  
  // Fetch tenant's own tenancy details
  const { data: tenancy, error: tenancyError } = await supabase
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
    .maybeSingle();

  if (tenancyError) {
    console.error("Error fetching tenant details:", tenancyError);
    throw tenancyError;
  }

  // If no tenancy found, return empty data
  if (!tenancy) {
    console.log("No active tenancy found for user:", userId);
    return {
      tenancies: [],
      properties: []
    };
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
      property: tenancy.property,
      tenancy: {
        start_date: tenancy.start_date,
        end_date: tenancy.end_date,
        status: tenancy.status
      }
    }],
    properties: [tenancy.property] as Property[]
  };
}