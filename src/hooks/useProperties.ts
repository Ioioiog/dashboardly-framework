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
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          console.error("Error fetching user in useProperties:", userError);
          throw userError;
        }

        if (!user) {
          console.error("No authenticated user found in useProperties");
          return [];
        }

        console.log("useProperties - User ID:", user.id);
        console.log("useProperties - User Role:", userRole);

        if (userRole === "landlord") {
          console.log("Executing landlord properties query...");
          const { data, error } = await supabase
            .from("properties")
            .select(`
              *,
              tenancies:tenancies(
                id,
                start_date,
                end_date,
                status,
                tenant:profiles(
                  id,
                  first_name,
                  last_name,
                  email
                )
              )
            `)
            .eq("landlord_id", user.id)
            .order('created_at', { ascending: false });

          if (error) {
            console.error("Error fetching landlord properties:", error);
            throw error;
          }

          console.log("Raw landlord properties data:", data);
          return data || [];
        } else {
          // For tenants, fetch through tenancies table with explicit status check
          console.log("Fetching tenant properties for user:", user.id);
          const { data: tenanciesData, error } = await supabase
            .from("tenancies")
            .select(`
              id,
              status,
              start_date,
              end_date,
              property:properties(*)
            `)
            .eq("tenant_id", user.id)
            .eq("status", "active");

          if (error) {
            console.error("Error fetching tenant properties:", error);
            throw error;
          }
          
          console.log("Raw tenancies data:", tenanciesData);
          
          // Transform the data to match our Property interface
          const properties = tenanciesData?.map(tenancy => ({
            ...tenancy.property,
            tenancy: {
              end_date: tenancy.end_date,
              start_date: tenancy.start_date,
              status: tenancy.status
            }
          })) || [];

          console.log("Transformed tenant properties:", properties);
          
          // Additional validation to ensure we're returning valid properties
          const validProperties = properties.filter(property => {
            if (!property || !property.id) {
              console.log("Found invalid property:", property);
              return false;
            }
            return true;
          });

          console.log("Final filtered properties:", validProperties);
          return validProperties;
        }
      } catch (error) {
        console.error("Error in useProperties:", error);
        throw error;
      }
    },
    retry: 1,
    staleTime: 30000, // Cache data for 30 seconds
  });

  return { properties: properties as Property[], isLoading };
}