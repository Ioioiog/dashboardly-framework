import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useMaintenanceProperties(userRole: string, currentUserId: string) {
  return useQuery({
    queryKey: ["properties", userRole, currentUserId],
    enabled: !!currentUserId, // Only run query if we have a userId
    queryFn: async () => {
      console.log("Fetching properties for:", { userRole, currentUserId });
      
      if (!currentUserId) {
        console.log("No currentUserId provided, returning empty array");
        return [];
      }

      if (userRole === "landlord") {
        const { data, error } = await supabase
          .from("properties")
          .select("id, name");

        if (error) {
          console.error("Error fetching landlord properties:", error);
          throw error;
        }

        console.log("Fetched landlord properties:", data);
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
        
        if (error) {
          console.error("Error fetching tenant properties:", error);
          throw error;
        }
        
        // Transform the data to match the expected format
        const transformedData = data?.map(item => ({
          id: item.property.id,
          name: item.property.name
        })) || [];

        console.log("Fetched tenant properties:", transformedData);
        return transformedData;
      }
    },
  });
}