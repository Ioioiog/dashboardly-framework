import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { RequestStatusTimeline } from "./sections/RequestStatusTimeline";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";

interface MaintenanceRequest {
  id: string;
  title: string;
  status: "pending" | "in_progress" | "completed" | "cancelled";
  priority: string;
  created_at: string;
  updated_at: string;
  property: { name: string };
  tenant: { first_name: string; last_name: string };
  description: string;
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

  console.log('MaintenanceList - Received requests:', requests);
  console.log('MaintenanceList - Loading state:', isLoading);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!requests || requests.length === 0) {
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

  const getPriorityVariant = (priority: string) => {
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

  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <Card 
          key={request.id}
          className="p-6"
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
              <p><strong>{t("maintenance.property")}:</strong> {request.property.name}</p>
              <p><strong>{t("maintenance.tenant")}:</strong> {request.tenant.first_name} {request.tenant.last_name}</p>
              <p className="mt-2">{request.description}</p>
            </div>

            <RequestStatusTimeline 
              status={request.status}
              createdAt={request.created_at}
              updatedAt={request.updated_at}
            />
          </div>
        </Card>
      ))}
    </div>
  );
}