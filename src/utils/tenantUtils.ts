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

    if (signUpError) {
      // Check specifically for user_already_exists error
      if ((signUpError as AuthError).message.includes("User already registered")) {
        console.log("User already exists, fetching existing user data...");
        // If user exists, we'll get their profile from our profiles table
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("id")
          .eq("email", data.email)
          .single();

        if (profileError) {
          console.error("Profile fetch error:", profileError);
          throw new Error("Failed to fetch existing user profile");
        }
        if (!profileData) {
          console.error("No profile found for email:", data.email);
          throw new Error("User profile not found");
        }
        
        userId = profileData.id;
      } else {
        // If it's any other error, throw it
        console.error("Signup error:", signUpError);
        throw signUpError;
      }
    } else {
      if (!authData.user) {
        console.error("No user data returned from signup");
        throw new Error("Failed to create user account");
      }
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