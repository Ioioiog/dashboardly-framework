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
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;

        if (error) {
          console.error("Session verification error:", error);
          toast({
            title: "Session Error",
            description: "There was a problem verifying your session. Please sign in again.",
            variant: "destructive",
          });
          await supabase.auth.signOut();
          return;
        }

        if (!session) {
          console.log("No valid session found");
          await supabase.auth.signOut();
          return;
        }

        // Refresh session if it exists
        const { error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError) {
          console.error("Session refresh error:", refreshError);
          toast({
            title: "Session Error",
            description: "Unable to refresh your session. Please sign in again.",
            variant: "destructive",
          });
          await supabase.auth.signOut();
          return;
        }

        console.log("Session verified successfully");
      } catch (error) {
        console.error("Session verification error:", error);
        if (mounted) {
          toast({
            title: "Authentication Error",
            description: "There was a problem verifying your session. Please sign in again.",
            variant: "destructive",
          });
          await supabase.auth.signOut();
        }
      }
    };

    if (isAuthenticated) {
      checkSession();
    }

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event);
      if (event === 'SIGNED_OUT' || !session) {
        console.log("User signed out or session expired");
        if (mounted) {
          toast({
            title: "Session Ended",
            description: "Your session has ended. Please sign in again.",
            variant: "destructive",
          });
        }
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