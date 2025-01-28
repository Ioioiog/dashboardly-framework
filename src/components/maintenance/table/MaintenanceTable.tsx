import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MaintenanceRequest } from "@/types/maintenance";
import { useTranslation } from "react-i18next";
import { MaintenanceTableRow } from "./MaintenanceTableRow";

interface MaintenanceTableProps {
  requests: MaintenanceRequest[];
  userRole: string;
  onRequestClick: (request: MaintenanceRequest) => void;
  onStatusChange: (requestId: string, newStatus: 'pending' | 'in_progress' | 'completed') => void;
  onPriorityChange: (requestId: string, newPriority: string) => void;
  isUnread: (request: MaintenanceRequest) => boolean;
}

export function MaintenanceTable({
  requests,
  userRole,
  onRequestClick,
  onStatusChange,
  onPriorityChange,
  isUnread,
}: MaintenanceTableProps) {
  const { t } = useTranslation();

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t('maintenance.ticket')}</TableHead>
          <TableHead>{t('maintenance.property')}</TableHead>
          <TableHead>{t('maintenance.title')}</TableHead>
          <TableHead>{t('maintenance.status')}</TableHead>
          <TableHead>{t('maintenance.priority')}</TableHead>
          <TableHead>{t('maintenance.assignee')}</TableHead>
          <TableHead>{t('maintenance.dates')}</TableHead>
          <TableHead>{t('maintenance.actions')}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {requests.map((request) => (
          <MaintenanceTableRow
            key={request.id}
            request={request}
            userRole={userRole}
            isUnread={isUnread(request)}
            onRequestClick={onRequestClick}
            onStatusChange={onStatusChange}
            onPriorityChange={onPriorityChange}
          />
        ))}
      </TableBody>
    </Table>
  );
}