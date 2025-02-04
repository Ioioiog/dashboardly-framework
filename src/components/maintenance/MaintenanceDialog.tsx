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
import { X } from "lucide-react";
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
  const queryClient = useQueryClient();
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
      const validProviders = profiles.filter(p => p.first_name || p.last_name);
      return validProviders;
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
      if (!currentUserId) {
        throw new Error("No authenticated user");
      }

      const processedData = {
        tenant_id: currentUserId,
        property_id: formData.property_id || existingRequest?.property_id,
        title: formData.title || existingRequest?.title,
        description: formData.description || existingRequest?.description,
        status: formData.status || existingRequest?.status || "pending",
        priority: formData.priority || existingRequest?.priority || "low",
        scheduled_date: formData.scheduled_date ? formData.scheduled_date.toISOString() : null,
        assigned_to: formData.assigned_to || null,
        service_provider_notes: formData.service_provider_notes || null,
        notes: formData.notes || null,
        images: (formData.images?.filter((img: string | File) => typeof img === 'string') || []) as string[],
        service_provider_fee: formData.service_provider_fee || 0,
        service_provider_status: formData.service_provider_status || null,
        completion_report: formData.completion_report || null,
        payment_amount: formData.payment_amount || 0,
        payment_status: formData.payment_status || null,
        read_by_landlord: false,
        read_by_tenant: false,
        contact_phone: formData.contact_phone || null,
        preferred_times: formData.preferred_times || []
      };
      
      console.log("Processing form data:", processedData);

      if (!processedData.property_id || !processedData.tenant_id || !processedData.title || !processedData.description) {
        throw new Error("Missing required fields");
      }

      console.log("Validating maintenance request data:", processedData);
      const validatedData = validateMaintenanceRequest(processedData);
      console.log("Validated data:", validatedData);

      if (requestId) {
        console.log("Updating maintenance request:", validatedData);
        await updateMutation.mutateAsync({
          ...validatedData,
          id: requestId
        } as MaintenanceRequest);
      } else {
        console.log("Creating maintenance request:", validatedData);
        await createMutation.mutateAsync(validatedData as MaintenanceRequest);
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
      <DialogContent className="max-w-[600px] p-6">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-2xl font-bold">
            {requestId ? "Edit Maintenance Request" : "New Maintenance Request"}
          </DialogTitle>
          <button
            onClick={() => onOpenChange(false)}
            className="rounded-full p-1 hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </DialogHeader>
        <MaintenanceRequestForm
          properties={properties || []}
          serviceProviders={serviceProviders || []}
          existingRequest={transformedRequest}
          onSubmit={handleSubmit}
          isSubmitting={isLoading}
          userRole={userRole!}
          isLoadingProviders={isLoadingProviders}
        />
      </DialogContent>
    </Dialog>
  );
}