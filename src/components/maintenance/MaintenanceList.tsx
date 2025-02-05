import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { RequestStatusTimeline } from "./sections/RequestStatusTimeline";
import { Button } from "@/components/ui/button";
import { Edit, Wrench, User } from "lucide-react";
import { useUserRole } from "@/hooks/use-user-role";

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
  assigned_to?: string | null;
  service_provider_status?: string | null;
  scheduled_date?: string | null;
  service_provider_fee?: number;
}

interface MaintenanceListProps {
  requests: MaintenanceRequest[];
  isLoading: boolean;
  onRequestClick?: (requestId: string) => void;
}

export default function MaintenanceList({ 
  requests, 
  isLoading,
  onRequestClick 
}: MaintenanceListProps) {
  const { t } = useTranslation();
  const { userRole } = useUserRole();

  console.log('MaintenanceList - User role:', userRole);
  console.log('MaintenanceList - Number of requests received:', requests?.length);
  console.log('MaintenanceList - All requests:', requests);

  if (isLoading) {
    console.log('MaintenanceList - Loading state');
    return <div>Loading...</div>;
  }

  if (!requests || requests.length === 0) {
    console.log('MaintenanceList - No requests found');
    return (
      <div className="text-center py-8 text-gray-500">
        {t("maintenance.noRequests")}
      </div>
    );
  }

  const getStatusVariant = (status: MaintenanceRequest['status']) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'in_progress':
        return 'outline';
      case 'cancelled':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getPriorityVariant = (priority: MaintenanceRequest['priority']) => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const renderServiceProviderInfo = (request: MaintenanceRequest) => {
    if (userRole !== 'landlord' && userRole !== 'service_provider') return null;

    return (
      <div className="mt-4 space-y-2 border-t pt-4">
        <div className="flex items-center gap-2">
          <Wrench className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-600">
            {request.assigned_to ? 
              <>
                <span>Assigned • </span>
                {request.service_provider_status && 
                  <Badge variant="outline">{request.service_provider_status}</Badge>
                }
              </> : 
              "Unassigned"
            }
          </span>
        </div>
        {request.scheduled_date && (
          <p className="text-sm text-gray-600">
            Scheduled: {format(new Date(request.scheduled_date), 'PPP')}
          </p>
        )}
        {request.service_provider_fee !== undefined && (
          <p className="text-sm text-gray-600">
            Estimated Cost: ${request.service_provider_fee}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {requests.map((request) => {
        console.log('MaintenanceList - Rendering request:', {
          id: request.id,
          title: request.title,
          tenant: request.tenant,
          property: request.property
        });
        
        return (
          <Card 
            key={request.id}
            className="p-6 hover:shadow-md transition-shadow duration-200"
          >
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">{request.title}</h3>
                  <p className="text-sm text-gray-500">#{request.id.slice(0, 8)}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex space-x-2">
                    <Badge variant={getStatusVariant(request.status)}>
                      {t(`maintenance.status.${request.status}`)}
                    </Badge>
                    <Badge variant={getPriorityVariant(request.priority)}>
                      {t(`maintenance.priority.${request.priority}`)}
                    </Badge>
                  </div>
                  {onRequestClick && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRequestClick(request.id)}
                      className="ml-2"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              <div className="text-sm text-gray-600">
                <div className="flex items-center gap-2 mb-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span>{request.tenant.first_name} {request.tenant.last_name}</span>
                </div>
                <p><strong>{t("maintenance.property")}:</strong> {request.property.name}</p>
                <p className="mt-2">{request.description}</p>
              </div>

              {renderServiceProviderInfo(request)}

              <RequestStatusTimeline 
                status={request.status}
                createdAt={request.created_at}
                updatedAt={request.updated_at}
              />
            </div>
          </Card>
        );
      })}
    </div>
  );
}