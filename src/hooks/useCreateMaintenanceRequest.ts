import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface CreateMaintenanceRequestData {
  title: string;
  description: string;
  property_id: string;
  tenant_id: string;
}

export function useCreateMaintenanceRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateMaintenanceRequestData) => {
      console.log("Creating maintenance request:", data);
      const { data: request, error } = await supabase
        .from("maintenance_requests")
        .insert(data)
        .select()
        .single();

      if (error) {
        console.error("Error creating maintenance request:", error);
        throw error;
      }

      console.log("Created maintenance request:", request);
      return request;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenance-requests"] });
    },
  });
}