import { Route, Routes } from "react-router-dom";
import AuthPage from "@/pages/Auth";
import Properties from "@/pages/Properties";
import Tenants from "@/pages/Tenants";
import Documents from "@/pages/Documents";
import Settings from "@/pages/Settings";
import Payments from "@/pages/Payments";
import Utilities from "@/pages/Utilities";
import Chat from "@/pages/Chat";
import Invoices from "@/pages/Invoices";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import TenantRegistration from "@/pages/TenantRegistration";
import { ResetPassword } from "@/components/auth/ResetPassword";
import { UpdatePassword } from "@/components/auth/UpdatePassword";
import Index from "@/pages/Index";

interface AppRoutesProps {
  isAuthenticated: boolean;
}

export function AppRoutes({ isAuthenticated }: AppRoutesProps) {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/update-password" element={<UpdatePassword />} />
      <Route
        path="/tenant-registration"
        element={<TenantRegistration />}
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <Index />
          </ProtectedRoute>
        }
      />
      <Route
        path="/properties"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <Properties />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tenants"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <Tenants />
          </ProtectedRoute>
        }
      />
      <Route
        path="/documents"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <Documents />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <Settings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/payments"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <Payments />
          </ProtectedRoute>
        }
      />
      <Route
        path="/utilities"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <Utilities />
          </ProtectedRoute>
        }
      />
      <Route
        path="/chat"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <Chat />
          </ProtectedRoute>
        }
      />
      <Route
        path="/invoices"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <Invoices />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}