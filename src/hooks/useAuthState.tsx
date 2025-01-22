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
        
        // First, try to get the current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Error with existing session:', sessionError);
          if (mounted) {
            setIsAuthenticated(false);
            setIsLoading(false);
          }
          // Clear invalid session data
          await supabase.auth.signOut();
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
          // Clear any stale session data
          await supabase.auth.signOut();
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
        // Clear session data on error
        await supabase.auth.signOut();
      }
    };

    // Initialize auth state
    initializeAuth();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, "Session:", session ? "exists" : "null");
      
      if (event === 'SIGNED_OUT' || !session) {
        console.log("User signed out or session expired");
        if (mounted) {
          setIsAuthenticated(false);
        }
        
        toast({
          title: "Session Ended",
          description: "Your session has ended. Please sign in again.",
          variant: "destructive",
        });

      } else if (event === 'SIGNED_IN' && session) {
        console.log("User signed in successfully");
        if (mounted) {
          setIsAuthenticated(true);
        }
      } else if (event === 'TOKEN_REFRESHED') {
        console.log("Session token refreshed");
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [toast]);

  return { isLoading, isAuthenticated };
}