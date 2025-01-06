import { supabase } from "@/integrations/supabase/client";

export interface Property {
  id: string;
  name: string;
  address: string;
  monthly_rent: number;
  type: string;
  description?: string;
  available_from?: string;
}

export async function fetchLandlordProperties(userId: string) {
  console.log("Fetching landlord properties for user:", userId);
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("landlord_id", userId);

  if (error) {
    console.error("Error fetching landlord properties:", error);
    throw error;
  }

  console.log("Fetched landlord properties:", data);
  return data;
}

export async function fetchTenantProperties(userId: string) {
  console.log("Fetching tenant properties for user:", userId);
  const { data, error } = await supabase
    .from("tenancies")
    .select(`
      property:properties (
        id,
        name,
        address,
        monthly_rent,
        type,
        description,
        available_from
      )
    `)
    .eq("tenant_id", userId)
    .eq("status", "active");

  if (error) {
    console.error("Error fetching tenant properties:", error);
    throw error;
  }

  console.log("Fetched tenant properties:", data);
  return data.map(tenancy => tenancy.property);
}