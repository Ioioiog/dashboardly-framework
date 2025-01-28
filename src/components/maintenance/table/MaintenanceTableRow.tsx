import { MaintenanceRequest } from "@/types/maintenance";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Paperclip } from "lucide-react";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslation } from "react-i18next";

interface MaintenanceTableRowProps {
  request: MaintenanceRequest;
  userRole: string;
  isUnread: boolean;
  onRequestClick: (request: MaintenanceRequest) => void;
  onStatusChange: (requestId: string, newStatus: 'pending' | 'in_progress' | 'completed') => void;
  onPriorityChange: (requestId: string, newPriority: string) => void;
}

export function MaintenanceTableRow({
  request,
  userRole,
  isUnread,
  onRequestClick,
  onStatusChange,
  onPriorityChange,
}: MaintenanceTableRowProps) {
  const { t } = useTranslation();

  return (
    <TableRow className={isUnread ? 'bg-red-50' : ''}>
      <TableCell className="font-mono">{`MR-${request.id.slice(0, 6)}`.toUpperCase()}</TableCell>
      <TableCell>{request.property?.name}</TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          {request.title}
          {request.images && request.images.length > 0 && (
            <Paperclip className="h-4 w-4 text-gray-400" />
          )}
        </div>
      </TableCell>
      <TableCell>
        {userRole === 'landlord' ? (
          <Select
            defaultValue={request.status}
            onValueChange={(value: 'pending' | 'in_progress' | 'completed') => 
              onStatusChange(request.id, value)
            }
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">{t('maintenance.status.pending')}</SelectItem>
              <SelectItem value="in_progress">{t('maintenance.status.in_progress')}</SelectItem>
              <SelectItem value="completed">{t('maintenance.status.completed')}</SelectItem>
            </SelectContent>
          </Select>
        ) : (
          <StatusBadge status={request.status} />
        )}
      </TableCell>
      <TableCell>
        {userRole === 'landlord' ? (
          <Select
            defaultValue={request.priority?.toLowerCase()}
            onValueChange={(value) => onPriorityChange(request.id, value)}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">{t('maintenance.priority.low')}</SelectItem>
              <SelectItem value="medium">{t('maintenance.priority.medium')}</SelectItem>
              <SelectItem value="high">{t('maintenance.priority.high')}</SelectItem>
            </SelectContent>
          </Select>
        ) : (
          <PriorityBadge priority={request.priority} />
        )}
      </TableCell>
      <TableCell>
        {request.assignee ? 
          `${request.assignee.first_name} ${request.assignee.last_name}` : 
          t('maintenance.unassigned')}
      </TableCell>
      <TableCell>
        <div className="text-sm">
          <div>{t('maintenance.created')}: {format(new Date(request.created_at), "PP")}</div>
          <div className="text-gray-500">{t('maintenance.updated')}: {format(new Date(request.updated_at), "PP")}</div>
        </div>
      </TableCell>
      <TableCell>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onRequestClick(request)}
          className="flex items-center gap-2"
        >
          <Eye className="h-4 w-4" />
          {t('maintenance.viewDetails')}
        </Button>
      </TableCell>
    </TableRow>
  );
}