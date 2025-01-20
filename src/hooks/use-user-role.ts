import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type UserRole = "landlord" | "tenant" | null;

export function useUserRole() {
  const [userRole, setUserRole] = useState<UserRole>(null);

  useEffect(() => {
    async function getUserRole() {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log("No user found");
        setUserRole(null);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      console.log("User profile:", profile);
      
      if (profile?.role) {
        setUserRole(profile.role as UserRole);
      } else {
        setUserRole(null);
      }
    }

    getUserRole();
  }, []);

  return { userRole };
}