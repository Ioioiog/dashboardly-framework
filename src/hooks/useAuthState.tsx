import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./use-toast";
import { useNavigate } from "react-router-dom";

export function useAuthState() {
  const { toast } = useToast();
  const navigate = useNavigate();
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
            // Clear any existing auth data
            await supabase.auth.signOut();
            localStorage.removeItem('supabase.auth.token');
            navigate('/auth');
            toast({
              variant: "destructive",
              title: "Authentication Error",
              description: "Your session has expired. Please sign in again.",
            });
          }
          return;
        }

        // Set up auth state change listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
          console.log("Auth state changed:", event, "Session exists:", !!currentSession);
          
          if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
            if (mounted) {
              console.log("User signed out or token refreshed");
              setIsAuthenticated(!!currentSession);
              if (!currentSession) {
                localStorage.removeItem('supabase.auth.token');
                navigate('/auth');
              }
            }
          } else if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
            if (currentSession) {
              console.log("Valid session detected");
              if (mounted) {
                setIsAuthenticated(true);
                navigate('/dashboard');
              }
            } else {
              console.log("No valid session found after auth event");
              if (mounted) {
                setIsAuthenticated(false);
                navigate('/auth');
              }
            }
          }
        });

        // Initialize state based on session
        if (session) {
          console.log("Initial session found:", session.user.id);
          if (mounted) {
            setIsAuthenticated(true);
            navigate('/dashboard');
          }
        } else {
          console.log("No initial session found");
          if (mounted) {
            setIsAuthenticated(false);
            if (window.location.pathname !== '/auth') {
              navigate('/auth');
            }
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
          // Clear any existing auth data
          await supabase.auth.signOut();
          localStorage.removeItem('supabase.auth.token');
          navigate('/auth');
          toast({
            variant: "destructive",
            title: "Authentication Error",
            description: "There was a problem with authentication. Please sign in again.",
          });
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
    };
  }, [toast, navigate]);

  return { isLoading, isAuthenticated };
}