import React from "react";
import { Card } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/use-user-role";
import { useAuthState } from "@/hooks/useAuthState";
import { ChartSkeleton } from "@/components/dashboard/charts/ChartSkeleton";
import { NoDataCard } from "@/components/dashboard/charts/NoDataCard";

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
  const { userRole } = useUserRole();
  const { currentUserId } = useAuthState();

  const openRequests = requests.filter(r => r.status === "pending");
  const inProgressRequests = requests.filter(r => r.status === "in_progress");
  const actionNeededRequests = requests.filter(r => 
    r.status !== "completed" && r.status !== "cancelled"
  );

  const renderRequestCard = (request: MaintenanceRequest) => (
    <div
      key={request.id}
      className="p-4 bg-white rounded-lg shadow-sm border cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => onRequestClick(request.id)}
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-medium text-sm">{request.title}</h4>
        <span className={`text-xs px-2 py-1 rounded-full ${
          request.priority === 'high' ? 'bg-red-100 text-red-800' :
          request.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
          'bg-green-100 text-green-800'
        }`}>
          {request.priority}
        </span>
      </div>
      <p className="text-sm text-gray-600 mb-2 line-clamp-2">{request.description}</p>
      <div className="text-xs text-gray-500">
        <p>Property: {request.property.name}</p>
        <p>Tenant: {request.tenant.first_name} {request.tenant.last_name}</p>
      </div>
    </div>
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
        {isLoading ? (
          <ChartSkeleton />
        ) : columnRequests.length > 0 ? (
          <div className="space-y-4">
            {columnRequests.map(request => renderRequestCard(request))}
          </div>
        ) : (
          <NoDataCard 
            title={title}
            message={t('maintenance.noRequests')}
          />
        )}
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