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
    console.log("No user ID provided for fetchTenantProperties");
    return [];
  }

  console.log("🔍 Fetching tenant properties for user:", userId);
  
  // First, let's check the tenancies for this user
  const { data: tenancies, error: tenancyError } = await supabase
    .from("tenancies")
    .select("id, status, property_id")
    .eq("tenant_id", userId);

  if (tenancyError) {
    console.error("❌ Error fetching tenancies:", tenancyError);
    throw tenancyError;
  }

  console.log("📋 Found tenancies:", tenancies);

  if (!tenancies || tenancies.length === 0) {
    console.log("ℹ️ No tenancies found for user");
    return [];
  }

  // Now fetch the properties for these tenancies
  const { data: properties, error: propertyError } = await supabase
    .from("properties")
    .select(`
      id,
      name,
      address,
      monthly_rent,
      type,
      description,
      available_from
    `)
    .in("id", tenancies.map(t => t.property_id));

  if (propertyError) {
    console.error("❌ Error fetching properties:", propertyError);
    throw propertyError;
  }

  console.log("🏠 Fetched tenant properties:", properties);
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