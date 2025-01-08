import { supabase } from "@/integrations/supabase/client";
import { TenantFormValues } from "@/components/tenants/TenantInviteForm";

export async function createTenantInvitation(data: TenantFormValues, propertyName: string) {
  console.log("Checking if user exists...");
  const { data: existingUser } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', data.email)
    .single();

  let userId: string;

  if (existingUser) {
    console.log("User already exists, using existing account");
    userId = existingUser.id;
  } else {
    console.log("Creating new user account...");
    const { data: authData, error: authError } = await supabase.auth.signUp({
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

    if (authError) throw authError;
    if (!authData.user) throw new Error("Failed to create user account");
    
    userId = authData.user.id;
  }

  // Generate a unique token for the invitation
  const token = crypto.randomUUID();

  // Create the invitation record
  const { error: inviteError } = await supabase
    .from("tenant_invitations")
    .insert({
      email: data.email,
      first_name: data.firstName,
      last_name: data.lastName,
      property_id: data.propertyId,
      token,
      start_date: data.startDate,
      end_date: data.endDate,
    });

  if (inviteError) throw inviteError;

  // Send welcome email with login instructions
  const { error: emailError } = await supabase.functions.invoke("send-tenant-welcome", {
    body: {
      email: data.email,
      firstName: data.firstName,
      propertyName,
      temporaryPassword: "Schimba1!"
    },
  });

  if (emailError) throw emailError;
}