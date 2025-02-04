import React from "react";
import { Card } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import MaintenanceList from "../MaintenanceList";

interface MaintenanceRequest {
  id: string;
  title: string;
  status: "pending" | "in_progress" | "completed" | "cancelled";
  priority: "low" | "medium" | "high";
  created_at: string;
  updated_at: string;
  property: { name: string };
  tenant: { first_name: string; last_name: string };
  description: string;
}

interface MaintenanceBoardProps {
  requests: MaintenanceRequest[];
  isLoading: boolean;
  onRequestClick: (requestId: string) => void;
}

export function MaintenanceBoard({ requests, isLoading, onRequestClick }: MaintenanceBoardProps) {
  const { t } = useTranslation();

  const openRequests = requests.filter(r => r.status === "pending");
  const inProgressRequests = requests.filter(r => r.status === "in_progress");
  const actionNeededRequests = requests.filter(r => 
    r.status !== "completed" && r.status !== "cancelled"
  );

  const renderColumn = (
    title: string,
    description: string,
    columnRequests: MaintenanceRequest[]
  ) => (
    <div className="flex-1">
      <Card className="h-full p-4">
        <h2 className="text-xl font-semibold mb-2">{title}</h2>
        <p className="text-sm text-gray-500 mb-4">{description}</p>
        <div className="space-y-4">
          <MaintenanceList
            requests={columnRequests}
            isLoading={isLoading}
            onRequestClick={onRequestClick}
          />
        </div>
      </Card>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
      {renderColumn(
        t("maintenance.openRequests"),
        t("maintenance.openRequestsDescription"),
        openRequests
      )}
      {renderColumn(
        t("maintenance.inProgress"),
        t("maintenance.inProgressDescription"),
        inProgressRequests
      )}
      {renderColumn(
        t("maintenance.actionNeeded"),
        t("maintenance.actionNeededDescription"),
        actionNeededRequests
      )}
    </div>
  );
}