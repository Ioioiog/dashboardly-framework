import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AppRoutes } from "@/components/routing/AppRoutes";
import { useAuthState } from "@/hooks/useAuthState";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { InstallPWA } from "@/components/pwa/InstallPWA";
import { FloatingSettingsBox } from "@/components/settings/FloatingSettingsBox";
import "./App.css";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30000,
    },
  },
});

function App() {
  const { isLoading, isAuthenticated, setIsAuthenticated } = useAuthState();
  const { toast } = useToast();

  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log("Checking session validity...");
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Session error:", error);
          setIsAuthenticated(false);
          toast({
            title: "Session Error",
            description: "Your session has expired. Please sign in again.",
            variant: "destructive",
          });
          await supabase.auth.signOut();
          return;
        }

        if (!session) {
          console.log("No active session");
          setIsAuthenticated(false);
          return;
        }

        // Additional verification of the user
        const { error: userError } = await supabase.auth.getUser();
        if (userError) {
          console.error("User verification error:", userError);
          setIsAuthenticated(false);
          toast({
            title: "Session Error",
            description: "Your session has expired. Please sign in again.",
            variant: "destructive",
          });
          await supabase.auth.signOut();
          return;
        }

        console.log("Valid session found:", session.user.id);
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Session check error:", error);
        setIsAuthenticated(false);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event);
      if (event === 'SIGNED_OUT' || !session) {
        setIsAuthenticated(false);
        toast({
          title: "Signed Out",
          description: "You have been signed out. Please sign in again to continue.",
          variant: "destructive",
        });
      } else if (event === 'SIGNED_IN' && session) {
        setIsAuthenticated(true);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [toast, setIsAuthenticated]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRoutes isAuthenticated={isAuthenticated} />
        <InstallPWA />
        {isAuthenticated && <FloatingSettingsBox />}
        <Toaster />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;