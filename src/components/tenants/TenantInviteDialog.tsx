"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Property } from "@/utils/propertyUtils";
import { TenantInviteForm } from "./TenantInviteForm";
import { supabase } from "@/integrations/supabase/client";

interface TenantInviteDialogProps {
  properties: Property[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TenantInviteDialog({ properties, open, onOpenChange }: TenantInviteDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      console.log("Creating tenant with data:", data);
      
      // Generate a unique token
      const token = crypto.randomUUID();

      // Insert the invitation
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
        throw new Error(propertyAssignmentError.message);
      }

      toast({
        title: "Success",
        description: "Tenant created successfully.",
      });

      onOpenChange(false);
    } catch (error) {
      console.error("Error creating tenant:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create tenant. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Tenant Account</DialogTitle>
        </DialogHeader>
        <TenantInviteForm 
          properties={properties}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
}