import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MaintenanceRequest } from "@/types/maintenance";

export function useMaintenanceRequests() {
  return useQuery({
    queryKey: ["maintenance-requests"],
    queryFn: async () => {
      console.log("Fetching maintenance requests");
      const { data, error } = await supabase
        .from("maintenance_requests")
        .select(`
          *,
          property:properties(
            id,
            name,
            address
          )
        `)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching maintenance requests:", error);
        throw error;
      }

      console.log("Fetched maintenance requests:", data);
      return data as MaintenanceRequest[];
    },
  });
}