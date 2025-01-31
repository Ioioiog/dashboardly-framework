import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { supabase } from "@/integrations/supabase/client";
import { DashboardMetrics } from "@/components/dashboard/DashboardMetrics";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { DashboardHeader } from "@/components/dashboard/sections/DashboardHeader";
import { RevenueSection } from "@/components/dashboard/sections/RevenueSection";
import { UpcomingIncomeSection } from "@/components/dashboard/sections/UpcomingIncomeSection";
import ServiceProviderDashboard from "./ServiceProviderDashboard";
import { TenantDashboard } from "@/components/tenants/TenantDashboard";

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [userId, setUserId] = React.useState<string | null>(null);
  const [userRole, setUserRole] = React.useState<"landlord" | "tenant" | "service_provider" | null>(null);
  const [userName, setUserName] = React.useState<string>("");
  const [tenantInfo, setTenantInfo] = React.useState<any>(null);

  useEffect(() => {
    const checkUser = async () => {
      try {
        console.log("Checking user session...");
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session error:", sessionError);
          throw sessionError;
        }

        if (!session) {
          console.log("No active session found, redirecting to auth");
          navigate("/auth");
          return;
        }

        const currentUserId = session.user.id;
        console.log("Current user ID:", currentUserId);
        setUserId(currentUserId);

        // Fetch profile with explicit filter for current user
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role, first_name, last_name')
          .eq('id', currentUserId)
          .maybeSingle();

        if (profileError) {
          console.error("Profile fetch error:", profileError);
          if (profileError.code === 'PGRST301') {
            await supabase.auth.signOut();
            navigate("/auth");
            return;
          }
          toast({
            title: "Error",
            description: "Failed to load user profile. Please try refreshing the page.",
            variant: "destructive",
          });
          return;
        }

        if (!profile) {
          console.error("No profile found for user");
          toast({
            title: "Error",
            description: "User profile not found. Please contact support.",
            variant: "destructive",
          });
          return;
        }

        console.log("Profile loaded successfully:", profile);
        console.log("User role from profile:", profile.role);
        
        // Validate and set user role
        const validRole = profile.role === "landlord" || profile.role === "tenant" || profile.role === "service_provider"
          ? profile.role
          : null;
          
        setUserRole(validRole);
        
        // Set user name from profile
        const fullName = [profile.first_name, profile.last_name]
          .filter(Boolean)
          .join(" ");
        setUserName(fullName || "there");

        // If user is a tenant, fetch their tenancy information
        if (profile.role === 'tenant') {
          const { data: tenancy, error: tenancyError } = await supabase.rpc(
            'get_latest_tenancy',
            { tenant_id: currentUserId }
          );

          if (tenancyError) {
            console.error("Error fetching tenancy:", tenancyError);
          } else if (tenancy && tenancy.length > 0) {
            setTenantInfo(tenancy[0]);
          }
        }

      } catch (error: any) {
        console.error("Error in checkUser:", error);
        if (error.status === 401 || error.code === 'PGRST301') {
          navigate("/auth");
          return;
        }
        toast({
          title: "Error",
          description: error.message || "An unexpected error occurred",
          variant: "destructive",
        });
      }
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event);
        if (event === 'SIGNED_OUT' || !session) {
          navigate("/auth");
          return;
        }
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          await checkUser();
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate, toast, t]);

  // Render different dashboards based on user role
  const renderDashboard = () => {
    if (!userId || !userRole) {
      console.log("No userId or userRole available");
      return null;
    }

    console.log("Rendering dashboard for role:", userRole);

    switch (userRole) {
      case "service_provider":
        return <ServiceProviderDashboard />;
      case "tenant":
        return tenantInfo ? (
          <div className="p-4 space-y-4">
            <DashboardHeader userName={userName} />
            <TenantDashboard tenantInfo={tenantInfo} />
            <section className="bg-white rounded-lg shadow-sm p-4">
              <DashboardMetrics userId={userId} userRole={userRole} />
            </section>
          </div>
        ) : (
          <div className="p-4">
            <p>Loading tenant information...</p>
          </div>
        );
      case "landlord":
        return (
          <div className="p-4 space-y-4">
            <DashboardHeader userName={userName} />
            <section className="bg-white rounded-lg shadow-sm p-4">
              <DashboardMetrics userId={userId} userRole={userRole} />
            </section>
            <RevenueSection userId={userId} />
            <UpcomingIncomeSection userId={userId} />
          </div>
        );
      default:
        console.error("Invalid user role:", userRole);
        return null;
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-dashboard-background">
      <DashboardSidebar />
      <main className="flex-1 overflow-y-auto">
        {renderDashboard()}
      </main>
    </div>
  );
}

export default Index;