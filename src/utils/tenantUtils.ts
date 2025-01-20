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
    // Generate invitation token
    const token = crypto.randomUUID();
    console.log("Generated invitation token:", token);

    // Create invitation record
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
        status: 'pending'
      })
      .select()
      .single();

    if (inviteError) {
      console.error("Error creating invitation:", inviteError);
      throw inviteError;
    }

    console.log("Created invitation:", invitation);

    // Link invitation to property
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

    // Call the send-tenant-invitation edge function
    const { error: functionError } = await supabase.functions.invoke(
      'send-tenant-invitation',
      {
        body: {
          email: data.email,
          propertyId: data.propertyId,
          token: token,
          startDate: data.startDate,
          endDate: data.endDate,
          firstName: data.firstName,
          lastName: data.lastName
        }
      }
    );

    if (functionError) {
      console.error("Error sending invitation email:", functionError);
      throw functionError;
    }

    console.log("Tenant registration completed successfully");
    return { token };
  } catch (error) {
    console.error("Error in tenant registration process:", error);
    throw error;
  }
}