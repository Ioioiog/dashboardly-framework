import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export function useAuthState() {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log("Initializing auth state...");
        
        // Clear any potentially invalid session data
        const currentSession = localStorage.getItem('sb-wecmvyohaxizmnhuvjly-auth-token');
        if (currentSession && !JSON.parse(currentSession).access_token) {
          console.log("Clearing invalid session data");
          localStorage.removeItem('sb-wecmvyohaxizmnhuvjly-auth-token');
        }
        
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session error:", sessionError);
          if (mounted) {
            handleAuthError();
          }
          return;
        }

        if (!session?.access_token) {
          console.log("No valid session found");
          if (mounted) {
            handleAuthError();
          }
          return;
        }

        // Verify the session is still valid with a fresh API call
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
          console.error("User verification error:", userError);
          if (mounted) {
            handleAuthError();
          }
          return;
        }

        if (mounted && user) {
          console.log("Setting authenticated state for user:", user.id);
          setIsAuthenticated(true);
          setCurrentUserId(user.id);
        }

      } catch (error) {
        console.error("Authentication initialization error:", error);
        if (mounted) {
          handleAuthError();
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    const handleAuthError = async () => {
      setIsAuthenticated(false);
      setCurrentUserId(null);
      setIsLoading(false);
      
      // Clean up the session
      localStorage.removeItem('sb-wecmvyohaxizmnhuvjly-auth-token');
      try {
        await supabase.auth.signOut();
      } catch (error) {
        console.error("Error during signout:", error);
      }

      toast({
        title: "Session Expired",
        description: "Your session has expired. Please sign in again.",
        variant: "destructive",
      });

      navigate('/auth');
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event);
      
      if (event === 'SIGNED_OUT' || !session) {
        if (mounted) {
          setIsAuthenticated(false);
          setCurrentUserId(null);
          localStorage.removeItem('sb-wecmvyohaxizmnhuvjly-auth-token');
        }
        
        toast({
          title: "Signed Out",
          description: "You have been signed out.",
          variant: "default",
        });
        
        navigate('/auth');
      } else if (event === 'SIGNED_IN' && session?.user) {
        if (mounted) {
          setIsAuthenticated(true);
          setCurrentUserId(session.user.id);
        }
      } else if (event === 'TOKEN_REFRESHED' && session) {
        console.log("Session token refreshed");
        if (mounted) {
          setIsAuthenticated(true);
          setCurrentUserId(session.user.id);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate, toast]);

  return { currentUserId, isAuthenticated, isLoading };
}