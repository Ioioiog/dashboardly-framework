import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Property } from "@/utils/propertyUtils";
import { TenantInviteForm } from "./TenantInviteForm";
import { TenantInviteConfirmDialog } from "./TenantInviteConfirmDialog";
import { useInvitation } from "@/hooks/useInvitation";
import { tenantAuditService } from "@/services/tenantAuditService";
import { supabase } from "@/integrations/supabase/client";

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
    handleSubmit: originalHandleSubmit,
    handleResendConfirm: originalHandleResendConfirm,
  } = useInvitation();

  const handleSubmit = async (data: any) => {
    const success = await originalHandleSubmit(data);
    if (success) {
      // Get current user (landlord) ID
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await tenantAuditService.logTenantAction({
          action_type: 'invitation_sent',
          landlord_id: user.id,
          tenant_email: data.email,
          property_ids: data.propertyIds,
          metadata: {
            first_name: data.firstName,
            last_name: data.lastName,
            start_date: data.startDate,
            end_date: data.endDate
          }
        });
      }
      onOpenChange(false);
    }
  };

  const handleResendConfirm = async () => {
    const success = await originalHandleResendConfirm();
    if (success) {
      // Get current user (landlord) ID
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await tenantAuditService.logTenantAction({
          action_type: 'invitation_resent',
          landlord_id: user.id,
          tenant_email: existingInvitation?.email,
          property_ids: existingInvitation?.propertyIds || [],
          metadata: {
            first_name: existingInvitation?.firstName,
            last_name: existingInvitation?.lastName,
            start_date: existingInvitation?.startDate,
            end_date: existingInvitation?.endDate
          }
        });
      }
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
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            defaultValues={existingInvitation}
          />
        </DialogContent>
      </Dialog>

      <TenantInviteConfirmDialog
        open={showResendConfirm}
        onOpenChange={setShowResendConfirm}
        onConfirm={handleResendConfirm}
      />
    </>
  );
}