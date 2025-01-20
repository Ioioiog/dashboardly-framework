import { Navigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

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
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Session check error:", error);
          toast({
            title: "Authentication Error",
            description: "Please sign in again",
            variant: "destructive",
          });
          
          // Clear any stale auth data
          await supabase.auth.signOut();
          localStorage.removeItem('supabase.auth.token');
        }

        if (!session) {
          console.log("No active session found");
          // Attempt to refresh the session
          const { error: refreshError } = await supabase.auth.refreshSession();
          if (refreshError) {
            console.error("Session refresh failed:", refreshError);
          }
        }
      } catch (error) {
        console.error("Failed to check session:", error);
        toast({
          title: "Connection Error",
          description: "Unable to verify authentication. Please check your connection.",
          variant: "destructive",
        });
      }
    };

    checkSession();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed in ProtectedRoute:", event);
      if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
        localStorage.removeItem('supabase.auth.token');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [toast]);

  if (!isAuthenticated) {
    console.log("User not authenticated, redirecting to:", redirectTo);
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}