"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Property } from "@/utils/propertyUtils";
import { TenantInviteForm } from "./TenantInviteForm";
import { supabase } from "@/integrations/supabase/client";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface TenantInviteDialogProps {
  properties: Property[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingInvitation?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    propertyIds: string[];
    startDate: string;
    endDate?: string;
  };
}

export function TenantInviteDialog({ 
  properties, 
  open, 
  onOpenChange, 
  existingInvitation 
}: TenantInviteDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResendConfirm, setShowResendConfirm] = useState(false);
  const [resendData, setResendData] = useState<any>(null);

  const checkExistingInvitation = async (email: string) => {
    console.log("Checking for existing invitation for email:", email);
    
    try {
      const { data: existingInvites, error } = await supabase
        .from('tenant_invitations')
        .select('*')
        .eq('email', email)
        .eq('status', 'pending')
        .eq('used', false)
        .gt('expiration_date', new Date().toISOString())
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error("Error checking existing invitations:", error);
        throw new Error("Failed to check existing invitations");
      }

      return existingInvites;
    } catch (error) {
      console.error("Error in checkExistingInvitation:", error);
      throw new Error("Failed to check existing invitations");
    }
  };

  const handleResendConfirm = async () => {
    console.log("Confirming resend for data:", resendData);
    setShowResendConfirm(false);
    await handleSubmit(resendData);
  };

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      console.log("Creating tenant with data:", data);
      
      // Check for existing invitation if this is a new invite
      if (!existingInvitation) {
        const existingInvite = await checkExistingInvitation(data.email);
        if (existingInvite) {
          setResendData({ ...existingInvite, resend: true });
          setShowResendConfirm(true);
          setIsSubmitting(false);
          return;
        }
      }

      // Generate a unique token
      const token = crypto.randomUUID();

      if (existingInvitation || data.resend) {
        console.log("Resending invitation for:", data.email);
        
        // Update the existing invitation with a new token and reset expiration
        const { error: updateError } = await supabase
          .from('tenant_invitations')
          .update({
            token: token,
            expiration_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'pending',
            used: false
          })
          .eq('id', existingInvitation?.id || data.id);

        if (updateError) {
          console.error("Error updating invitation:", updateError);
          throw new Error(updateError.message);
        }
      } else {
        // Check for duplicate email in profiles
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', data.email)
          .maybeSingle();

        if (existingProfile) {
          throw new Error("A user with this email already exists");
        }

        // Insert new invitation
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
          throw new Error(invitationError.message);
        }

        // Insert property assignments
        const propertyAssignments = data.propertyIds.map((propertyId: string) => ({
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
      }

      // Get property details for the email
      const { data: propertyDetails, error: propertyError } = await supabase
        .from('properties')
        .select('name, address')
        .in('id', data.propertyIds);

      if (propertyError) {
        console.error("Error fetching property details:", propertyError);
        throw new Error("Failed to fetch property details");
      }

      // Send invitation email
      const { error: emailError } = await supabase.functions.invoke(
        'send-tenant-invitation',
        {
          body: {
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName,
            propertyIds: data.propertyIds,
            properties: propertyDetails,
            token: token,
            startDate: data.startDate,
            endDate: data.endDate
          }
        }
      );

      if (emailError) {
        console.error("Error sending invitation email:", emailError);
        throw new Error("Failed to send invitation email");
      }

      toast({
        title: "Success",
        description: existingInvitation || data.resend
          ? "Invitation resent successfully."
          : "Tenant invitation sent successfully.",
      });

      onOpenChange(false);
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      toast({
        title: "Error",
        description: error instanceof Error 
          ? error.message 
          : "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {existingInvitation ? "Resend Invitation" : "Create Tenant Account"}
            </DialogTitle>
          </DialogHeader>
          <TenantInviteForm 
            properties={properties}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            defaultValues={existingInvitation}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={showResendConfirm} onOpenChange={setShowResendConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Resend Invitation?</AlertDialogTitle>
            <AlertDialogDescription>
              An active invitation already exists for this email address. Would you like to resend it with a new expiration date?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleResendConfirm}>
              Resend Invitation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}