import { Card } from "@/components/ui/card";
import { MaintenanceRequest } from "@/types/maintenance";
import { MaintenanceRequestCard } from "./MaintenanceRequestCard";

interface MaintenanceListProps {
  requests: MaintenanceRequest[] | undefined;
  isLoading: boolean;
}

export function MaintenanceList({ requests, isLoading }: MaintenanceListProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
      <Card className="p-6">
        <div className="text-center text-gray-500">
          No maintenance requests found.
        </div>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {requests.map((request) => (
        <MaintenanceRequestCard key={request.id} request={request} />
      ))}
    </div>
  );
}