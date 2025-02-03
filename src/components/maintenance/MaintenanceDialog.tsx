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

  const validateFormData = (formData: any) => {
    const requiredFields = ['property_id', 'title', 'description'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      console.error('Missing required fields:', missingFields);
      toast({
        title: "Validation Error",
        description: `Please fill in all required fields: ${missingFields.join(', ')}`,
        variant: "destructive"
      });
      return false;
    }
    return true;
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
          onSubmit={async (data) => {
            console.log("Form submitted with data:", data);
            
            const formDataWithTenant = {
              ...existingRequest, // Preserve existing data
              ...data, // Override with new form data
              tenant_id: currentUserId,
              scheduled_date: data.scheduled_date?.toISOString(),
              property_id: data.property_id || existingRequest?.property_id,
              title: data.title || existingRequest?.title,
              description: data.description || existingRequest?.description,
              status: data.status || existingRequest?.status || "pending",
              priority: data.priority || existingRequest?.priority || "low",
            };
            
            console.log("Processing form data:", formDataWithTenant);

            if (!validateFormData(formDataWithTenant)) {
              return;
            }
            
            try {
              if (requestId) {
                console.log("Updating maintenance request:", formDataWithTenant);
                await updateMutation.mutateAsync(formDataWithTenant);
              } else {
                console.log("Creating maintenance request:", formDataWithTenant);
                await createMutation.mutateAsync(formDataWithTenant);
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
                description: "Failed to save maintenance request. Please try again.",
                variant: "destructive"
              });
            }
          }}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
          userRole={userRole!}
        />
      </DialogContent>
    </Dialog>
  );
}