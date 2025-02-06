import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useMaintenanceRequest } from "./hooks/useMaintenanceRequest";
import { useMaintenanceProperties } from "./hooks/useMaintenanceProperties";
import { useMaintenanceServiceProviders } from "./hooks/useMaintenanceServiceProviders";
import { useMaintenanceDocuments } from "./hooks/useMaintenanceDocuments";
import { useUserRole } from "@/hooks/use-user-role";
import { useAuthState } from "@/hooks/useAuthState";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { validateMaintenanceRequest } from "./utils/validation";
import MaintenanceRequestModal from "./modals/MaintenanceRequestModal";
import { MaintenanceDialogLoading } from "./components/MaintenanceDialogLoading";
import type { MaintenanceRequest } from "./hooks/useMaintenanceRequest";

interface MaintenanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requestId?: string;
}

export function MaintenanceDialog({
  open,
  onOpenChange,
  requestId,
}: MaintenanceDialogProps) {
  const { userRole } = useUserRole();
  const { currentUserId } = useAuthState();
  const { toast } = useToast();

  console.log("MaintenanceDialog - Initializing with:", {
    userRole,
    currentUserId,
    requestId,
    isOpen: open
  });

  const { data: properties, isLoading: isLoadingProperties } = useMaintenanceProperties(
    userRole || 'tenant',
    currentUserId || ''
  );

  const { existingRequest, createMutation, updateMutation, isLoading: isLoadingRequest } = useMaintenanceRequest(requestId);
  
  const { data: serviceProviders, isLoading: isLoadingProviders } = useMaintenanceServiceProviders(
    userRole === "landlord" && open
  );

  const { data: documents, isLoading: isLoadingDocuments } = useMaintenanceDocuments(requestId, open);

  const handleCreateRequest = async (data: Partial<MaintenanceRequest>) => {
    if (!currentUserId) {
      toast({
        title: "Error",
        description: "You must be logged in to create a request",
        variant: "destructive"
      });
      return;
    }

    try {
      if (!data.title || !data.property_id) {
        toast({
          title: "Error",
          description: "Please fill in all required fields",
          variant: "destructive"
        });
        return;
      }

      console.log("Creating maintenance request with data:", {
        ...data,
        tenant_id: currentUserId
      });

      const validatedData = validateMaintenanceRequest({
        ...data,
        tenant_id: currentUserId,
        status: 'pending',
        contact_phone: data.contact_phone || null // Ensure contact_phone is included
      });
      
      await createMutation.mutateAsync(validatedData as MaintenanceRequest);

      toast({
        title: "Success",
        description: "Maintenance request created successfully",
      });

      onOpenChange(false);
    } catch (error) {
      console.error("Error creating request:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create request",
        variant: "destructive"
      });
    }
  };

  const handleUpdateRequest = async (updates: Partial<MaintenanceRequest>) => {
    if (!requestId || !existingRequest) return;

    try {
      const updatedRequest = {
        ...existingRequest,
        ...updates,
        title: updates.title || existingRequest.title,
        property_id: updates.property_id || existingRequest.property_id,
        tenant_id: existingRequest.tenant_id,
        contact_phone: updates.contact_phone || existingRequest.contact_phone,
        preferred_times: updates.preferred_times || existingRequest.preferred_times || []
      };

      console.log("Validating updated request:", updatedRequest);
      const validatedData = validateMaintenanceRequest(updatedRequest);
      
      await updateMutation.mutateAsync({
        ...validatedData,
        id: requestId
      } as MaintenanceRequest);

      if (updates.status && updates.status !== existingRequest.status) {
        const notificationResponse = await supabase.functions.invoke('send-maintenance-notification', {
          body: { requestId, type: 'status_update' }
        });

        if (notificationResponse.error) {
          console.error('Error sending notification:', notificationResponse.error);
        }
      }

      toast({
        title: "Success",
        description: "Maintenance request updated successfully",
      });
    } catch (error) {
      console.error("Error updating request:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update request",
        variant: "destructive"
      });
    }
  };

  if (!userRole || !currentUserId) {
    return <MaintenanceDialogLoading />;
  }

  if (isLoadingProperties || isLoadingRequest || (userRole === "landlord" && isLoadingProviders)) {
    return <MaintenanceDialogLoading />;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[800px] bg-background">
        <DialogTitle className="text-lg font-semibold">
          {requestId ? "Edit Maintenance Request" : "Create New Maintenance Request"}
        </DialogTitle>
        <MaintenanceRequestModal
          open={open}
          onOpenChange={onOpenChange}
          request={existingRequest}
          onUpdateRequest={requestId ? handleUpdateRequest : handleCreateRequest}
          documents={documents || []}
          isLoadingDocuments={isLoadingDocuments}
          properties={properties || []}
          userRole={userRole}
          isNew={!requestId}
        />
      </DialogContent>
    </Dialog>
  );
}