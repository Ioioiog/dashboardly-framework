import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import AuthPage from "./pages/Auth";
import Properties from "./pages/Properties";
import Tenants from "./pages/Tenants";
import AcceptInvitation from "./pages/AcceptInvitation";
import { StrictMode, useEffect } from "react";
import { supabase } from "./integrations/supabase/client";

const queryClient = new QueryClient();

// Helper function to handle the recovery token
const handleRecoveryToken = async () => {
  const hash = window.location.hash;
  if (hash && hash.includes("type=recovery")) {
    const params = new URLSearchParams(hash.substring(1));
    const accessToken = params.get("access_token");
    if (accessToken) {
      console.log("Setting session with recovery token");
      const { data, error } = await supabase.auth.setSession({
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
};

const App = () => {
  // Handle recovery token when the app loads
  useEffect(() => {
    const checkRecoveryToken = async () => {
      const hasRecoveryToken = await handleRecoveryToken();
      if (hasRecoveryToken) {
        console.log("Recovery token found, redirecting to update password");
        // Clear the URL hash after handling the token
        window.location.hash = "";
        // Redirect to the update password page
        window.location.href = "/auth?mode=update_password";
      }
    };
    checkRecoveryToken();
  }, []);

  return (
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/dashboard" element={<Index />} />
              <Route path="/properties" element={<Properties />} />
              <Route path="/tenants" element={<Tenants />} />
              <Route path="/accept-invitation" element={<AcceptInvitation />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </TooltipProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </StrictMode>
  );
};

export default App;