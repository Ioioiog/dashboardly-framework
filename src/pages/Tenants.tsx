import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { useToast } from "@/hooks/use-toast";
import { TenantList } from "@/components/tenants/TenantList";
import { useTenants } from "@/hooks/useTenants";
import { Property } from "@/utils/propertyUtils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TenantsHeader } from "@/components/tenants/TenantsHeader";
import { TenantDashboard } from "@/components/tenants/TenantDashboard";
import { NoTenancy } from "@/components/tenants/NoTenancy";
import { useTranslation } from "react-i18next";

const Tenants = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [userId, setUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<"landlord" | "tenant" | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const { data: tenants = [], isLoading, error: tenantsError } = useTenants();
  const [tenantInfo, setTenantInfo] = useState<any>(null);
  const [isCheckingProfile, setIsCheckingProfile] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        console.log("Checking user session...");
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          console.error("Session error:", sessionError);
          throw sessionError;
        }

        if (!session) {
          console.log("No active session found, redirecting to auth");
          navigate("/auth");
          return;
        }

        setUserId(session.user.id);
        console.log("User ID set:", session.user.id);

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .maybeSingle();

        if (profileError) {
          console.error("Profile fetch error:", profileError);
          throw profileError;
        }

        if (!profile) {
          console.log("No profile found");
          return;
        }

        console.log("Profile role:", profile.role);
        setUserRole(profile.role as "landlord" | "tenant");

        // Redirect tenants to dashboard
        if (profile.role === "tenant") {
          console.log("User is tenant, redirecting to dashboard");
          navigate("/dashboard");
          return;
        }

        setIsCheckingProfile(false);

        if (profile.role === "landlord") {
          console.log("Fetching properties for landlord");
          const { data: propertiesData, error: propertiesError } = await supabase
            .from("properties")
            .select("*")
            .eq("landlord_id", session.user.id);

          if (propertiesError) {
            console.error("Properties fetch error:", propertiesError);
            throw propertiesError;
          }

          console.log("Properties fetched:", propertiesData?.length);
          setProperties(propertiesData || []);
        }
      } catch (error: any) {
        console.error("Error in checkUser:", error);
        toast({
          title: t('common.error'),
          description: error.message || t('common.unexpectedError'),
          variant: "destructive",
        });
      }
    };

    checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event);
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, toast, t]);

  if (isCheckingProfile) {
    return (
      <div className="flex bg-dashboard-background min-h-screen">
        <DashboardSidebar />
        <main className="flex-1 ml-64 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!userId || !userRole) return null;

  if (tenantsError) {
    return (
      <div className="flex bg-dashboard-background min-h-screen">
        <DashboardSidebar />
        <main className="flex-1 ml-64 p-8">
          <Alert variant="destructive">
            <AlertDescription>
              {t('tenants.error.loading')}
            </AlertDescription>
          </Alert>
        </main>
      </div>
    );
  }

  // Only render for landlords
  if (userRole !== "landlord") {
    return null;
  }

  return (
    <div className="flex bg-dashboard-background min-h-screen">
      <DashboardSidebar />
      <main className="flex-1 ml-64 p-8 animate-fade-in">
        <div className="max-w-7xl mx-auto">
          <TenantsHeader userRole={userRole} properties={properties} />
          <div className="space-y-8">
            <TenantList tenants={tenants} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Tenants;