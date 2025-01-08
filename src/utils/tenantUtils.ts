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
  // First check if user exists in auth
  const { data: userData, error: userError } = await supabase.auth.admin.getUserByEmail(data.email);
  
  let userId: string;
  
  if (userError) {
    // User doesn't exist, create new account
    console.log("Creating new user account...");
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: data.email,
      password: "Schimba1!", // Default password
      options: {
        data: {
          first_name: data.firstName,
          last_name: data.lastName,
          role: 'tenant'
        }
      }
    });

    if (signUpError) throw signUpError;
    if (!authData.user) throw new Error("Failed to create user account");
    
    userId = authData.user.id;
  } else {
    userId = userData.user.id;
  }

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

  if (profileError) throw profileError;

  // Generate invitation token
  const token = Math.random().toString(36).substring(2, 15);

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

  if (inviteError) throw inviteError;

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

  if (tenancyError) throw tenancyError;

  return { userId, token };
}