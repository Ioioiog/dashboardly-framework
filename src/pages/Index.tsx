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
import { Button } from "@/components/ui/button";

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

  const testNotifications = async () => {
    try {
      console.log("Testing notifications system...");

      // Test toast notifications
      toast({
        title: "Default Toast",
        description: "This is a default toast notification",
      });

      setTimeout(() => {
        toast({
          title: "Success Toast",
          description: "This is a success toast notification",
          variant: "default",
        });
      }, 1000);

      setTimeout(() => {
        toast({
          title: "Error Toast",
          description: "This is an error toast notification",
          variant: "destructive",
        });
      }, 2000);

      // Test sidebar notifications by creating test records
      if (userId) {
        // Create a test maintenance request
        const { error: maintenanceError } = await supabase
          .from('maintenance_requests')
          .insert({
            property_id: '00000000-0000-0000-0000-000000000000', // This will fail intentionally
            tenant_id: userId,
            title: 'Test Maintenance Request',
            description: 'This is a test maintenance request',
            status: 'pending'
          });

        if (maintenanceError) {
          console.log("Expected maintenance error (for testing):", maintenanceError);
          toast({
            title: "Maintenance Test",
            description: "Maintenance notification test triggered",
          });
        }

        // Create a test message
        const { error: messageError } = await supabase
          .from('messages')
          .insert({
            sender_id: userId,
            receiver_id: userId, // Send to self for testing
            content: 'Test message',
            profile_id: userId,
            read: false
          });

        if (messageError) {
          console.log("Message creation error:", messageError);
        } else {
          console.log("Test message created successfully");
        }
      }

    } catch (error) {
      console.error("Error testing notifications:", error);
      toast({
        title: "Error",
        description: "Failed to test notifications",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-dashboard-background">
      <DashboardSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          <DashboardHeader userName={userName} />

          {userId && userRole && (
            <div className="space-y-4">
              <section className="bg-white rounded-lg shadow-sm p-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Dashboard Overview</h2>
                  <Button 
                    onClick={testNotifications}
                    variant="outline"
                    className="ml-auto"
                  >
                    Test Notifications
                  </Button>
                </div>
                <DashboardMetrics userId={userId} userRole={userRole} />
              </section>

              {userRole === "landlord" && (
                <>
                  <RevenueSection userId={userId} />
                  <UpcomingIncomeSection userId={userId} />
                </>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Index;
