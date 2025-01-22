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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

const Tenants = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [userId, setUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<"landlord" | "tenant" | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const { data: tenants = [], isLoading, error: tenantsError } = useTenants();
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
          <div className="max-w-7xl mx-auto space-y-6">
            <Skeleton className="h-12 w-1/3" />
            <Skeleton className="h-4 w-1/2" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-48" />
              ))}
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

  if (userRole !== "landlord") {
    return null;
  }

  return (
    <div className="flex bg-dashboard-background min-h-screen">
      <DashboardSidebar />
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <TenantsHeader userRole={userRole} properties={properties} />
          
          <Tabs defaultValue="list" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="list">List View</TabsTrigger>
              <TabsTrigger value="grid">Grid View</TabsTrigger>
            </TabsList>
            
            <TabsContent value="list" className="space-y-6">
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-24" />
                  ))}
                </div>
              ) : (
                <TenantList tenants={tenants} />
              )}
            </TabsContent>
            
            <TabsContent value="grid" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                  [1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-48" />
                  ))
                ) : (
                  tenants.map((tenant) => (
                    <div key={tenant.id} className="bg-white rounded-lg shadow p-6 space-y-4">
                      <h3 className="text-lg font-semibold">
                        {tenant.first_name} {tenant.last_name}
                      </h3>
                      <p className="text-sm text-gray-600">{tenant.email}</p>
                      <div className="text-sm">
                        <p className="font-medium">Property:</p>
                        <p>{tenant.property.name}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Tenants;