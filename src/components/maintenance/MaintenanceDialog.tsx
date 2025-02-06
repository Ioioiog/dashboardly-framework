import { Dialog, DialogContent, DialogDescription } from "@/components/ui/dialog";
import { useMaintenanceRequest } from "./hooks/useMaintenanceRequest";
import { useMaintenanceProperties } from "./hooks/useMaintenanceProperties";
import { useUserRole } from "@/hooks/use-user-role";
import { useAuthState } from "@/hooks/useAuthState";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { validateMaintenanceRequest } from "./utils/validation";
import MaintenanceRequestModal from "./modals/MaintenanceRequestModal";
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

  console.log("MaintenanceDialog - Current user role:", userRole);
  console.log("MaintenanceDialog - Current user ID:", currentUserId);

  const { data: properties } = useMaintenanceProperties(userRole || 'tenant', currentUserId || '');
  const { existingRequest, createMutation, updateMutation, isLoading } = useMaintenanceRequest(requestId);

  const { data: serviceProviders } = useQuery({
    queryKey: ["service-providers"],
    enabled: userRole === "landlord" && open,
    queryFn: async () => {
      console.log("Fetching service providers");
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          console.error("No active session");
          return [];
        }

        const { data: profiles, error: profilesError } = await supabase
          .from("profiles")
          .select("id, first_name, last_name")
          .eq("role", "service_provider");

        if (profilesError) {
          console.error("Error fetching service providers:", profilesError);
          return [];
        }

        return profiles?.filter(p => p.first_name || p.last_name) || [];
      } catch (error) {
        console.error("Error in service providers query:", error);
        return [];
      }
    },
  });

  const { data: documents, isLoading: isLoadingDocuments } = useQuery({
    queryKey: ["maintenance-documents", requestId],
    enabled: !!requestId && open,
    queryFn: async () => {
      try {
        const { data: files, error } = await supabase
          .storage
          .from('maintenance-documents')
          .list(requestId || '');

        if (error) {
          console.error("Error fetching documents:", error);
          return [];
        }

        return files || [];
      } catch (error) {
        console.error("Error in documents query:", error);
        return [];
      }
    }
  });

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

      console.log("Creating new maintenance request with data:", data);
      const validatedData = validateMaintenanceRequest({
        ...data,
        tenant_id: currentUserId,
        status: 'pending'
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
      // Preserve existing values for required fields if not provided in updates
      const updatedRequest = {
        ...existingRequest,
        ...updates,
        title: updates.title || existingRequest.title,
        property_id: updates.property_id || existingRequest.property_id,
        tenant_id: existingRequest.tenant_id
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

      if (updates.is_emergency && !existingRequest.is_emergency) {
        toast({
          title: "Emergency Request",
          description: "This request has been marked as emergency and will be prioritized",
          variant: "destructive"
        });
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

  // Wait for role to be fetched before rendering
  if (!userRole) {
    console.log("MaintenanceDialog - Waiting for user role to be fetched...");
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[800px]">
        <DialogDescription className="sr-only">
          {requestId ? "Edit maintenance request" : "Create new maintenance request"}
        </DialogDescription>
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