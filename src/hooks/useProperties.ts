import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Property } from "@/utils/propertyUtils";

export interface UsePropertiesProps {
  userRole: "landlord" | "tenant";
}

export interface UsePropertiesReturn {
  properties: Property[];
  isLoading: boolean;
  handleAdd?: (data: any) => Promise<boolean>;
  handleEdit?: (property: Property, data: any) => Promise<boolean>;
  handleDelete?: (property: Property) => Promise<boolean>;
  isSubmitting?: boolean;
}

export function useProperties({ userRole }: UsePropertiesProps): UsePropertiesReturn {
  const { data: properties = [], isLoading } = useQuery({
    queryKey: ["properties", userRole],
    queryFn: async () => {
      console.log("Fetching properties data for role:", userRole);
      const { data: user } = await supabase.auth.getUser();
      
      if (!user.user) {
        throw new Error("No user found");
      }

      console.log("Current user ID:", user.user.id);

      if (userRole === "landlord") {
        const { data, error } = await supabase
          .from("properties")
          .select("*")
          .eq("landlord_id", user.user.id);

        if (error) {
          console.error("Error fetching landlord properties:", error);
          throw error;
        }
        console.log("Fetched landlord properties:", data);
        return data || [];
      } else {
        // For tenants, we need to join through the tenancies table
        console.log("Fetching tenant properties through tenancies...");
        const { data: tenanciesData, error } = await supabase
          .from("tenancies")
          .select(`
            property:properties (*),
            status,
            start_date,
            end_date
          `)
          .eq("tenant_id", user.user.id)
          .eq("status", "active");

        if (error) {
          console.error("Error fetching tenant properties:", error);
          throw error;
        }
        
        // Extract and enhance the properties from the joined data
        const properties = tenanciesData?.map(item => ({
          ...item.property,
          tenancy: {
            end_date: item.end_date,
            start_date: item.start_date
          }
        })) || [];

        console.log("Fetched tenant properties:", properties);
        console.log("Raw tenancies data:", tenanciesData);
        return properties;
      }
    },
  });

  return { properties: properties as Property[], isLoading };
}