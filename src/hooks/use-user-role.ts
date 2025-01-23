import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type UserRole = "landlord" | "tenant" | null;

export function useUserRole() {
  const [userRole, setUserRole] = useState<UserRole>(null);

  useEffect(() => {
    let mounted = true;

    async function getUserRole() {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          console.error("Error fetching user:", userError);
          setUserRole(null);
          return;
        }

        if (!user) {
          console.log("No authenticated user found");
          setUserRole(null);
          return;
        }

        console.log("Fetching role for user:", user.id);

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();

        if (profileError) {
          console.error("Error fetching user profile:", profileError);
          if (mounted) setUserRole(null);
          return;
        }

        console.log("User profile data:", profile);
        
        if (profile?.role && mounted) {
          console.log("Setting user role to:", profile.role);
          setUserRole(profile.role as UserRole);
        } else {
          console.log("No role found in profile");
          if (mounted) setUserRole(null);
        }
      } catch (error) {
        console.error("Unexpected error in getUserRole:", error);
        if (mounted) setUserRole(null);
      }
    }

    getUserRole();

    return () => {
      mounted = false;
    };
  }, []);

  return { userRole };
}