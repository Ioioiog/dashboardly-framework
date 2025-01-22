import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./use-toast";

export function useAuthState() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log("Initializing authentication state...");
        
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Error with existing session:', sessionError);
          if (mounted) {
            setIsAuthenticated(false);
            setCurrentUserId(null);
            setIsLoading(false);
          }
          await supabase.auth.signOut();
          return;
        }

        if (session?.user) {
          console.log("Valid session found for user:", session.user.id);
          if (mounted) {
            setIsAuthenticated(true);
            setCurrentUserId(session.user.id);
          }
        } else {
          console.log("No active session found");
          if (mounted) {
            setIsAuthenticated(false);
            setCurrentUserId(null);
          }
          await supabase.auth.signOut();
        }

        if (mounted) {
          setIsLoading(false);
        }

      } catch (error) {
        console.error("Authentication initialization error:", error);
        if (mounted) {
          setIsLoading(false);
          setIsAuthenticated(false);
          setCurrentUserId(null);
        }
        await supabase.auth.signOut();
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, "Session:", session ? "exists" : "null");
      
      if (event === 'SIGNED_OUT' || !session) {
        console.log("User signed out or session expired");
        if (mounted) {
          setIsAuthenticated(false);
          setCurrentUserId(null);
        }
        
        toast({
          title: "Session Ended",
          description: "Your session has ended. Please sign in again.",
          variant: "destructive",
        });

      } else if (event === 'SIGNED_IN' && session) {
        console.log("User signed in successfully");
        if (mounted) {
          setIsAuthenticated(true);
          setCurrentUserId(session.user.id);
        }
      } else if (event === 'TOKEN_REFRESHED') {
        console.log("Session token refreshed");
        if (session) {
          setCurrentUserId(session.user.id);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [toast]);

  return { isLoading, isAuthenticated, currentUserId };
}