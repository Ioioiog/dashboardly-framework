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
    const checkSession = async () => {
      try {
        console.log("Verifying session validity...");
        const { data: { session }, error } = await supabase.auth.getSession();
        
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

        console.log("Session verified successfully for user:", session.user.id);
      } catch (error) {
        console.error("Session verification error:", error);
        toast({
          title: "Authentication Error",
          description: "There was a problem verifying your session. Please sign in again.",
          variant: "destructive",
        });
        await supabase.auth.signOut();
      }
    };

    if (isAuthenticated) {
      checkSession();
    }

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, "Session:", session ? "exists" : "null");
      
      if (event === 'SIGNED_OUT' || !session) {
        console.log("User signed out or session expired");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [isAuthenticated, toast]);

  if (!isAuthenticated) {
    console.log("User not authenticated, redirecting to:", redirectTo);
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}