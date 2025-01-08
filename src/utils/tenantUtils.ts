import { supabase } from "@/integrations/supabase/client";

interface TenantRegistrationData {
  email: string;
  firstName: string;
  lastName: string;
  propertyId: string;
  startDate: string;
  endDate?: string;
}

export async function registerTenant(data: TenantRegistrationData) {
  console.log("Starting tenant registration process for:", data.email);
  
  // First check if user exists by trying to sign them up
  console.log("Attempting to create new user account...");
  const { data: authData, error: signUpError } = await supabase.auth.signUp({
    email: data.email,
    password: generateTempPassword(), // Generate a temporary password
    options: {
      data: {
        first_name: data.firstName,
        last_name: data.lastName,
        role: 'tenant'
      }
    }
  });

  let userId: string;

  if (signUpError) {
    if (signUpError.message === "User already registered") {
      console.log("User already exists, fetching existing user data...");
      // If user exists, we'll get their profile from our profiles table
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", data.email)
        .single();

      if (profileError) throw new Error("Failed to fetch existing user profile");
      if (!profileData) throw new Error("User profile not found");
      
      userId = profileData.id;
    } else {
      // If it's any other error, throw it
      throw signUpError;
    }
  } else {
    if (!authData.user) throw new Error("Failed to create user account");
    userId = authData.user.id;
  }

  console.log("User ID obtained:", userId);

  // Ensure profile exists
  const { error: profileError } = await supabase
    .from("profiles")
    .upsert({
      id: userId,
      email: data.email,
      first_name: data.firstName,
      last_name: data.lastName,
      role: 'tenant'
    });

  if (profileError) {
    console.error("Error updating profile:", profileError);
    throw profileError;
  }

  // Generate invitation token
  const token = Math.random().toString(36).substring(2, 15);

  console.log("Creating invitation record...");
  // Create invitation record
  const { error: inviteError } = await supabase
    .from("tenant_invitations")
    .insert({
      email: data.email,
      first_name: data.firstName,
      last_name: data.lastName,
      property_id: data.propertyId,
      token,
      start_date: data.startDate,
      end_date: data.endDate || null,
    });

  if (inviteError) {
    console.error("Error creating invitation:", inviteError);
    throw inviteError;
  }

  console.log("Creating tenancy record...");
  // Create tenancy record
  const { error: tenancyError } = await supabase
    .from("tenancies")
    .insert({
      property_id: data.propertyId,
      tenant_id: userId,
      start_date: data.startDate,
      end_date: data.endDate || null,
      status: "active",
    });

  if (tenancyError) {
    console.error("Error creating tenancy:", tenancyError);
    throw tenancyError;
  }

  console.log("Tenant registration completed successfully");
  return { userId, token };
}

// Helper function to generate a temporary password
function generateTempPassword() {
  return 'Temp' + Math.random().toString(36).slice(-8) + '!';
}