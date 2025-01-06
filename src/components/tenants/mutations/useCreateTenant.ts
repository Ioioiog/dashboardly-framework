import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { TenantFormValues } from "../TenantFormSchema";

export async function verifyPropertyOwnership(propertyId: string, userId: string) {
  const { data: property, error: propertyError } = await supabase
    .from("properties")
    .select("landlord_id")
    .eq("id", propertyId)
    .single();

  if (propertyError) {
    console.error("Error verifying property ownership:", propertyError);
    throw new Error("Failed to verify property ownership");
  }

  if (property.landlord_id !== userId) {
    console.error("User does not own this property");
    throw new Error("You can only assign tenants to properties you own");
  }
}

async function findOrCreateTenant(data: TenantFormValues) {
  // First try to find the tenant by email
  const { data: existingProfile, error: profileError } = await supabase
    .from("profiles")
    .select("id, role, email")
    .eq("email", data.email)
    .maybeSingle();

  if (profileError) {
    console.error("Error checking existing profile:", profileError);
    throw profileError;
  }

  if (existingProfile) {
    console.log("Found existing profile:", existingProfile);
    if (existingProfile.role !== 'tenant') {
      throw new Error("This user exists but is not a tenant");
    }
    return { tenantId: existingProfile.id, isNewUser: false };
  }

  // Create new user if they don't exist
  const { data: authUser, error: authError } = await supabase.auth.signUp({
    email: data.email,
    password: Math.random().toString(36).slice(-8),
  });

  if (authError) {
    console.error("Error creating auth user:", authError);
    throw authError;
  }

  console.log("Created new auth user:", authUser);

  // Update profile for the new tenant
  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      first_name: data.first_name,
      last_name: data.last_name,
      phone: data.phone,
      email: data.email,
      role: 'tenant'
    })
    .eq("id", authUser.user!.id);

  if (updateError) {
    console.error("Error updating profile:", updateError);
    throw updateError;
  }

  return { tenantId: authUser.user!.id, isNewUser: true };
}

async function checkExistingTenancy(tenantId: string) {
  const { data: existingTenancy, error: tenancyError } = await supabase
    .from("tenancies")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("status", "active")
    .maybeSingle();

  if (tenancyError) {
    console.error("Error checking existing tenancy:", tenancyError);
    throw tenancyError;
  }

  if (existingTenancy) {
    throw new Error("This tenant already has an active tenancy");
  }
}

async function createTenancy(tenantId: string, data: TenantFormValues) {
  const { error: tenancyError } = await supabase
    .from("tenancies")
    .insert({
      tenant_id: tenantId,
      property_id: data.property_id,
      start_date: data.start_date,
      end_date: data.end_date || null,
      status: 'active'
    });

  if (tenancyError) {
    console.error("Error creating tenancy:", tenancyError);
    throw tenancyError;
  }
}

export function useCreateTenant() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createTenant = async (data: TenantFormValues) => {
    console.log("Creating new tenant with data:", data);
    
    // Get current user's ID to verify they own the property
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error("Error getting current user:", userError);
      throw new Error("Failed to verify user authentication");
    }

    // Verify property ownership
    await verifyPropertyOwnership(data.property_id, user.id);

    // Find or create tenant
    const { tenantId, isNewUser } = await findOrCreateTenant(data);

    // Check for existing tenancy
    await checkExistingTenancy(tenantId);

    // Create tenancy relationship
    await createTenancy(tenantId, data);

    console.log("Created tenancy for user:", tenantId);

    queryClient.invalidateQueries({ queryKey: ["tenants"] });
    toast({
      title: "Success",
      description: isNewUser 
        ? "Tenant added successfully. They will receive an email to set their password."
        : "Tenant assigned successfully",
    });
  };

  return createTenant;
}