import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MaintenanceRequest } from "@/types/maintenance";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export function useMaintenanceRequests() {
  const navigate = useNavigate();
  const { toast } = useToast();

  return useQuery({
    queryKey: ["maintenance-requests"],
    queryFn: async () => {
      try {
        console.log("Checking authentication status...");
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session error:", sessionError);
          throw sessionError;
        }

        if (!session) {
          console.log("No active session found, redirecting to auth");
          navigate("/auth");
          throw new Error("No authenticated session");
        }

        console.log("Fetching user profile...");
        const { data: userProfile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
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
      } catch (error: any) {
        console.error("Error in maintenance requests query:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch maintenance requests. Please try again.",
        });
        throw error;
      }
    },
  });
}