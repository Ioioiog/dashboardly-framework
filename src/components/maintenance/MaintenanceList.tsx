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
  status: string;
  priority: string;
  created_at: string;
  property: { name: string };
  tenant: { first_name: string; last_name: string };
}

interface MaintenanceListProps {
  requests: MaintenanceRequest[];
  isLoading: boolean;
}

export default function MaintenanceList({ requests, isLoading }: MaintenanceListProps) {
  const { t } = useTranslation();

  if (isLoading) {
    return <div>Loading...</div>;
  }

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
          <TableRow key={request.id}>
            <TableCell className="font-medium">#{request.id.slice(0, 8)}</TableCell>
            <TableCell>{request.property.name}</TableCell>
            <TableCell>{request.title}</TableCell>
            <TableCell>
              <Badge variant={request.status === "pending" ? "default" : "success"}>
                {t(`maintenance.status.${request.status}`)}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge variant={
                request.priority === "high" ? "destructive" : 
                request.priority === "medium" ? "warning" : "default"
              }>
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