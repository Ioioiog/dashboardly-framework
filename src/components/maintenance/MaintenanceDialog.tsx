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

  // Transform the existing request data to match the form values type
  const transformedRequest = existingRequest
    ? {
        ...existingRequest,
        scheduled_date: existingRequest.scheduled_date
          ? new Date(existingRequest.scheduled_date)
          : undefined,
      }
    : undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] w-[1400px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {requestId ? "Edit Maintenance Request" : "New Maintenance Request"}
          </DialogTitle>
        </DialogHeader>
        <MaintenanceRequestForm
          properties={properties || []}
          serviceProviders={serviceProviders || []}
          existingRequest={transformedRequest}
          onSubmit={async (data) => {
            // Add tenant_id to the form data
            const formDataWithTenant = {
              ...data,
              tenant_id: currentUserId,
              // Convert Date object back to ISO string for the database
              scheduled_date: data.scheduled_date?.toISOString(),
            };
            
            if (requestId) {
              await updateMutation.mutateAsync(formDataWithTenant);
            } else {
              await createMutation.mutateAsync(formDataWithTenant);
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