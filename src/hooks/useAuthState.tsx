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
            localStorage.removeItem('supabase.auth.token');
          }
          return;
        }

        // Set up auth state change listener
        const { data } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
          console.log("Auth state changed:", event, "Session:", currentSession ? "exists" : "null");
          
          if (event === 'SIGNED_OUT' || !currentSession) {
            console.log("User signed out or no session");
            if (mounted) {
              setIsAuthenticated(false);
              setIsLoading(false);
              localStorage.removeItem('supabase.auth.token');
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
                  await supabase.auth.signOut();
                  localStorage.removeItem('supabase.auth.token');
                  setIsAuthenticated(false);
                  toast({
                    title: "Session Expired",
                    description: "Please sign in again.",
                    variant: "destructive",
                  });
                }
              } catch (error) {
                console.error("Error during user verification:", error);
                setIsAuthenticated(false);
                localStorage.removeItem('supabase.auth.token');
              } finally {
                if (mounted) {
                  setIsLoading(false);
                }
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
                await supabase.auth.signOut();
                localStorage.removeItem('supabase.auth.token');
                setIsAuthenticated(false);
                toast({
                  title: "Session Expired",
                  description: "Please sign in again.",
                  variant: "destructive",
                });
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
              localStorage.removeItem('supabase.auth.token');
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
          localStorage.removeItem('supabase.auth.token');
        }
      }
    };

    // Handle tab visibility changes
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        if (authCheckTimeoutRef.current) {
          clearTimeout(authCheckTimeoutRef.current);
        }
        
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