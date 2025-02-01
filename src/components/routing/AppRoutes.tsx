import { Route, Routes } from "react-router-dom";
import AuthPage from "@/pages/Auth";
import Properties from "@/pages/Properties";
import Tenants from "@/pages/Tenants";
import Documents from "@/pages/Documents";
import Settings from "@/pages/Settings";
import Financial from "@/pages/Financial";
import Utilities from "@/pages/Utilities";
import Chat from "@/pages/Chat";
import Maintenance from "@/pages/Maintenance";
import MeterReadings from "@/pages/MeterReadings";
import ServiceProviderProfile from "@/pages/ServiceProviderProfile";
import ServiceAreas from "@/pages/ServiceAreas";
import Services from "@/pages/Services";
import Earnings from "@/pages/Earnings";
import ServiceProviderDashboard from "@/pages/ServiceProviderDashboard";
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
      <Route path="/tenant-registration" element={<TenantRegistration />} />
      
      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <Index />
          </ProtectedRoute>
        }
      />
      <Route
        path="/service-provider-profile"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <ServiceProviderProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/service-areas"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <ServiceAreas />
          </ProtectedRoute>
        }
      />
      <Route
        path="/services"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <Services />
          </ProtectedRoute>
        }
      />
      <Route
        path="/earnings"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <Earnings />
          </ProtectedRoute>
        }
      />
      
      {/* Standard Routes */}
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
        path="/financial"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <Financial />
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
        path="/meter-readings"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <MeterReadings />
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
        path="/maintenance"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <Maintenance />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}