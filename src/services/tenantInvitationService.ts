import { supabase } from "@/integrations/supabase/client";

interface InvitationData {
  email: string;
  firstName: string;
  lastName: string;
  propertyIds: string[];
  startDate: string;
  endDate?: string;
}

export const tenantInvitationService = {
  async checkExistingInvitation(email: string) {
    console.log("Checking for existing invitation for email:", email);
    
    try {
      const { data: existingInvites, error } = await supabase
        .from('tenant_invitations')
        .select('*')
        .eq('email', email)
        .eq('status', 'pending')
        .eq('used', false)
        .gt('expiration_date', new Date().toISOString())
        .maybeSingle();  // Changed from .single() to .maybeSingle()

      if (error) {
        console.error("Error checking existing invitations:", { message: error.message, details: error.details, hint: error.hint, code: error.code });
        throw new Error("Failed to check existing invitations");
      }

      return existingInvites;
    } catch (error) {
      console.error("Error in checkExistingInvitation:", error);
      throw error;
    }
  },

  async createInvitation(data: InvitationData) {
    console.log("Creating new invitation for:", data.email);
    
    try {
      // Check for duplicate email in profiles
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', data.email)
        .maybeSingle();  // Using maybeSingle() here as well for consistency

      if (existingProfile) {
        throw new Error("A user with this email already exists");
      }

      // Generate token
      const token = crypto.randomUUID();

      // Insert invitation
      const { data: invitation, error: invitationError } = await supabase
        .from('tenant_invitations')
        .insert({
          email: data.email,
          first_name: data.firstName,
          last_name: data.lastName,
          token: token,
          start_date: data.startDate,
          end_date: data.endDate || null,
        })
        .select()
        .single();

      if (invitationError) {
        console.error("Error creating invitation:", invitationError);
        throw invitationError;
      }

      // Insert property assignments
      const propertyAssignments = data.propertyIds.map(propertyId => ({
        invitation_id: invitation.id,
        property_id: propertyId,
      }));

      const { error: propertyAssignmentError } = await supabase
        .from('tenant_invitation_properties')
        .insert(propertyAssignments);

      if (propertyAssignmentError) {
        console.error("Error assigning properties:", propertyAssignmentError);
        throw new Error("Failed to assign properties to invitation");
      }

      return { invitation, token };
    } catch (error) {
      console.error("Error in createInvitation:", error);
      throw error;
    }
  },

  async resendInvitation(invitationId: string) {
    console.log("Resending invitation:", invitationId);
    
    try {
      const token = crypto.randomUUID();
      
      const { error: updateError } = await supabase
        .from('tenant_invitations')
        .update({
          token: token,
          expiration_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'pending',
          used: false
        })
        .eq('id', invitationId);

      if (updateError) {
        console.error("Error updating invitation:", updateError);
        throw updateError;
      }

      return token;
    } catch (error) {
      console.error("Error in resendInvitation:", error);
      throw error;
    }
  },

  async sendInvitationEmail(data: {
    email: string;
    firstName: string;
    lastName: string;
    propertyIds: string[];
    token: string;
    startDate: string;
    endDate?: string;
  }) {
    console.log("Sending invitation email to:", data.email);
    
    try {
      const { data: propertyDetails, error: propertyError } = await supabase
        .from('properties')
        .select('name, address')
        .in('id', data.propertyIds);

      if (propertyError) {
        console.error("Error fetching property details:", propertyError);
        throw propertyError;
      }

      const { error: emailError } = await supabase.functions.invoke(
        'send-tenant-invitation',
        {
          body: {
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName,
            propertyIds: data.propertyIds,
            properties: propertyDetails,
            token: data.token,
            startDate: data.startDate,
            endDate: data.endDate
          }
        }
      );

      if (emailError) {
        console.error("Error sending invitation email:", emailError);
        throw emailError;
      }
    } catch (error) {
      console.error("Error in sendInvitationEmail:", error);
      throw error;
    }
  }
};