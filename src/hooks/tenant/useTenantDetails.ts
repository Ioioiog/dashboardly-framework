import { supabase } from "@/integrations/supabase/client";

export async function fetchTenantDetails(userId: string) {
  console.group("👤 Fetching tenant details for:", userId);

  // Fetch tenant's own tenancy details with profile and property information
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
      ),
      tenant:profiles!tenancies_tenant_id_fkey (
        id,
        first_name,
        last_name,
        email,
        phone
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

  console.log("\n👤 Tenant Details:");
  console.log("----------------------------------------");
  console.log(`  Name: ${tenancy.tenant.first_name} ${tenancy.tenant.last_name}`);
  console.log(`  Email: ${tenancy.tenant.email}`);
  console.log(`  Phone: ${tenancy.tenant.phone || 'Not provided'}`);
  
  console.log("\n🏠 Property Details:");
  console.log("----------------------------------------");
  console.log(`  Property: ${tenancy.property.name}`);
  console.log(`  Address: ${tenancy.property.address}`);
  console.log(`  Status: ${tenancy.status}`);
  console.log(`  Period: ${tenancy.start_date} - ${tenancy.end_date || 'Ongoing'}`);

  console.log("\n✅ Data fetch completed");
  console.groupEnd();

  return {
    tenancies: [{
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
    }],
    properties: [tenancy.property]
  };
}