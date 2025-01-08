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
    // First check if user exists in auth.users by trying to sign in
    console.log("Checking if user exists in auth system...");
    const { data: authUser, error: signInError } = await supabase.auth.signInWithOtp({
      email: data.email,
      options: {
        shouldCreateUser: false // Only check if user exists
      }
    });

    if (signInError && !signInError.message.includes("Email not confirmed")) {
      // User doesn't exist in auth system, create new account
      console.log("User doesn't exist, creating new account...");
      const { data: newUser, error: signUpError } = await supabase.auth.signUp({
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
        console.error("Error creating new user:", signUpError);
        throw signUpError;
      }

      if (!newUser?.user) {
        throw new Error("Failed to create user account");
      }

      userId = newUser.user.id;
    } else {
      // User exists, try to get their profile
      console.log("User exists in auth system, fetching profile...");
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', data.email)
        .maybeSingle(); // Use maybeSingle instead of single to handle no results

      if (profile) {
        console.log("Found existing profile:", profile);
        userId = profile.id;
      } else {
        // This case handles when user exists in auth but not in profiles
        console.log("No profile found for existing user, creating one...");
        const { data: authData } = await supabase.auth.getUser();
        if (!authData?.user) {
          throw new Error("Could not retrieve user data");
        }
        userId = authData.user.id;
      }
    }

    console.log("Updating/creating profile...");
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

    console.log("Creating invitation record...");
    const token = crypto.randomUUID();
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