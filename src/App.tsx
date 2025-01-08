import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import AuthPage from "./pages/Auth";
import Properties from "./pages/Properties";
import Tenants from "./pages/Tenants";
import Maintenance from "./pages/Maintenance";
import Documents from "./pages/Documents";
import Settings from "./pages/Settings";
import Payments from "./pages/Payments";
import TenantRegistration from "./pages/TenantRegistration";
import { StrictMode, useEffect, useState } from "react";
import { supabase } from "./integrations/supabase/client";
import { useToast } from "./hooks/use-toast";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    },
  },
});

const handleRecoveryToken = async () => {
  const hash = window.location.hash;
  try {
    if (hash && hash.includes("type=recovery")) {
      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get("access_token");
      if (accessToken) {
        console.log("Setting session with recovery token");
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: params.get("refresh_token") || "",
        });
        if (error) {
          console.error("Error setting session:", error);
          return false;
        }
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error("Error handling recovery token:", error);
    return false;
  }
};

const App = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const hasRecoveryToken = await handleRecoveryToken();
        if (hasRecoveryToken) {
          console.log("Recovery token found, redirecting to update password");
          window.location.hash = "";
          window.location.href = "/auth?mode=update_password";
          return;
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log("Auth state changed:", event);
            if (event === 'SIGNED_OUT') {
              setIsAuthenticated(false);
              queryClient.clear();
            } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
              setIsAuthenticated(true);
            }
          }
        );

        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Error checking session:", error);
          toast({
            variant: "destructive",
            title: "Authentication Error",
            description: "There was a problem checking your session. Please try logging in again.",
          });
          setIsAuthenticated(false);
        } else {
          setIsAuthenticated(!!session);
        }

        setIsLoading(false);
        return () => subscription.unsubscribe();
      } catch (error) {
        console.error("Error in auth initialization:", error);
        setIsLoading(false);
        setIsAuthenticated(false);
      }
    };

    initializeAuth();
  }, [toast]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route 
                path="/auth" 
                element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <AuthPage />} 
              />
              <Route 
                path="/tenant-registration" 
                element={<TenantRegistration />} 
              />
              <Route
                path="/dashboard"
                element={isAuthenticated ? <Index /> : <Navigate to="/auth" replace />}
              />
              <Route
                path="/properties"
                element={isAuthenticated ? <Properties /> : <Navigate to="/auth" replace />}
              />
              <Route
                path="/tenants"
                element={isAuthenticated ? <Tenants /> : <Navigate to="/auth" replace />}
              />
              <Route
                path="/maintenance"
                element={isAuthenticated ? <Maintenance /> : <Navigate to="/auth" replace />}
              />
              <Route
                path="/documents"
                element={isAuthenticated ? <Documents /> : <Navigate to="/auth" replace />}
              />
              <Route
                path="/payments"
                element={isAuthenticated ? <Payments /> : <Navigate to="/auth" replace />}
              />
              <Route
                path="/settings"
                element={isAuthenticated ? <Settings /> : <Navigate to="/auth" replace />}
              />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </TooltipProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </StrictMode>
  );
};

export default App;