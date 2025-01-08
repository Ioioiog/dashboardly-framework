import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Property } from "@/utils/propertyUtils";
import { TenantInviteForm } from "./TenantInviteForm";
import { createTenantInvitation } from "@/utils/tenantUtils";

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
      const property = properties.find(p => p.id === data.propertyId);
      if (!property) throw new Error("Property not found");

      await createTenantInvitation(data, property.name);

      toast({
        title: "Success",
        description: "Tenant account created and invitation sent successfully.",
      });

      setOpen(false);
    } catch (error) {
      console.error("Error creating tenant account:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create tenant account. Please try again.",
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