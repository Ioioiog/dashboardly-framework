import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Property } from "@/types/property";

interface UsePropertiesProps {
  userRole: "landlord" | "tenant";
}

export function useProperties({ userRole }: UsePropertiesProps) {
  const { data: properties = [], isLoading } = useQuery({
    queryKey: ["properties", userRole],
    queryFn: async () => {
      console.log("Fetching properties data...");
      const { data: user } = await supabase.auth.getUser();
      
      if (!user.user) {
        throw new Error("No user found");
      }

      if (userRole === "landlord") {
        const { data, error } = await supabase
          .from("properties")
          .select("*")
          .eq("landlord_id", user.user.id);

        if (error) throw error;
        return data || [];
      } else {
        const { data, error } = await supabase
          .from("properties")
          .select("*")
          .eq("tenant_id", user.user.id);

        if (error) throw error;
        return data || [];
      }
    },
  });

  return { properties: properties as Property[], isLoading };
}