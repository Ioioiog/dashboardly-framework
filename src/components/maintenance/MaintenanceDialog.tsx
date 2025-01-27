import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MaintenanceRequest } from "@/types/maintenance";
import { MaintenanceForm } from "./MaintenanceForm";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { Paperclip, Clock, User } from "lucide-react";

interface MaintenanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request?: MaintenanceRequest | null;
}

export function MaintenanceDialog({
  open,
  onOpenChange,
  request,
}: MaintenanceDialogProps) {
  const { t } = useTranslation();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500";
      case "in_progress":
        return "bg-blue-500";
      case "completed":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-orange-500";
      case "low":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  const generateTicketId = (id: string) => {
    return `MR-${id.slice(0, 6)}`.toUpperCase();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-6">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold flex items-center gap-4">
            {request ? (
              <>
                <span className="font-mono">{generateTicketId(request.id)}</span>
                <Badge className={getStatusColor(request.status)}>
                  {t(`maintenance.status.${request.status}`)}
                </Badge>
                {request.priority && (
                  <Badge className={getPriorityColor(request.priority)}>
                    {t(`maintenance.priority.${request.priority.toLowerCase()}`)}
                  </Badge>
                )}
              </>
            ) : (
              t('maintenance.newRequest')
            )}
          </DialogTitle>
        </DialogHeader>

        {request && (
          <Card className="p-4 mb-4 space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              <span>
                {t('maintenance.created')}: {format(new Date(request.created_at), "PP")}
              </span>
              <span className="mx-2">•</span>
              <span>
                {t('maintenance.updated')}: {format(new Date(request.updated_at), "PP")}
              </span>
            </div>
            
            {request.assignee && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span>
                  {t('maintenance.assignee')}: {request.assignee.first_name} {request.assignee.last_name}
                </span>
              </div>
            )}

            {request.images && request.images.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Paperclip className="h-4 w-4" />
                <span>{request.images.length} {t('maintenance.attachments')}</span>
              </div>
            )}
          </Card>
        )}

        <MaintenanceForm request={request} onSuccess={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}