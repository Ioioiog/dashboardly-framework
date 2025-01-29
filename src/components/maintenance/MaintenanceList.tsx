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

interface MaintenanceRequest {
  id: string;
  title: string;
  status: "pending" | "in_progress" | "completed" | "cancelled";
  priority: string;
  created_at: string;
  property: { name: string };
  tenant: { first_name: string; last_name: string };
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

  if (isLoading) {
    return <div>Loading...</div>;
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
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t("maintenance.ticket")}</TableHead>
          <TableHead>{t("maintenance.property")}</TableHead>
          <TableHead>{t("maintenance.title")}</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Priority</TableHead>
          <TableHead>{t("maintenance.created")}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {requests.map((request) => (
          <TableRow 
            key={request.id}
            className={onRequestClick ? "cursor-pointer hover:bg-gray-50" : ""}
            onClick={() => onRequestClick?.(request.id)}
          >
            <TableCell className="font-medium">#{request.id.slice(0, 8)}</TableCell>
            <TableCell>{request.property.name}</TableCell>
            <TableCell>{request.title}</TableCell>
            <TableCell>
              <Badge variant={getStatusVariant(request.status)}>
                {t(`maintenance.status.${request.status}`)}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge variant={getPriorityVariant(request.priority)}>
                {t(`maintenance.priority.${request.priority}`)}
              </Badge>
            </TableCell>
            <TableCell>{format(new Date(request.created_at), "PPP")}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}