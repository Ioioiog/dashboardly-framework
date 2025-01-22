import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useAuthState() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log("Initializing authentication state...");
        
        // Clear any potentially invalid session data
        const currentSession = localStorage.getItem('sb-wecmvyohaxizmnhuvjly-auth-token');
        if (currentSession && !JSON.parse(currentSession).access_token) {
          localStorage.removeItem('sb-wecmvyohaxizmnhuvjly-auth-token');
        }
        
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Error with existing session:', sessionError);
          if (mounted) {
            handleAuthError();
          }
          return;
        }

        if (!session) {
          console.log("No active session found");
          if (mounted) {
            handleAuthError();
          }
          return;
        }

        // Verify the session is still valid
        const { error: userError } = await supabase.auth.getUser();
        if (userError) {
          console.error("User verification error:", userError);
          if (mounted) {
            handleAuthError();
          }
          return;
        }

        if (mounted && session.user) {
          console.log("Setting current user ID:", session.user.id);
          setIsAuthenticated(true);
          setCurrentUserId(session.user.id);
        }

        if (mounted) {
          setIsLoading(false);
        }

      } catch (error) {
        console.error("Authentication initialization error:", error);
        if (mounted) {
          handleAuthError();
        }
      }
    };

    const handleAuthError = async () => {
      setIsAuthenticated(false);
      setCurrentUserId(null);
      setIsLoading(false);
      
      // Clean up the session
      localStorage.removeItem('sb-wecmvyohaxizmnhuvjly-auth-token');
      await supabase.auth.signOut();
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, "Session:", session ? "exists" : "null");
      
      if (event === 'SIGNED_OUT' || !session) {
        console.log("User signed out or session expired");
        if (mounted) {
          setIsAuthenticated(false);
          setCurrentUserId(null);
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
          setCurrentUserId(session.user.id);
        }
      } else if (event === 'TOKEN_REFRESHED' && session) {
        console.log("Session token refreshed");
        if (mounted) {
          setCurrentUserId(session.user.id);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [toast]);

  return { isLoading, isAuthenticated, currentUserId };
}