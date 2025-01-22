import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

interface ProtectedRouteProps {
  isAuthenticated: boolean;
  children: React.ReactNode;
  redirectTo?: string;
}

export function ProtectedRoute({ 
  isAuthenticated, 
  children, 
  redirectTo = "/auth" 
}: ProtectedRouteProps) {
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      try {
        console.log("Verifying session validity...");
        
        // First try to get the session from storage
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (!mounted) return;

        if (sessionError) {
          console.error("Session verification error:", sessionError);
          handleSessionError();
          return;
        }

        if (!session?.access_token) {
          console.log("No valid session found");
          handleSessionError();
          return;
        }

        // Verify the session is still valid by attempting to get the user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
          console.error("User verification error:", userError);
          handleSessionError();
          return;
        }

        console.log("Session verified successfully for user:", user.id);
      } catch (error) {
        console.error("Session verification error:", error);
        if (mounted) {
          handleSessionError();
        }
      }
    };

    const handleSessionError = async () => {
      // Clear any stored session data
      localStorage.removeItem('sb-wecmvyohaxizmnhuvjly-auth-token');
      
      try {
        // Sign out the user
        await supabase.auth.signOut();
      } catch (error) {
        console.error("Error during signout:", error);
      }
      
      if (mounted) {
        toast({
          title: "Session Expired",
          description: "Your session has expired. Please sign in again.",
          variant: "destructive",
        });
      }
    };

    if (isAuthenticated) {
      checkSession();
    }

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, "Session:", session ? "exists" : "null");
      
      if (event === 'SIGNED_OUT' || !session) {
        console.log("User signed out or session expired");
        localStorage.removeItem('sb-wecmvyohaxizmnhuvjly-auth-token');
      } else if (event === 'TOKEN_REFRESHED') {
        console.log("Session token refreshed successfully");
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [isAuthenticated, toast]);

  if (!isAuthenticated) {
    console.log("User not authenticated, redirecting to:", redirectTo);
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}