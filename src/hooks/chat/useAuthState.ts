import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export function useAuthState() {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      try {
        console.log("Checking auth state...");
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session error:", sessionError);
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
          setCurrentUserId(session.user.id);
        }
      } catch (error) {
        console.error("Auth check error:", error);
        if (mounted) {
          handleAuthError();
        }
      }
    };

    const handleAuthError = async () => {
      setCurrentUserId(null);
      
      // Clean up the session
      try {
        await supabase.auth.signOut();
      } catch (error) {
        console.error("Error during signout:", error);
      }

      // Clear any stored tokens
      localStorage.removeItem('supabase.auth.token');
      localStorage.removeItem('sb-wecmvyohaxizmnhuvjly-auth-token');

      toast({
        title: "Session Expired",
        description: "Your session has expired. Please sign in again.",
        variant: "destructive",
      });

      navigate('/auth');
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event);
      
      if (event === 'SIGNED_OUT' || !session) {
        if (mounted) {
          handleAuthError();
        }
      } else if (event === 'SIGNED_IN' && session?.user) {
        if (mounted) {
          setCurrentUserId(session.user.id);
        }
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        if (mounted) {
          setCurrentUserId(session.user.id);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate, toast]);

  return { currentUserId };
}