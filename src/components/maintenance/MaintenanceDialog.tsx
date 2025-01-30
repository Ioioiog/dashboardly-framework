import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/use-user-role";
import { useAuthState } from "@/hooks/useAuthState";
import { MaintenanceRequestForm } from "./forms/MaintenanceRequestForm";
import { useMaintenanceRequest } from "./hooks/useMaintenanceRequest";
import { useMaintenanceProperties } from "./hooks/useMaintenanceProperties";
import { Button } from "@/components/ui/button";
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
  const { t } = useTranslation();
  const { toast } = useToast();
  const { userRole } = useUserRole();
  const { currentUserId } = useAuthState();

  const { data: properties } = useMaintenanceProperties(userRole!, currentUserId!);
  const { existingRequest, createMutation, updateMutation } = useMaintenanceRequest(requestId);

  // Add back the service providers query
  const { data: serviceProviders } = useQuery({
    queryKey: ["service-providers"],
    enabled: userRole === "landlord",
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, first_name, last_name")
        .eq("role", "service_provider");
      if (error) throw error;
      return data;
    },
  });

  const defaultValues = {
    title: "",
    description: "",
    property_id: "",
    priority: "low",
    status: "pending",
    notes: "",
    assigned_to: "",
    service_provider_notes: "",
    images: [],
    tenant_id: currentUserId || "",
    ...existingRequest,
  };

  const handleSubmit = (values: any) => {
    // Validate required fields
    if (!values.property_id) {
      toast({
        title: "Error",
        description: "Please select a property",
        variant: "destructive",
      });
      return;
    }

    if (!values.title) {
      toast({
        title: "Error",
        description: "Please enter a title",
        variant: "destructive",
      });
      return;
    }

    if (!values.description) {
      toast({
        title: "Error",
        description: "Please enter a description",
        variant: "destructive",
      });
      return;
    }

    console.log("Submitting maintenance request with values:", values);

    if (requestId) {
      updateMutation.mutate(values);
    } else {
      createMutation.mutate(values);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px]">
        <DialogHeader>
          <DialogTitle>{requestId ? t("maintenance.form.updateRequest") : t("maintenance.form.createRequest")}</DialogTitle>
        </DialogHeader>
        <MaintenanceRequestForm
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
          properties={properties || []}
          userRole={userRole!}
          serviceProviders={serviceProviders}
        />
        <div className="flex justify-end space-x-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}