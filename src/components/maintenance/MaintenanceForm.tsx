import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useCreateMaintenanceRequest } from "@/hooks/useCreateMaintenanceRequest";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MaintenanceRequest } from "@/types/maintenance";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MaintenanceBasicInfo } from "./form/MaintenanceBasicInfo";
import { MaintenanceDescription } from "./form/MaintenanceDescription";
import { maintenanceFormSchema, MaintenanceFormValues } from "./types";

interface MaintenanceFormProps {
  onSuccess: () => void;
  request?: MaintenanceRequest;
}

export function MaintenanceForm({ onSuccess, request }: MaintenanceFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { mutate: createRequest, isPending: isCreating } = useCreateMaintenanceRequest();

  const { mutate: updateRequest, isPending: isUpdating } = useMutation({
    mutationFn: async (values: MaintenanceFormValues) => {
      console.log("Updating maintenance request:", values);
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) throw new Error("Not authenticated");

      // First, create a history record
      const { error: historyError } = await supabase
        .from("maintenance_request_history")
        .insert({
          maintenance_request_id: request!.id,
          title: request!.title,
          description: request!.description,
          issue_type: request!.issue_type,
          priority: request!.priority,
          notes: request!.notes,
          edited_by: currentUser.user.id,
        });

      if (historyError) throw historyError;

      // Then update the request
      const { data, error } = await supabase
        .from("maintenance_requests")
        .update({
          title: values.title,
          description: values.description,
          issue_type: values.issue_type,
          priority: values.priority,
          notes: values.notes,
          updated_at: new Date().toISOString(),
        })
        .eq("id", request!.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenance-requests"] });
      toast({
        title: "Success",
        description: "Maintenance request updated successfully",
      });
      onSuccess();
    },
    onError: (error) => {
      console.error("Error updating maintenance request:", error);
      toast({
        title: "Error",
        description: "Failed to update maintenance request",
        variant: "destructive",
      });
    },
  });

  const form = useForm<MaintenanceFormValues>({
    resolver: zodResolver(maintenanceFormSchema),
    defaultValues: {
      title: request?.title ?? "",
      description: request?.description ?? "",
      issue_type: request?.issue_type ?? "",
      priority: request?.priority ?? "",
      notes: request?.notes ?? "",
    },
  });

  const onSubmit = async (values: MaintenanceFormValues) => {
    if (request) {
      updateRequest(values);
      return;
    }

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      toast({
        title: "Error",
        description: "You must be logged in to create a maintenance request",
        variant: "destructive",
      });
      return;
    }

    const { data: tenancy, error: tenancyError } = await supabase
      .from("tenancies")
      .select("property_id")
      .eq("tenant_id", userData.user.id)
      .eq("status", "active")
      .maybeSingle();

    if (tenancyError) {
      toast({
        title: "Error",
        description: "Failed to fetch tenancy information",
        variant: "destructive",
      });
      console.error("Error fetching tenancy:", tenancyError);
      return;
    }

    if (!tenancy) {
      toast({
        title: "Error",
        description: "You don't have an active tenancy. Please contact your landlord.",
        variant: "destructive",
      });
      return;
    }

    const requestData = {
      title: values.title,
      description: values.description,
      property_id: tenancy.property_id,
      tenant_id: userData.user.id,
      issue_type: values.issue_type,
      priority: values.priority,
      notes: values.notes,
    };

    createRequest(requestData, {
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Maintenance request created successfully",
        });
        onSuccess();
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: "Failed to create maintenance request",
          variant: "destructive",
        });
        console.error("Error creating maintenance request:", error);
      },
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <MaintenanceBasicInfo form={form} />
        <MaintenanceDescription form={form} />
        <Button
          type="submit"
          className="w-full"
          disabled={isCreating || isUpdating}
        >
          {isCreating || isUpdating
            ? request
              ? "Updating..."
              : "Creating..."
            : request
            ? "Update Request"
            : "Create Request"}
        </Button>
      </form>
    </Form>
  );
}