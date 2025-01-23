import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MaintenanceRequest } from "@/types/maintenance";

export function useMaintenanceRequests() {
  return useQuery({
    queryKey: ["maintenance-requests"],
    queryFn: async () => {
      console.log("Fetching maintenance requests");
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      // Get user's profile with role
      const { data: userProfile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error("Error fetching user profile:", profileError);
        throw profileError;
      }

      console.log("User role:", userProfile?.role);

      const query = supabase
        .from("maintenance_requests")
        .select(`
          *,
          property:properties(
            id,
            name,
            address
          ),
          tenant:profiles!maintenance_requests_tenant_id_fkey(
            id,
            first_name,
            last_name
          )
        `)
        .order("created_at", { ascending: false });

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching maintenance requests:", error);
        throw error;
      }

      console.log("Fetched maintenance requests:", data);
      return data as MaintenanceRequest[];
    },
  });
}