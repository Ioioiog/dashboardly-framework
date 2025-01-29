import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useMaintenanceProperties(userRole: string, currentUserId: string) {
  return useQuery({
    queryKey: ["properties", userRole, currentUserId],
    queryFn: async () => {
      if (userRole === "landlord") {
        const { data, error } = await supabase
          .from("properties")
          .select("id, name");
        if (error) throw error;
        return data;
      } else {
        // For tenants, fetch only properties they are assigned to via active tenancies
        const { data, error } = await supabase
          .from("tenancies")
          .select(`
            property:properties (
              id,
              name
            )
          `)
          .eq("tenant_id", currentUserId)
          .eq("status", "active");
        
        if (error) throw error;
        
        // Transform the data to match the expected format
        return data?.map(item => ({
          id: item.property.id,
          name: item.property.name
        })) || [];
      }
    },
  });
}