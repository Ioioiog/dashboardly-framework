import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { MaintenanceList } from "@/components/maintenance/MaintenanceList";
import { MaintenanceDialog } from "@/components/maintenance/MaintenanceDialog";
import { useMaintenanceRequests } from "@/hooks/useMaintenanceRequests";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Maintenance = () => {
  const { t } = useTranslation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLandlord, setIsLandlord] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: requests, isLoading } = useMaintenanceRequests();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("Session error:", sessionError);
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "Please sign in again.",
        });
        navigate("/auth");
        return;
      }

      if (!session) {
        console.log("No active session, redirecting to auth");
        navigate("/auth");
        return;
      }

      try {
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
        setIsLandlord(profile?.role === 'landlord');
      } catch (error) {
        console.error("Error checking user role:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load user profile.",
        });
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
          {!isLandlord && (
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              {t('maintenance.newRequest')}
            </Button>
          )}
        </div>

        <MaintenanceList 
          requests={requests} 
          isLoading={isLoading} 
          isLandlord={isLandlord}
        />
        <MaintenanceDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
      </main>
    </div>
  );
};

export default Maintenance;