import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MaintenanceRequest } from "@/types/maintenance";
import { MaintenanceForm } from "./MaintenanceForm";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { Paperclip, Clock, User, AlertCircle } from "lucide-react";
import { MaintenanceHistory } from "./MaintenanceHistory";
import { useUserRole } from "@/hooks/use-user-role";

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
  const { userRole } = useUserRole();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500";
      case "in_progress":
        return "bg-blue-500";
      case "completed":
        return "bg-green-500";
      case "rejected":
        return "bg-red-500";
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
      <DialogContent className="max-w-7xl p-6">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold flex items-center gap-4 mb-4">
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left side - Tenant's Form */}
          <div className="space-y-4">
            <Card className="p-4">
              <h3 className="text-lg font-medium mb-4">
                {t('maintenance.tenantSection')}
              </h3>
              <MaintenanceForm 
                request={request} 
                onSuccess={() => onOpenChange(false)}
                section="tenant"
              />
            </Card>
            
            {request && (
              <Card className="p-4 space-y-3">
                <h3 className="text-lg font-medium">{t('maintenance.requestInfo')}</h3>
                
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <div className="flex flex-col">
                    <span>{t('maintenance.created')}: {format(new Date(request.created_at), "PPp")}</span>
                    <span>{t('maintenance.updated')}: {format(new Date(request.updated_at), "PPp")}</span>
                  </div>
                </div>

                {request.images && request.images.length > 0 && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Paperclip className="h-4 w-4" />
                    <span>{request.images.length} {t('maintenance.attachments')}</span>
                  </div>
                )}

                {request.priority === 'high' && (
                  <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                    <AlertCircle className="h-4 w-4" />
                    <span>{t('maintenance.highPriorityWarning')}</span>
                  </div>
                )}
              </Card>
            )}
          </div>

          {/* Right side - Landlord's Form and History */}
          <div className="space-y-4">
            {userRole === 'landlord' && (
              <Card className="p-4">
                <h3 className="text-lg font-medium mb-4">
                  {t('maintenance.landlordSection')}
                </h3>
                <MaintenanceForm 
                  request={request} 
                  onSuccess={() => onOpenChange(false)}
                  section="landlord"
                />
              </Card>
            )}

            {request?.assignee && (
              <Card className="p-4">
                <h3 className="text-lg font-medium mb-4">{t('maintenance.assignedTo')}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <User className="h-4 w-4" />
                  <span>
                    {request.assignee.first_name} {request.assignee.last_name}
                  </span>
                </div>
              </Card>
            )}

            {request && (
              <Card className="p-4">
                <h3 className="text-lg font-medium mb-4">{t('maintenance.requestHistory')}</h3>
                <MaintenanceHistory requestId={request.id} />
              </Card>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}