import { useState } from "react";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { MaintenanceList } from "@/components/maintenance/MaintenanceList";
import { MaintenanceDialog } from "@/components/maintenance/MaintenanceDialog";
import { useMaintenanceRequests } from "@/hooks/useMaintenanceRequests";
import { supabase } from "@/integrations/supabase/client";

const Maintenance = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { data: requests, isLoading } = useMaintenanceRequests();
  const [isLandlord, setIsLandlord] = useState(false);

  // Check if user is landlord when component mounts
  useState(() => {
    const checkUserRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      setIsLandlord(profile?.role === 'landlord');
    };

    checkUserRole();
  }, []);

  return (
    <div className="flex h-screen bg-gray-100">
      <DashboardSidebar />
      <main className="flex-1 p-8 ml-64">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Maintenance Requests</h1>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Request
          </Button>
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