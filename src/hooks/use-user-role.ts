import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type UserRole = "landlord" | "tenant" | null;

export function useUserRole() {
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function getUserRole() {
      try {
        setIsLoading(true);
        
        // First check if we have an authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError) {
          console.error("Auth error:", authError);
          toast({
            title: "Authentication Error",
            description: "Failed to get user authentication status",
            variant: "destructive",
          });
          return;
        }

        if (!user) {
          console.log("No authenticated user found");
          setUserRole(null);
          return;
        }

        console.log("Fetching profile for user:", user.id);
        
        // Then get the user's profile with role
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();

        if (profileError) {
          console.error("Error fetching profile:", profileError);
          toast({
            title: "Error",
            description: "Failed to fetch user profile",
            variant: "destructive",
          });
          return;
        }

        console.log("Profile data:", profile);
        setUserRole(profile?.role as UserRole || null);

      } catch (error) {
        console.error("Error in getUserRole:", error);
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }

    getUserRole();
  }, [toast]);

  return { userRole, isLoading };
}