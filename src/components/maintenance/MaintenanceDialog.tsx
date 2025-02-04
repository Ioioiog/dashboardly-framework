import { useEffect } from "react";
import { Dialog } from "@/components/ui/dialog";
import { useMaintenanceRequest } from "./hooks/useMaintenanceRequest";
import { useMaintenanceProperties } from "./hooks/useMaintenanceProperties";
import { useUserRole } from "@/hooks/use-user-role";
import { useAuthState } from "@/hooks/useAuthState";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { validateMaintenanceRequest } from "./utils/validation";
import { NewRequestModal } from "./modals/NewRequestModal";
import { ActiveRequestModal } from "./modals/ActiveRequestModal";
import { ReviewCompleteModal } from "./modals/ReviewCompleteModal";
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

  const handleUpdateRequest = async (updates: Partial<MaintenanceRequest>) => {
    if (!requestId || !existingRequest) return;

    try {
      const updatedRequest = {
        ...existingRequest,
        ...updates
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

  const getModalComponent = () => {
    if (userRole !== "landlord") return null;

    switch (existingRequest.status) {
      case "pending":
        return (
          <NewRequestModal
            open={open}
            onOpenChange={onOpenChange}
            request={existingRequest}
            onUpdateRequest={handleUpdateRequest}
          />
        );
      case "in_progress":
        return (
          <ActiveRequestModal
            open={open}
            onOpenChange={onOpenChange}
            request={existingRequest}
            onUpdateRequest={handleUpdateRequest}
          />
        );
      case "completed":
      case "cancelled":
        return (
          <ReviewCompleteModal
            open={open}
            onOpenChange={onOpenChange}
            request={existingRequest}
            onUpdateRequest={handleUpdateRequest}
          />
        );
      default:
        return null;
    }
  };

  return getModalComponent();
}