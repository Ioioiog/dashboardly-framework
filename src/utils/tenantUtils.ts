import { supabase } from "@/integrations/supabase/client";
import { AuthError } from "@supabase/supabase-js";

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
  
  let userId: string;

  try {
    // First check if user exists
    console.log("Checking if user already exists...");
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', data.email)
      .single();

    if (existingUser) {
      console.log("User already exists, using existing user ID:", existingUser.id);
      userId = existingUser.id;
    } else {
      // If user doesn't exist, create new account
      console.log("Creating new user account...");
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: generateTempPassword(),
        options: {
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
            role: 'tenant'
          }
        }
      });

      if (signUpError) {
        console.error("Signup error:", signUpError);
        throw signUpError;
      }

      if (!authData.user) {
        console.error("No user data returned from signup");
        throw new Error("Failed to create user account");
      }

      userId = authData.user.id;
    }

    console.log("Ensuring profile exists...");
    // Ensure profile exists and is up to date
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
    const token = crypto.randomUUID();

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
  } catch (error) {
    console.error("Error in tenant registration process:", error);
    throw error;
  }
}

// Helper function to generate a temporary password
function generateTempPassword() {
  return 'Temp' + Math.random().toString(36).slice(-8) + '!';
}