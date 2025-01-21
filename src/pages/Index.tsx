import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { supabase } from "@/integrations/supabase/client";
import { DashboardMetrics } from "@/components/dashboard/DashboardMetrics";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { RevenuePrediction } from "@/components/dashboard/RevenuePrediction";
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
          // If there's an auth error, sign out and redirect
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
        setUserRole(profile.role as "landlord" | "tenant");
        
        // Set user name from profile
        const fullName = [profile.first_name, profile.last_name]
          .filter(Boolean)
          .join(" ");
        setUserName(fullName || "there");

      } catch (error: any) {
        console.error("Error in checkUser:", error);
        // If there's an auth error, redirect to login
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

  return (
    <div className="flex bg-dashboard-background min-h-screen">
      <DashboardSidebar />
      <main className="flex-1 ml-64 p-8 animate-fade-in">
        <div className="max-w-7xl mx-auto space-y-6">
          <header className="bg-white rounded-lg shadow-sm p-6">
            <h1 className="text-3xl font-semibold text-gray-900">
              {t('dashboard.title')}
            </h1>
            <p className="mt-2 text-dashboard-text">
              {t('dashboard.welcome')}, {userName}! {t('dashboard.overview')}
            </p>
          </header>

          {userId && userRole && (
            <div className="space-y-6">
              <section className="bg-white rounded-lg shadow-sm p-6">
                <DashboardMetrics userId={userId} userRole={userRole} />
              </section>

              {userRole === "landlord" && (
                <section className="bg-white rounded-lg shadow-sm p-6">
                  <div className="space-y-10">
                    <div className="border-b pb-6">
                      <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                        Revenue Overview
                      </h2>
                      <p className="mt-3 text-base text-dashboard-text-muted">
                        Track your revenue trends and future predictions with detailed insights
                      </p>
                    </div>
                    <div className="space-y-12">
                      <div>
                        <div className="mb-6">
                          <h3 className="text-2xl font-semibold text-gray-800">
                            Revenue History
                          </h3>
                          <p className="mt-2 text-sm text-dashboard-text-muted">
                            Historical view of your monthly revenue performance
                          </p>
                        </div>
                        <div className="bg-dashboard-accent rounded-lg p-6">
                          <RevenueChart userId={userId} />
                        </div>
                      </div>
                      <div>
                        <div className="mb-6">
                          <h3 className="text-2xl font-semibold text-gray-800">
                            Revenue Forecast
                          </h3>
                          <p className="mt-2 text-sm text-dashboard-text-muted">
                            Projected revenue based on historical data and trends
                          </p>
                        </div>
                        <div className="bg-dashboard-accent rounded-lg p-6">
                          <RevenuePrediction userId={userId} />
                        </div>
                      </div>
                    </div>
                  </div>
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
