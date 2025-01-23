import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useAuthState() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log("Initializing authentication state...");
        
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Error with existing session:', sessionError);
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

        // Fetch user profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error("Error fetching profile:", profileError);
          toast({
            title: "Error loading profile",
            description: "There was a problem loading your profile. Please try again.",
            variant: "destructive",
          });
        } else {
          console.log("Profile loaded successfully:", profileData);
          if (mounted) {
            setProfile(profileData);
          }
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
      setProfile(null);
      setIsLoading(false);
      
      // Clean up the session
      localStorage.removeItem('sb-wecmvyohaxizmnhuvjly-auth-token');
      try {
        await supabase.auth.signOut();
      } catch (error) {
        console.error("Error during signout:", error);
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
          setProfile(null);
          localStorage.removeItem('sb-wecmvyohaxizmnhuvjly-auth-token');
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
          // Fetch profile after sign in
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (!profileError && profileData) {
            setProfile(profileData);
          }
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [toast]);

  return { isLoading, isAuthenticated, currentUserId, profile };
}