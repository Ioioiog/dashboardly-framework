import { supabase } from "@/integrations/supabase/client";

export async function fetchTenantDetails(userId: string) {
  console.group("👤 Fetching tenant details for:", userId);
  console.log("========================================");

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
    console.error("❌ Error fetching tenant details:", tenancyError);
    throw tenancyError;
  }

  // If no tenancy found, return empty data
  if (!tenancy) {
    console.log("ℹ️ No active tenancy found for user:", userId);
    console.groupEnd();
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
    console.error("❌ Error fetching profile:", profileError);
    throw profileError;
  }

  console.log("\n👤 Tenant Details:");
  console.log("----------------------------------------");
  console.log(`  Name: ${profile.first_name} ${profile.last_name}`);
  console.log(`  Email: ${profile.email}`);
  console.log(`  Phone: ${profile.phone || 'Not provided'}`);
  
  console.log("\n🏠 Property Details:");
  console.log("----------------------------------------");
  console.log(`  Property: ${tenancy.property.name}`);
  console.log(`  Address: ${tenancy.property.address}`);
  console.log(`  Status: ${tenancy.status}`);
  console.log(`  Period: ${tenancy.start_date} - ${tenancy.end_date || 'Ongoing'}`);

  console.log("\n✅ Data fetch completed");
  console.log("========================================\n");
  console.groupEnd();

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
    properties: [tenancy.property]
  };
}