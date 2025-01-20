import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type UserRole = "landlord" | "tenant" | null;

export function useUserRole() {
  const [userRole, setUserRole] = useState<UserRole>(null);

  useEffect(() => {
    async function getUserRole() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          console.log("No user found");
          setUserRole(null);
          return;
        }

        console.log("Fetching profile for user:", user.id);
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();

        if (error) {
          console.error("Error fetching profile:", error);
          setUserRole(null);
          return;
        }

        console.log("Profile data:", profile);
        
        if (profile?.role) {
          setUserRole(profile.role as UserRole);
        } else {
          setUserRole(null);
        }
      } catch (error) {
        console.error("Error in getUserRole:", error);
        setUserRole(null);
      }
    }

    getUserRole();
  }, []);

  return { userRole };
}