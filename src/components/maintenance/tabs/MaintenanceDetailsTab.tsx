import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MaintenanceRequest } from "../hooks/useMaintenanceRequest";
import { format } from "date-fns";

interface MaintenanceDetailsTabProps {
  request?: MaintenanceRequest;
  onUpdateRequest: (request: Partial<MaintenanceRequest>) => void;
  isNew?: boolean;
}

export function MaintenanceDetailsTab({ request, onUpdateRequest, isNew = false }: MaintenanceDetailsTabProps) {
  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'warning';
      case 'low':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const getStatusVariant = (status: string) => {
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

  // Don't show the details card if it's a new request or if request is undefined
  if (isNew || !request) {
    return null;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">Issue Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Title</p>
                  <p className="font-medium">{request.title}</p>
                </div>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Priority</p>
                    <Badge variant={getPriorityVariant(request.priority || 'low')}>
                      {request.priority || 'low'}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge variant={getStatusVariant(request.status)}>
                      {request.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Description</p>
              <p className="text-sm">{request.description}</p>
            </div>

            {request.contact_phone && (
              <div>
                <p className="text-sm text-muted-foreground">Contact Phone</p>
                <p className="font-medium">{request.contact_phone}</p>
              </div>
            )}

            {request.preferred_times && request.preferred_times.length > 0 && (
              <div>
                <p className="text-sm text-muted-foreground">Preferred Times</p>
                <div className="flex gap-2">
                  {request.preferred_times.map((time) => (
                    <Badge key={time} variant="outline">
                      {time}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="font-medium">
                  {format(new Date(request.created_at), 'PPp')}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Last Updated</p>
                <p className="font-medium">
                  {format(new Date(request.updated_at), 'PPp')}
                </p>
              </div>
            </div>

            {request.scheduled_date && (
              <div>
                <p className="text-sm text-muted-foreground">Scheduled Date</p>
                <p className="font-medium">
                  {format(new Date(request.scheduled_date), 'PPp')}
                </p>
              </div>
            )}

            {request.completion_date && (
              <div>
                <p className="text-sm text-muted-foreground">Completion Date</p>
                <p className="font-medium">
                  {format(new Date(request.completion_date), 'PPp')}
                </p>
              </div>
            )}

            {request.rating !== null && request.rating !== undefined && (
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-muted-foreground">Rating</p>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{request.rating}/5</p>
                    {request.rating_comment && (
                      <p className="text-sm text-muted-foreground">
                        - "{request.rating_comment}"
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}