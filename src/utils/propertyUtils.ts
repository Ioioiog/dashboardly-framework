import { supabase } from "@/integrations/supabase/client";

export type PropertyType = "Apartment" | "House" | "Condo" | "Commercial";

export interface Property {
  id: string;
  name: string;
  address: string;
  monthly_rent: number;
  type: PropertyType;
  description?: string;
  available_from?: string;
  landlord_id?: string;
}

export interface PropertyInput extends Omit<Property, 'id' | 'landlord_id'> {
  landlord_id: string;
}

export async function fetchLandlordProperties(userId: string) {
  if (!userId) {
    console.log("No user ID provided for fetchLandlordProperties");
    return [];
  }

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
  if (!userId) {
    console.error("❌ No user ID provided for fetchTenantProperties");
    return [];
  }

  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(userId)) {
    console.error("❌ Invalid UUID format for userId:", userId);
    return [];
  }

  console.log("🔍 Fetching tenant properties for user:", userId);
  
  // First, let's check if there are any active tenancies for this user
  const { data: tenancies, error: tenancyError } = await supabase
    .from('tenancies')
    .select('*, property:properties(*)')
    .eq('tenant_id', userId)
    .eq('status', 'active');

  if (tenancyError) {
    console.error("❌ Error fetching tenancies:", tenancyError);
    throw tenancyError;
  }

  console.log("📋 Found tenancies:", tenancies);

  if (!tenancies?.length) {
    console.log("ℹ️ No active tenancies found for user");
    return [];
  }

  // Extract and return the properties from the tenancies
  const properties = tenancies.map(tenancy => tenancy.property);
  console.log("✅ Extracted properties from tenancies:", properties);
  return properties;
}

export async function addProperty(property: PropertyInput) {
  console.log("Adding property:", property);
  const { data, error } = await supabase
    .from("properties")
    .insert(property)
    .select()
    .single();

  if (error) {
    console.error("Error adding property:", error);
    throw error;
  }

  console.log("Added property:", data);
  return data;
}

export async function updateProperty(id: string, updates: Partial<PropertyInput>) {
  console.log("Updating property:", id, updates);
  const { data, error } = await supabase
    .from("properties")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating property:", error);
    throw error;
  }

  console.log("Updated property:", data);
  return data;
}

export async function deleteProperty(id: string) {
  console.log("Deleting property:", id);
  const { error } = await supabase
    .from("properties")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting property:", error);
    throw error;
  }

  console.log("Deleted property:", id);
}