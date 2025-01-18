import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useUserRole() {
  const [userRole, setUserRole] = useState<"landlord" | "tenant" | null>(null);

  useEffect(() => {
    async function getUserRole() {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log("No user found");
        return null;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      console.log("User profile:", profile);
      
      if (profile?.role) {
        setUserRole(profile.role as "landlord" | "tenant");
      }
    }

    getUserRole();
  }, []);

  return userRole;
}