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