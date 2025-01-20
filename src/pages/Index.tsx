import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { supabase } from "@/integrations/supabase/client";
import { DashboardMetrics } from "@/components/dashboard/DashboardMetrics";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { DashboardProperties } from "@/components/dashboard/DashboardProperties";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [userId, setUserId] = React.useState<string | null>(null);
  const [userRole, setUserRole] = React.useState<"landlord" | "tenant" | null>(null);
  const [userName, setUserName] = React.useState<string>("");

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

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role, first_name, last_name')
          .eq('id', currentUserId)
          .maybeSingle();

        if (profileError) {
          console.error("Profile fetch error:", profileError);
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
        setUserRole(profile.role as "landlord" | "tenant");
        
        const fullName = [profile.first_name, profile.last_name]
          .filter(Boolean)
          .join(" ");
        setUserName(fullName || "there");

      } catch (error: any) {
        console.error("Error in checkUser:", error);
        toast({
          title: "Error",
          description: error.message || "An unexpected error occurred",
          variant: "destructive",
        });
      }
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state changed:", event);
        if (!session) {
          navigate("/auth");
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate, toast]);

  return (
    <div className="flex min-h-screen bg-dashboard-background">
      <DashboardSidebar />
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-[1600px] mx-auto space-y-6">
          <header className="flex items-center justify-between pb-6">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                {t('dashboard.title')}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {t('dashboard.welcome')}, {userName}! {t('dashboard.overview')}
              </p>
            </div>
          </header>

          {userId && userRole && (
            <div className="grid gap-6">
              <section>
                <DashboardMetrics userId={userId} userRole={userRole} />
              </section>
              
              <section className="grid gap-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold tracking-tight">
                    {t('navigation.properties')}
                  </h2>
                </div>
                <div className="rounded-xl border bg-card p-6">
                  <DashboardProperties userRole={userRole} />
                </div>
              </section>
              
              {userRole === "landlord" && (
                <section className="grid gap-4">
                  <RevenueChart userId={userId} />
                </section>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;