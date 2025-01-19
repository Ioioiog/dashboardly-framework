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
import Utilities from "./pages/Utilities";
import TenantRegistration from "./pages/TenantRegistration";
import Invoices from "./pages/Invoices";
import { StrictMode, useEffect, useState } from "react";
import { supabase } from "./integrations/supabase/client";
import { useToast } from "./hooks/use-toast";
import "./i18n/config";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (error instanceof Error && error.message.includes('404')) {
          return false;
        }
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    },
  },
});

const AppContent = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log("Initializing authentication...");

        // Clear any existing invalid sessions
        const { data: { session: currentSession }, error: sessionCheckError } = await supabase.auth.getSession();
        if (sessionCheckError || !currentSession) {
          console.log("No valid session found, clearing state");
          await supabase.auth.signOut();
          if (mounted) {
            setIsAuthenticated(false);
            setIsLoading(false);
          }
          return;
        }

        // Set up auth state change listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log("Auth state changed:", event);
            
            if (event === 'SIGNED_OUT') {
              console.log("User signed out");
              if (mounted) {
                setIsAuthenticated(false);
                queryClient.clear();
              }
            } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
              console.log("User signed in or token refreshed");
              if (mounted) {
                setIsAuthenticated(true);
              }
            }
          }
        );

        // Verify the user exists
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (!mounted) {
          subscription.unsubscribe();
          return;
        }

        if (userError || !user) {
          console.error("User verification failed:", userError);
          await supabase.auth.signOut();
          setIsAuthenticated(false);
          setIsLoading(false);
          subscription.unsubscribe();
          return;
        }

        console.log("Authentication initialized successfully");
        if (mounted) {
          setIsAuthenticated(true);
          setIsLoading(false);
        }

        return () => {
          subscription.unsubscribe();
        };

      } catch (error) {
        console.error("Authentication initialization error:", error);
        if (mounted) {
          setIsLoading(false);
          setIsAuthenticated(false);
          toast({
            variant: "destructive",
            title: "Authentication Error",
            description: "There was a problem with authentication. Please try logging in again.",
          });
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
    };
  }, [toast]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
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
          path="/utilities"
          element={isAuthenticated ? <Utilities /> : <Navigate to="/auth" replace />}
        />
        <Route
          path="/settings"
          element={isAuthenticated ? <Settings /> : <Navigate to="/auth" replace />}
        />
        <Route
          path="/invoices"
          element={isAuthenticated ? <Invoices /> : <Navigate to="/auth" replace />}
        />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </TooltipProvider>
  );
};

const App = () => {
  return (
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </QueryClientProvider>
    </StrictMode>
  );
};

export default App;
