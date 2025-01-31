import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { LandlordDashboard } from "@/components/dashboard/LandlordDashboard";
import { TenantDashboard } from "@/components/dashboard/TenantDashboard";
import { ServiceProviderDashboard } from "@/components/dashboard/ServiceProviderDashboard";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";

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
        console.log("Initializing authentication state...");
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session error:", sessionError);
          navigate("/auth");
          return;
        }

        if (!session) {
          console.log("No active session found, redirecting to auth");
          navigate("/auth");
          return;
        }

        const currentUserId = session.user.id;
        console.log("Current user ID:", currentUserId);
        setUserId(currentUserId);

        // Fetch profile with role
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role, first_name, last_name')
          .eq('id', currentUserId)
          .single();

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
        console.log("Setting user role:", profile.role);
        
        // Validate and set user role
        if (profile.role !== "landlord" && profile.role !== "tenant" && profile.role !== "service_provider") {
          console.error("Invalid role found:", profile.role);
          toast({
            title: "Error",
            description: "Invalid user role. Please contact support.",
            variant: "destructive",
          });
          return;
        }

        setUserRole(profile.role);
        
        // Set user name from profile
        const fullName = [profile.first_name, profile.last_name]
          .filter(Boolean)
          .join(" ");
        setUserName(fullName || "User");

        // If user is a tenant, fetch their tenancy information
        if (profile.role === 'tenant') {
          console.log("Fetching tenant information...");
          const { data: tenancy, error: tenancyError } = await supabase.rpc(
            'get_latest_tenancy',
            { p_tenant_id: currentUserId }
          );

          if (tenancyError) {
            console.error("Error fetching tenancy:", tenancyError);
            toast({
              title: "Error",
              description: "Failed to load tenancy information. Please try refreshing the page.",
              variant: "destructive",
            });
          } else if (tenancy && tenancy.length > 0) {
            console.log("Tenant information loaded:", tenancy[0]);
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
        return <ServiceProviderDashboard userId={userId} userName={userName} />;
      case "tenant":
        return <TenantDashboard userId={userId} userName={userName} tenantInfo={tenantInfo} />;
      case "landlord":
        return <LandlordDashboard userId={userId} userName={userName} />;
      default:
        console.error("Invalid user role:", userRole);
        return (
          <div className="p-4">
            <h1 className="text-xl font-semibold text-red-600">
              Invalid user role. Please contact support.
            </h1>
          </div>
        );
    }
  };

  return (
    <DashboardLayout>
      {renderDashboard()}
    </DashboardLayout>
  );
};

export default Index;