import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MaintenanceRequest } from "../hooks/useMaintenanceRequest";
import { format } from "date-fns";

interface MaintenanceDetailsTabProps {
  request: MaintenanceRequest;
  onUpdateRequest: (request: Partial<MaintenanceRequest>) => void;
}

export function MaintenanceDetailsTab({ request }: MaintenanceDetailsTabProps) {
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
                <div>
                  <p className="text-sm text-muted-foreground">Priority</p>
                  <Badge variant={
                    request.priority === 'high' ? 'destructive' : 
                    request.priority === 'medium' ? 'warning' : 
                    'secondary'
                  }>
                    {request.priority}
                  </Badge>
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