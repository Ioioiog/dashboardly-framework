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
  
  try {
    // First, check if the user already exists by trying to get their profile
    console.log("Checking if user exists in profiles...");
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', data.email)
      .maybeSingle();

    let userId: string;

    if (existingProfile) {
      console.log("User profile already exists, using existing ID:", existingProfile.id);
      userId = existingProfile.id;
    } else {
      // Try to get the user from auth.users
      console.log("Checking auth system for existing user...");
      const { data: session } = await supabase.auth.signInWithOtp({
        email: data.email,
        options: {
          shouldCreateUser: false
        }
      });

      if (session) {
        console.log("User exists in auth system but no profile, creating profile...");
        const { data: authData } = await supabase.auth.getUser();
        if (!authData?.user) {
          throw new Error("Could not retrieve user data");
        }
        userId = authData.user.id;
      } else {
        // User doesn't exist at all, create new account
        console.log("User doesn't exist, creating new account...");
        const tempPassword = generateTempPassword();
        const { data: newUser, error: signUpError } = await supabase.auth.signUp({
          email: data.email,
          password: tempPassword,
          options: {
            data: {
              first_name: data.firstName,
              last_name: data.lastName,
              role: 'tenant'
            }
          }
        });

        if (signUpError) {
          if (signUpError.message.includes("User already registered")) {
            console.log("User exists but failed to get session, trying to get user data...");
            const { data: existingUser } = await supabase.auth.getUser();
            if (!existingUser?.user) {
              throw new Error("Could not retrieve existing user data");
            }
            userId = existingUser.user.id;
          } else {
            console.error("Error creating new user:", signUpError);
            throw signUpError;
          }
        } else if (!newUser?.user) {
          throw new Error("Failed to create user account");
        } else {
          userId = newUser.user.id;
        }
      }
    }

    // Generate invitation token
    const token = crypto.randomUUID();

    // Create invitation record FIRST
    console.log("Creating invitation record...");
    const { data: invitation, error: inviteError } = await supabase
      .from("tenant_invitations")
      .insert({
        email: data.email,
        first_name: data.firstName,
        last_name: data.lastName,
        token,
        start_date: data.startDate,
        end_date: data.endDate || null,
      })
      .select()
      .single();

    if (inviteError || !invitation) {
      console.error("Error creating invitation:", inviteError);
      throw inviteError;
    }

    // Set the token in the database context
    console.log("Setting token in database context");
    await supabase.rpc('set_claim', {
      params: { value: token }
    });

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

    // Link invitation to property using the invitation.id we just created
    console.log("Creating property assignment...");
    const { error: propertyError } = await supabase
      .from("tenant_invitation_properties")
      .insert({
        invitation_id: invitation.id,
        property_id: data.propertyId,
      });

    if (propertyError) {
      console.error("Error creating property assignment:", propertyError);
      throw propertyError;
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