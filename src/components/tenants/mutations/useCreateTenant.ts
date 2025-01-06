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

async function findExistingUser(email: string) {
  console.log("Checking for existing user with email:", email);
  
  const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();

  if (authError) {
    console.error("Error checking existing user:", authError);
    return null;
  }

  const existingUser = users.find(user => user.email === email);
  
  if (existingUser) {
    console.log("Found existing user:", existingUser);
    return existingUser;
  }

  return null;
}

async function createNewUser(email: string) {
  console.log("Creating new user with email:", email);
  
  const tempPassword = Math.random().toString(36).slice(-8);
  const { data: authUser, error: authError } = await supabase.auth.signUp({
    email: email,
    password: tempPassword,
  });

  if (authError) {
    console.error("Error creating auth user:", authError);
    throw authError;
  }

  console.log("Created new auth user:", authUser);
  return authUser.user;
}

async function updateUserProfile(userId: string, data: TenantFormValues) {
  console.log("Updating profile for user:", userId);
  
  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      first_name: data.first_name,
      last_name: data.last_name,
      phone: data.phone,
      email: data.email,
      role: 'tenant'
    })
    .eq("id", userId);

  if (updateError) {
    console.error("Error updating profile:", updateError);
    throw updateError;
  }
}

async function checkExistingTenancy(tenantId: string) {
  console.log("Checking existing tenancy for tenant:", tenantId);
  
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
  console.log("Creating tenancy for tenant:", tenantId);
  
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
    console.log("Starting tenant creation process with data:", data);
    
    // Get current user's ID to verify they own the property
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error("Error getting current user:", userError);
      throw new Error("Failed to verify user authentication");
    }

    // Verify property ownership
    await verifyPropertyOwnership(data.property_id, user.id);

    // Try to find existing user first
    let tenantUser = await findExistingUser(data.email);
    let isNewUser = false;

    if (tenantUser) {
      console.log("Using existing user account");
    } else {
      console.log("Creating new user account");
      tenantUser = await createNewUser(data.email);
      isNewUser = true;
    }

    if (!tenantUser) {
      throw new Error("Failed to create or find tenant user");
    }

    // Update profile
    await updateUserProfile(tenantUser.id, data);

    // Check for existing tenancy
    await checkExistingTenancy(tenantUser.id);

    // Create tenancy relationship
    await createTenancy(tenantUser.id, data);

    console.log("Completed tenant creation process");

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