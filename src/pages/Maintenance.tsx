import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { MaintenanceList } from "@/components/maintenance/MaintenanceList";
import { useMaintenanceRequests } from "@/hooks/useMaintenanceRequests";
import { MaintenanceDialog } from "@/components/maintenance/MaintenanceDialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useUserRole } from "@/hooks/use-user-role";
import { useState } from "react";

const Maintenance = () => {
  const { t } = useTranslation();
  const { data: requests, isLoading } = useMaintenanceRequests();
  const { userRole } = useUserRole();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Only tenants can create new maintenance requests
  const showNewRequestButton = userRole === "tenant";

  return (
    <div className="flex h-screen bg-gray-100">
      <DashboardSidebar />
      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">
            {t('maintenance.title')}
          </h1>
          {showNewRequestButton && (
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              {t('maintenance.newRequest')}
            </Button>
          )}
        </div>

        <MaintenanceList 
          requests={requests} 
          isLoading={isLoading} 
          isLandlord={userRole === "landlord"}
        />

        <MaintenanceDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
        />
      </main>
    </div>
  );
};

export default Maintenance;