import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MaintenanceFormValues } from "@/components/maintenance/types";

export function useMaintenanceFormSubmit(onSuccess: () => void) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSubmit = async (values: MaintenanceFormValues, uploadedImages: string[], propertyId?: string) => {
    try {
      setIsSubmitting(true);
      console.log("Form submitted with values:", values);
      
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        console.error("No authenticated user found");
        toast({
          title: "Error",
          description: "You must be logged in to create a maintenance request",
          variant: "destructive",
        });
        return;
      }

      let finalPropertyId = propertyId || values.property_id;
      
      if (!finalPropertyId) {
        console.log("Fetching active tenancy for tenant...");
        const { data: tenancy, error: tenancyError } = await supabase
          .from("tenancies")
          .select("property_id")
          .eq("tenant_id", userData.user.id)
          .eq("status", "active")
          .maybeSingle();

        if (tenancyError) {
          console.error("Error fetching tenancy:", tenancyError);
          toast({
            title: "Error",
            description: "Failed to fetch tenancy information",
            variant: "destructive",
          });
          return;
        }

        if (!tenancy) {
          console.error("No active tenancy found");
          toast({
            title: "Error",
            description: "You don't have an active tenancy. Please contact your landlord.",
            variant: "destructive",
          });
          return;
        }

        finalPropertyId = tenancy.property_id;
      }

      console.log("Creating maintenance request with data:", {
        ...values,
        property_id: finalPropertyId,
        tenant_id: userData.user.id,
        images: uploadedImages,
      });

      const { error: insertError } = await supabase
        .from("maintenance_requests")
        .insert({
          title: values.title,
          description: values.description,
          property_id: finalPropertyId,
          tenant_id: userData.user.id,
          issue_type: values.issue_type,
          priority: values.priority,
          notes: values.notes,
          images: uploadedImages,
        });

      if (insertError) {
        console.error("Error inserting maintenance request:", insertError);
        throw insertError;
      }

      queryClient.invalidateQueries({ queryKey: ["maintenance-requests"] });
      toast({
        title: "Success",
        description: "Maintenance request created successfully",
      });
      onSuccess();
    } catch (error) {
      console.error("Error in form submission:", error);
      toast({
        title: "Error",
        description: "Failed to create maintenance request",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return { handleSubmit, isSubmitting };
}