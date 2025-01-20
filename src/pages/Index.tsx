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

        // Fetch profile with explicit filter for current user
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
        
        // Set user name from profile
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
    <div className="flex bg-dashboard-background min-h-screen">
      <DashboardSidebar />
      <main className="flex-1 ml-64 p-8 animate-fade-in">
        <div className="max-w-7xl mx-auto space-y-8">
          <header className="relative pb-8 border-b border-border/10">
            <div className="flex flex-col space-y-2">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                {t('dashboard.title')}
              </h1>
              <p className="text-muted-foreground">
                {t('dashboard.welcome')}, {userName}! {t('dashboard.overview')}
              </p>
            </div>
          </header>

          {userId && userRole && (
            <div className="space-y-10">
              <section>
                <DashboardMetrics userId={userId} userRole={userRole} />
              </section>
              
              <section className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold tracking-tight">
                    {t('navigation.properties')}
                  </h2>
                </div>
                <DashboardProperties userRole={userRole} />
              </section>
              
              {userRole === "landlord" && (
                <section className="space-y-6">
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