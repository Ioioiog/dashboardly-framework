import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MaintenanceRequest } from "@/types/maintenance";
import { format } from "date-fns";
import { AlertTriangle, Clock, History, Pencil, Wrench } from "lucide-react";
import { useState } from "react";
import { MaintenanceDialog } from "./MaintenanceDialog";
import { MaintenanceHistoryDialog } from "./MaintenanceHistoryDialog";

interface MaintenanceRequestCardProps {
  request: MaintenanceRequest;
}

export function MaintenanceRequestCard({ request }: MaintenanceRequestCardProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityIcon = (priority?: string) => {
    switch (priority) {
      case "High":
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case "Medium":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "Low":
        return <Wrench className="w-4 h-4 text-blue-500" />;
      default:
        return null;
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex items-start gap-2">
              <CardTitle className="text-lg font-semibold">{request.title}</CardTitle>
              {getPriorityIcon(request.priority)}
            </div>
            <Badge className={getStatusColor(request.status)}>
              {request.status.replace("_", " ")}
            </Badge>
          </div>
          <div className="flex gap-2 mt-2">
            {request.issue_type && (
              <Badge variant="outline">{request.issue_type}</Badge>
            )}
            {request.priority && (
              <Badge variant="outline" className="capitalize">
                {request.priority} Priority
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">{request.description}</p>
          {request.notes && (
            <div className="mt-2 p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-600">{request.notes}</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Created {format(new Date(request.created_at), "MMM d, yyyy")}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsHistoryDialogOpen(true)}
            >
              <History className="w-4 h-4 mr-1" />
              History
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditDialogOpen(true)}
            >
              <Pencil className="w-4 h-4 mr-1" />
              Edit
            </Button>
          </div>
        </CardFooter>
      </Card>

      <MaintenanceDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        request={request}
      />
      
      <MaintenanceHistoryDialog
        open={isHistoryDialogOpen}
        onOpenChange={setIsHistoryDialogOpen}
        request={request}
      />
    </>
  );
}