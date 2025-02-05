import { Dialog } from "@/components/ui/dialog";
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

  const { data: properties } = useMaintenanceProperties(userRole!, currentUserId!);
  const { existingRequest, createMutation, updateMutation, isLoading } = useMaintenanceRequest(requestId);

  // Fetch service providers for landlords
  const { data: serviceProviders, isLoading: isLoadingProviders } = useQuery({
    queryKey: ["service-providers"],
    enabled: userRole === "landlord" && open,
    queryFn: async () => {
      console.log("Fetching service providers");
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, first_name, last_name")
        .eq("role", "service_provider");

      if (profilesError) {
        console.error("Error fetching service providers:", profilesError);
        throw profilesError;
      }

      console.log("Fetched service providers:", profiles);
      return profiles.filter(p => p.first_name || p.last_name);
    },
  });

  // Fetch documents for the maintenance request
  const { data: documents, isLoading: isLoadingDocuments } = useQuery({
    queryKey: ["maintenance-documents", requestId],
    enabled: !!requestId && open,
    queryFn: async () => {
      console.log("Fetching documents for maintenance request:", requestId);
      
      const { data: files, error } = await supabase
        .storage
        .from('maintenance-documents')
        .list(requestId);

      if (error) {
        console.error("Error fetching documents:", error);
        throw error;
      }

      console.log("Fetched documents:", files);
      return files;
    }
  });

  const handleUpdateRequest = async (updates: Partial<MaintenanceRequest>) => {
    if (!requestId || !existingRequest) return;

    try {
      const updatedRequest = {
        ...existingRequest,
        ...updates,
        approval_status: updates.approval_status as 'pending' | 'approved' | 'rejected' | null
      };

      console.log("Validating updated request:", updatedRequest);
      const validatedData = validateMaintenanceRequest(updatedRequest);
      
      await updateMutation.mutateAsync({
        ...validatedData,
        id: requestId
      } as MaintenanceRequest);

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

  if (!existingRequest) return null;

  return (
    <MaintenanceRequestModal
      open={open}
      onOpenChange={onOpenChange}
      request={existingRequest}
      onUpdateRequest={handleUpdateRequest}
      documents={documents}
      isLoadingDocuments={isLoadingDocuments}
    />
  );
}