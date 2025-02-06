import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useUserRole } from "@/hooks/use-user-role";

interface MaintenanceHeaderProps {
  onNewRequest: () => void;
}

export function MaintenanceHeader({ onNewRequest }: MaintenanceHeaderProps) {
  const { t } = useTranslation();
  const { userRole } = useUserRole();

  // Only show create button for tenants and landlords
  const showCreateButton = userRole === "tenant" || userRole === "landlord";

  const handleNewRequest = () => {
    console.log("New request button clicked");
    onNewRequest();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">
            {t("maintenance.myRequests")}
          </h1>
          <p className="text-gray-500 mt-2">
            {t("maintenance.createAndTrack")}
          </p>
        </div>
        {showCreateButton && (
          <Button 
            onClick={handleNewRequest}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            {t("maintenance.newRequest")}
          </Button>
        )}
      </div>
    </div>
  );
}