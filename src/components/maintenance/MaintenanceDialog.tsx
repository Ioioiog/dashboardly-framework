import { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useMaintenanceRequest } from "../maintenance/hooks/useMaintenanceRequest";
import { useMaintenanceProperties } from "../maintenance/hooks/useMaintenanceProperties";
import { MaintenanceRequestForm } from "./forms/MaintenanceRequestForm";
import { useUserRole } from "@/hooks/use-user-role";
import { useAuthState } from "@/hooks/useAuthState";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { validateMaintenanceRequest } from "./utils/validation";

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
  const { toast } = useToast();

  const { data: properties } = useMaintenanceProperties(userRole!, currentUserId!);
  const { existingRequest, createMutation, updateMutation } = useMaintenanceRequest(requestId);

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

  useEffect(() => {
    if (open && userRole === "landlord") {
      queryClient.invalidateQueries({ queryKey: ["service-providers"] });
    }
  }, [open, userRole, queryClient]);

  const transformedRequest = existingRequest
    ? {
        ...existingRequest,
        scheduled_date: existingRequest.scheduled_date
          ? new Date(existingRequest.scheduled_date)
          : undefined,
      }
    : undefined;

  const handleSubmit = async (formData: any) => {
    console.log("Form submitted with data:", formData);
    
    try {
      const processedData = {
        tenant_id: currentUserId,
        property_id: formData.property_id || existingRequest?.property_id,
        title: formData.title || existingRequest?.title,
        description: formData.description || existingRequest?.description,
        status: formData.status || existingRequest?.status || "pending",
        priority: formData.priority || existingRequest?.priority || "low",
        scheduled_date: formData.scheduled_date?.toISOString(),
        assigned_to: formData.assigned_to,
        service_provider_notes: formData.service_provider_notes,
        notes: formData.notes,
        images: formData.images || [],
        service_provider_fee: formData.service_provider_fee,
        service_provider_status: formData.service_provider_status,
        completion_report: formData.completion_report
      };
      
      console.log("Processing form data:", processedData);

      const validatedData = validateMaintenanceRequest(processedData);
      console.log("Validated data:", validatedData);

      if (requestId) {
        console.log("Updating maintenance request:", validatedData);
        await updateMutation.mutateAsync(validatedData);
      } else {
        console.log("Creating maintenance request:", validatedData);
        await createMutation.mutateAsync(validatedData);
      }

      toast({
        title: "Success",
        description: requestId ? "Maintenance request updated" : "Maintenance request created",
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save maintenance request",
        variant: "destructive"
      });
    }
  };

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
          onSubmit={handleSubmit}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
          userRole={userRole!}
        />
      </DialogContent>
    </Dialog>
  );
}