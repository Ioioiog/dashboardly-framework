import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Property } from "@/utils/propertyUtils";
import { TenantInviteForm } from "./TenantInviteForm";
import { TenantInviteConfirmDialog } from "./TenantInviteConfirmDialog";
import { useInvitation } from "@/hooks/useInvitation";

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
  const {
    isSubmitting,
    showResendConfirm,
    setShowResendConfirm,
    handleSubmit,
    handleResendConfirm,
  } = useInvitation();

  const onSubmit = async (data: any) => {
    const success = await handleSubmit(data);
    if (success) {
      onOpenChange(false);
    }
  };

  const onResendConfirm = async () => {
    const success = await handleResendConfirm();
    if (success) {
      onOpenChange(false);
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
            onSubmit={onSubmit}
            isSubmitting={isSubmitting}
            defaultValues={existingInvitation}
          />
        </DialogContent>
      </Dialog>

      <TenantInviteConfirmDialog
        open={showResendConfirm}
        onOpenChange={setShowResendConfirm}
        onConfirm={onResendConfirm}
      />
    </>
  );
}