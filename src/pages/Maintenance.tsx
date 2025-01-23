import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { MaintenanceList } from "@/components/maintenance/MaintenanceList";
import { useMaintenanceRequests } from "@/hooks/useMaintenanceRequests";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Maintenance = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: requests, isLoading } = useMaintenanceRequests();

  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log("Checking authentication status...");
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

        console.log("Fetching user profile...");
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (profileError) {
          console.error("Error fetching profile:", profileError);
          throw profileError;
        }

        console.log("User role:", profile?.role);
        
        // If not a landlord, redirect to home
        if (profile?.role !== 'landlord') {
          console.log("User is not a landlord, redirecting to home");
          navigate("/");
          toast({
            title: "Access Denied",
            description: "You don't have permission to access this page.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error checking user role:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load user profile.",
        });
        navigate("/auth");
      }
    };

    checkSession();
  }, [navigate, toast]);

  return (
    <div className="flex h-screen bg-gray-100">
      <DashboardSidebar />
      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">
            {t('maintenance.title')}
          </h1>
        </div>

        <MaintenanceList 
          requests={requests} 
          isLoading={isLoading} 
          isLandlord={true}
        />
      </main>
    </div>
  );
};

export default Maintenance;