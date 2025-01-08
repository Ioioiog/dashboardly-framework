import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Property } from "@/utils/propertyUtils";
import { TenantInviteForm } from "./TenantInviteForm";
import { supabase } from "@/integrations/supabase/client";

interface TenantInviteDialogProps {
  properties: Property[];
}

export function TenantInviteDialog({ properties }: TenantInviteDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      console.log("Creating tenant invitation with data:", data);
      
      const property = properties.find(p => p.id === data.propertyId);
      if (!property) {
        throw new Error("Property not found");
      }

      // Generate a unique token
      const token = crypto.randomUUID();

      // Insert the invitation
      const { error: invitationError } = await supabase
        .from('tenant_invitations')
        .insert({
          email: data.email,
          first_name: data.firstName,
          last_name: data.lastName,
          property_id: data.propertyId,
          token: token,
          start_date: data.startDate,
          end_date: data.endDate || null,
        });

      if (invitationError) {
        console.error("Error creating invitation:", invitationError);
        throw new Error(invitationError.message);
      }

      toast({
        title: "Success",
        description: "Tenant invitation sent successfully.",
      });

      setOpen(false);
    } catch (error) {
      console.error("Error creating tenant invitation:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create tenant invitation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Invite Tenant</Button>
      </DialogTrigger>
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