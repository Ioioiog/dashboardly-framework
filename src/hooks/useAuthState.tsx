import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./use-toast";

export function useAuthState() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const authCheckTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let mounted = true;
    let authListener: { subscription: { unsubscribe: () => void } } | null = null;

    const initializeAuth = async () => {
      try {
        console.log("Initializing authentication...");
        
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session error:", sessionError);
          if (mounted) {
            setIsAuthenticated(false);
            setIsLoading(false);
          }
          return;
        }

        // Set up auth state change listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
          console.log("Auth state changed:", event, "Session:", currentSession ? "exists" : "null");
          
          if (event === 'SIGNED_OUT') {
            console.log("User signed out");
            if (mounted) {
              setIsAuthenticated(false);
            }
          } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            console.log("User signed in or token refreshed");
            if (currentSession && mounted) {
              const { data: { user }, error: userError } = await supabase.auth.getUser();
              if (!userError && user) {
                console.log("User verified after sign in:", user.id);
                setIsAuthenticated(true);
              } else {
                console.error("Error verifying user after sign in:", userError);
                setIsAuthenticated(false);
              }
            }
          }
        });

        // Store the auth listener for cleanup
        authListener = { subscription };

        // If we have a session, verify the user
        if (session) {
          console.log("Session found, verifying user...");
          const { data: { user }, error: userError } = await supabase.auth.getUser();
          
          if (userError) {
            console.error("User verification failed:", userError);
            if (mounted) {
              setIsAuthenticated(false);
            }
          } else if (user) {
            console.log("User verified successfully:", user.id);
            if (mounted) {
              setIsAuthenticated(true);
            }
          }
        } else {
          console.log("No session found");
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
          toast({
            variant: "destructive",
            title: "Authentication Error",
            description: "There was a problem with authentication. Please try logging in again.",
          });
        }
      }
    };

    // Handle tab visibility changes
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Clear any existing timeout
        if (authCheckTimeoutRef.current) {
          clearTimeout(authCheckTimeoutRef.current);
        }
        
        // Set a small delay before checking auth to prevent multiple rapid checks
        authCheckTimeoutRef.current = setTimeout(() => {
          console.log("Tab became visible, checking auth state...");
          initializeAuth();
        }, 1000);
      }
    };

    // Add visibility change listener
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Initial auth check
    initializeAuth();

    return () => {
      mounted = false;
      if (authListener?.subscription?.unsubscribe) {
        console.log("Cleaning up auth listener...");
        authListener.subscription.unsubscribe();
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (authCheckTimeoutRef.current) {
        clearTimeout(authCheckTimeoutRef.current);
      }
    };
  }, [toast]);

  return { isLoading, isAuthenticated };
}