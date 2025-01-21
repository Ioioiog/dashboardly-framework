import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./use-toast";

export function useAuthState() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;
    let authListener: any = null;

    const initializeAuth = async () => {
      try {
        console.log("Initializing authentication state...");
        setError(null);
        
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session error:", sessionError);
          throw sessionError;
        }

        if (session?.user) {
          console.log("Initial session found, user is authenticated");
          if (mounted) {
            setIsAuthenticated(true);
            setIsLoading(false);
          }
        } else {
          console.log("No initial session found, user is not authenticated");
          if (mounted) {
            setIsAuthenticated(false);
            setIsLoading(false);
          }
        }

        authListener = supabase.auth.onAuthStateChange(async (event, currentSession) => {
          console.log("Auth state changed:", event, "Session:", currentSession ? "exists" : "null");
          
          if (!mounted) return;

          if (event === 'SIGNED_OUT') {
            console.log("User signed out");
            setIsAuthenticated(false);
            setIsLoading(false);
          } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            console.log("User signed in or token refreshed");
            if (currentSession?.user) {
              setIsAuthenticated(true);
              setIsLoading(false);
            }
          }
        });

      } catch (error) {
        console.error("Authentication initialization error:", error);
        if (mounted) {
          setError(error instanceof Error ? error : new Error('Authentication failed'));
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
      if (authListener) {
        authListener.subscription.unsubscribe();
      }
    };
  }, [toast]);

  return { isLoading, isAuthenticated, error };
}