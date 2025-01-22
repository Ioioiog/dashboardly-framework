import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./use-toast";

export function useAuthState() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log("Initializing authentication state...");
        
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session error:", sessionError);
          if (mounted) {
            setIsAuthenticated(false);
            setIsLoading(false);
          }
          return;
        }

        if (session?.user) {
          console.log("Valid session found for user:", session.user.id);
          if (mounted) {
            setIsAuthenticated(true);
          }
        } else {
          console.log("No active session found");
          if (mounted) {
            setIsAuthenticated(false);
          }
        }

        if (mounted) {
          setIsLoading(false);
        }

      } catch (error) {
        console.error("Authentication initialization error:", error);
        if (mounted) {
          setIsLoading(false);
          setIsAuthenticated(false);
        }
      }
    };

    // Initialize auth state
    initializeAuth();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, "Session:", session ? "exists" : "null");
      
      if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
        console.log("User signed out or deleted");
        if (mounted) {
          setIsAuthenticated(false);
          setIsLoading(false);
        }
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        console.log("User signed in or token refreshed");
        if (mounted) {
          setIsAuthenticated(true);
          setIsLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [toast]);

  return { isLoading, isAuthenticated };
}