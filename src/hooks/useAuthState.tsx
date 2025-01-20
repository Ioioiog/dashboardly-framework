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
        
        // Get initial session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session initialization error:", sessionError);
          if (mounted) {
            setIsAuthenticated(false);
            setIsLoading(false);
          }
          return;
        }

        // Set up auth state change listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
          console.log("Auth state changed:", event, "Session exists:", !!currentSession);
          
          if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
            if (mounted) {
              console.log("User signed out or deleted");
              setIsAuthenticated(false);
            }
          } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
            if (currentSession) {
              console.log("Valid session detected");
              if (mounted) {
                setIsAuthenticated(true);
              }
            } else {
              console.log("No valid session found after auth event");
              if (mounted) {
                setIsAuthenticated(false);
              }
            }
          }
        });

        // Initialize state based on session
        if (session) {
          console.log("Initial session found");
          if (mounted) {
            setIsAuthenticated(true);
          }
        } else {
          console.log("No initial session found");
          if (mounted) {
            setIsAuthenticated(false);
          }
        }

        if (mounted) {
          setIsLoading(false);
        }

        return () => {
          subscription.unsubscribe();
        };

      } catch (error) {
        console.error("Authentication initialization error:", error);
        if (mounted) {
          setIsLoading(false);
          setIsAuthenticated(false);
          toast({
            variant: "destructive",
            title: "Authentication Error",
            description: "There was a problem with authentication. Please try logging in again.",
          });
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
    };
  }, [toast]);

  return { isLoading, isAuthenticated };
}