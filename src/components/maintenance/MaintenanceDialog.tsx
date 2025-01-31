import { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useMaintenanceRequest } from "../maintenance/hooks/useMaintenanceRequest";
import { useMaintenanceProperties } from "../maintenance/hooks/useMaintenanceProperties";
import { MaintenanceRequestForm } from "./forms/MaintenanceRequestForm";
import { useUserRole } from "@/hooks/use-user-role";
import { useAuthState } from "@/hooks/useAuthState";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface MaintenanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requestId?: string;
}

export default function MaintenanceDialog({
  open,
  onOpenChange,
  requestId,
}: MaintenanceDialogProps) {
  const { userRole } = useUserRole();
  const { currentUserId } = useAuthState();
  const queryClient = useQueryClient();

  const { data: properties } = useMaintenanceProperties(userRole!, currentUserId!);
  const { existingRequest, createMutation, updateMutation } = useMaintenanceRequest(requestId);

  // Add service providers query with automatic refresh after creation
  const { data: serviceProviders } = useQuery({
    queryKey: ["service-providers"],
    enabled: userRole === "landlord",
    queryFn: async () => {
      console.log("Fetching service providers");
      const { data, error } = await supabase
        .from("profiles")
        .select("id, first_name, last_name")
        .eq("role", "service_provider");

      if (error) {
        console.error("Error fetching service providers:", error);
        throw error;
      }

      console.log("Fetched service providers:", data);
      return data;
    },
  });

  // Refresh service providers list when dialog opens
  useEffect(() => {
    if (open && userRole === "landlord") {
      queryClient.invalidateQueries({ queryKey: ["service-providers"] });
    }
  }, [open, userRole, queryClient]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {requestId ? "Edit Maintenance Request" : "New Maintenance Request"}
          </DialogTitle>
        </DialogHeader>
        <MaintenanceRequestForm
          properties={properties || []}
          serviceProviders={serviceProviders || []}
          existingRequest={existingRequest}
          onSubmit={async (data) => {
            if (requestId) {
              await updateMutation.mutateAsync(data);
            } else {
              await createMutation.mutateAsync(data);
            }
            onOpenChange(false);
          }}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
          userRole={userRole!}
        />
      </DialogContent>
    </Dialog>
  );
}