import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MaintenanceRequest, MaintenanceRequestStatus } from "@/types/maintenance";
import { format } from "date-fns";
import { AlertTriangle, Clock, History, ImageIcon, Pencil, Wrench } from "lucide-react";
import { useState } from "react";
import { MaintenanceDialog } from "./MaintenanceDialog";
import { MaintenanceHistoryDialog } from "./MaintenanceHistoryDialog";
import { STATUS_COLORS, STATUS_OPTIONS } from "./constants";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface MaintenanceRequestCardProps {
  request: MaintenanceRequest;
  isLandlord?: boolean;
}

export function MaintenanceRequestCard({ request, isLandlord }: MaintenanceRequestCardProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  const handleStatusChange = async (newStatus: MaintenanceRequestStatus) => {
    try {
      const { error } = await supabase
        .from("maintenance_requests")
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq("id", request.id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["maintenance-requests"] });
      toast({
        title: "Success",
        description: "Status updated successfully",
      });
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex flex-col gap-1">
              <CardTitle className="text-lg font-semibold">{request.title}</CardTitle>
              <div className="text-sm text-gray-500">
                {request.property?.name && (
                  <span className="mr-2">Property: {request.property.name}</span>
                )}
                {request.property?.address && (
                  <span className="text-gray-400">({request.property.address})</span>
                )}
              </div>
            </div>
            {isLandlord ? (
              <Select
                defaultValue={request.status}
                onValueChange={handleStatusChange}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((status) => (
                    <SelectItem key={status} value={status}>
                      <Badge className={STATUS_COLORS[status]}>
                        {status.replace("_", " ")}
                      </Badge>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Badge className={STATUS_COLORS[request.status]}>
                {request.status.replace("_", " ")}
              </Badge>
            )}
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
          {request.images && request.images.length > 0 && (
            <div className="mt-4 grid grid-cols-4 gap-2">
              {request.images.slice(0, 4).map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`Maintenance request image ${index + 1}`}
                  className="w-full h-20 object-cover rounded-lg cursor-pointer"
                  onClick={() => setIsImageDialogOpen(true)}
                />
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between items-center">
          <div className="flex flex-col gap-1 text-sm">
            <span className="text-gray-500">
              Created {format(new Date(request.created_at), "MMM d, yyyy")}
            </span>
            <span className="text-gray-500">
              Requested by: {request.tenant?.first_name} {request.tenant?.last_name}
            </span>
          </div>
          <div className="flex gap-2">
            {request.images && request.images.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsImageDialogOpen(true)}
              >
                <ImageIcon className="w-4 h-4 mr-1" />
                Images
              </Button>
            )}
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