import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type UserRole = "landlord" | "tenant" | null;

export function useUserRole() {
  const [userRole, setUserRole] = useState<UserRole>(null);

  useEffect(() => {
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
          .single();

        if (profileError) {
          console.error("Error fetching user profile:", profileError);
          setUserRole(null);
          return;
        }

        console.log("User profile data:", profile);
        
        if (profile?.role) {
          console.log("Setting user role to:", profile.role);
          setUserRole(profile.role as UserRole);
        } else {
          console.log("No role found in profile");
          setUserRole(null);
        }
      } catch (error) {
        console.error("Unexpected error in getUserRole:", error);
        setUserRole(null);
      }
    }

    getUserRole();
  }, []);

  return { userRole };
}