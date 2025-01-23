import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/use-user-role";

export function useMaintenanceRequests() {
  const { userRole } = useUserRole();

  return useQuery({
    queryKey: ["maintenance-requests"],
    queryFn: async () => {
      console.log("Fetching maintenance requests for role:", userRole);

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error("Error getting user:", userError);
        throw userError;
      }

      if (!user) {
        console.error("No authenticated user found");
        return [];
      }

      console.log("Fetching maintenance requests for user:", user.id);

      const query = supabase
        .from("maintenance_requests")
        .select(`
          *,
          property:properties (
            id,
            name,
            address
          ),
          tenant:profiles (
            id,
            first_name,
            last_name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      // If user is a tenant, only show their requests
      if (userRole === "tenant") {
        console.log("Filtering requests for tenant:", user.id);
        query.eq("tenant_id", user.id);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching maintenance requests:", error);
        throw error;
      }

      console.log("Fetched maintenance requests:", data);
      return data;
    },
  });
}