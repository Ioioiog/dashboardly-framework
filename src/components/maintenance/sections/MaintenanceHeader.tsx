import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, Wrench } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useUserRole } from "@/hooks/use-user-role";

interface MaintenanceHeaderProps {
  onNewRequest: () => void;
}

export function MaintenanceHeader({ onNewRequest }: MaintenanceHeaderProps) {
  const { t } = useTranslation();
  const { userRole } = useUserRole();

  return (
    <div className="flex justify-between items-center bg-white rounded-lg p-6 shadow-sm">
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-600 rounded-xl">
            <Wrench className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">
            {t("maintenance.title")}
          </h1>
        </div>
        <p className="text-gray-500 max-w-2xl">
          {t("maintenance.description")}
        </p>
      </div>
      {userRole === "tenant" && (
        <Button 
          onClick={onNewRequest}
          className="bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          {t("maintenance.newRequest")}
        </Button>
      )}
    </div>
  );
}