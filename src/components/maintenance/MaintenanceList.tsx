import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { MaintenanceRequest } from "@/types/maintenance";
import { MaintenanceRequestCard } from "./MaintenanceRequestCard";

interface MaintenanceListProps {
  requests: MaintenanceRequest[] | undefined;
  isLoading: boolean;
  isLandlord?: boolean;
}

export function MaintenanceList({ requests, isLoading, isLandlord }: MaintenanceListProps) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-7xl mx-auto">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </Card>
        ))}
      </div>
    );
  }

  if (!requests?.length) {
    return (
      <div className="max-w-7xl mx-auto">
        <Card className="p-6">
          <div className="text-center text-gray-500">
            {t('maintenance.noRequests')}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-7xl mx-auto">
      {requests.map((request) => (
        <MaintenanceRequestCard 
          key={request.id} 
          request={request} 
          isLandlord={isLandlord}
        />
      ))}
    </div>
  );
}