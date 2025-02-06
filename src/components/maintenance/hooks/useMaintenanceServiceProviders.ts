import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useMaintenanceServiceProviders(enabled: boolean) {
  return useQuery({
    queryKey: ["service-providers"],
    enabled,
    queryFn: async () => {
      console.log("Fetching service providers for landlord");
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          console.error("No active session found when fetching service providers");
          return [];
        }

        const { data: profiles, error: profilesError } = await supabase
          .from("profiles")
          .select("id, first_name, last_name")
          .eq("role", "service_provider");

        if (profilesError) {
          console.error("Error fetching service providers:", profilesError);
          return [];
        }

        console.log(`Found ${profiles?.length || 0} service providers`);
        return profiles?.filter(p => p.first_name || p.last_name) || [];
      } catch (error) {
        console.error("Unexpected error in service providers query:", error);
        return [];
      }
    },
  });
}