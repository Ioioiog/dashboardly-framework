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
    let authListener: { data: { subscription: { unsubscribe: () => void } } } | null = null;

    const initializeAuth = async () => {
      try {
        console.log("Initializing authentication...");
        
        // Get the initial session
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
        const { data } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
          console.log("Auth state changed:", event, "Session:", currentSession ? "exists" : "null");
          
          if (event === 'SIGNED_OUT') {
            console.log("User signed out");
            if (mounted) {
              setIsAuthenticated(false);
            }
          } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            console.log(`Auth event: ${event}`);
            if (currentSession && mounted) {
              try {
                const { data: { user }, error: userError } = await supabase.auth.getUser();
                if (!userError && user) {
                  console.log("User verified:", user.id);
                  setIsAuthenticated(true);
                } else {
                  console.error("Error verifying user:", userError);
                  setIsAuthenticated(false);
                  // Try to refresh the session
                  const { error: refreshError } = await supabase.auth.refreshSession();
                  if (refreshError) {
                    console.error("Session refresh failed:", refreshError);
                    await supabase.auth.signOut();
                    toast({
                      title: "Session Expired",
                      description: "Please sign in again to continue.",
                      variant: "destructive",
                    });
                  }
                }
              } catch (error) {
                console.error("Error during user verification:", error);
                setIsAuthenticated(false);
              }
            }
          }
        });

        // Store the auth listener for cleanup
        authListener = { data };

        // If we have a session, verify the user
        if (session) {
          console.log("Session found, verifying user...");
          try {
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            
            if (userError) {
              console.error("User verification failed:", userError);
              if (mounted) {
                setIsAuthenticated(false);
                // Try to refresh the session
                const { error: refreshError } = await supabase.auth.refreshSession();
                if (refreshError) {
                  console.error("Session refresh failed:", refreshError);
                  await supabase.auth.signOut();
                  toast({
                    title: "Session Expired",
                    description: "Please sign in again to continue.",
                    variant: "destructive",
                  });
                }
              }
            } else if (user) {
              console.log("User verified successfully:", user.id);
              if (mounted) {
                setIsAuthenticated(true);
              }
            }
          } catch (error) {
            console.error("Error during session verification:", error);
            if (mounted) {
              setIsAuthenticated(false);
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
            description: "There was a problem with authentication. Please sign in again.",
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
      if (authListener?.data?.subscription?.unsubscribe) {
        console.log("Cleaning up auth listener...");
        authListener.data.subscription.unsubscribe();
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (authCheckTimeoutRef.current) {
        clearTimeout(authCheckTimeoutRef.current);
      }
    };
  }, [toast]);

  return { isLoading, isAuthenticated };
}