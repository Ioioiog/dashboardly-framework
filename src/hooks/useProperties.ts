import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Property } from "@/utils/propertyUtils";

interface UsePropertiesProps {
  userRole: "landlord" | "tenant";
}

export function useProperties({ userRole }: UsePropertiesProps) {
  return useQuery({
    queryKey: ["properties", userRole],
    queryFn: async () => {
      console.log("Fetching properties for", userRole);
      
      if (userRole === "landlord") {
        const { data: properties, error } = await supabase
          .from("properties")
          .select("*");

        if (error) {
          console.error("Error fetching properties:", error);
          throw error;
        }

        console.log("Properties fetched:", properties);
        return properties;
      }

      // For tenants, fetch only properties they are assigned to
      const { data: tenantProperties, error: tenantError } = await supabase
        .from("tenancies")
        .select(`
          property:properties (
            id,
            name,
            address,
            monthly_rent,
            type,
            description,
            available_from
          )
        `)
        .eq("status", "active");

      if (tenantError) {
        console.error("Error fetching tenant properties:", tenantError);
        throw tenantError;
      }

      // Extract properties from tenancies and format them
      const properties = tenantProperties
        .map(tp => tp.property)
        .filter(Boolean);

      console.log("Tenant properties fetched:", properties);
      return properties;
    },
  });
}