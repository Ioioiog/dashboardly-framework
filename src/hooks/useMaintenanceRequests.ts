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

        // Build the query with explicit foreign key references
        let query = supabase
          .from("maintenance_requests")
          .select(`
            *,
            property:properties(
              id,
              name,
              address,
              landlord_id
            ),
            tenant:profiles!maintenance_requests_tenant_id_fkey(
              id,
              first_name,
              last_name
            ),
            assignee:profiles!maintenance_requests_assigned_to_fkey(
              id,
              first_name,
              last_name
            )
          `)
          .order("created_at", { ascending: false });

        // If user is a landlord, fetch all maintenance requests for their properties
        if (userProfile?.role === "landlord") {
          // First get the property IDs
          console.log("Fetching properties for landlord:", session.user.id);
          const { data: properties, error: propertyError } = await supabase
            .from("properties")
            .select("id")
            .eq("landlord_id", session.user.id);

          if (propertyError) {
            console.error("Error fetching property IDs:", propertyError);
            throw propertyError;
          }

          if (!properties || properties.length === 0) {
            console.log("No properties found for landlord");
            return [];
          }

          const propertyIds = properties.map(p => p.id);
          console.log("Found property IDs:", propertyIds);

          // Then use those IDs in the maintenance requests query
          query = query.in("property_id", propertyIds);
        } else {
          // If user is a tenant, only fetch their own maintenance requests
          query = query.eq("tenant_id", session.user.id);
        }

        console.log("Executing maintenance requests query...");
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