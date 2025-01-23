import { MaintenanceRequest, MaintenanceRequestStatus } from "@/types/maintenance";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface MaintenanceCardHeaderProps {
  request: MaintenanceRequest;
  isLandlord?: boolean;
  onStatusChange: (status: MaintenanceRequestStatus) => void;
}

export function MaintenanceCardHeader({ request, isLandlord, onStatusChange }: MaintenanceCardHeaderProps) {
  const { toast } = useToast();

  const getStatusColor = (status: MaintenanceRequestStatus) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-semibold">{request.title}</h3>
          <Badge variant="outline" className={getStatusColor(request.status)}>
            {request.status.replace("_", " ")}
          </Badge>
        </div>
      </div>
      
      {isLandlord && (
        <div className="flex flex-wrap gap-2">
          <Select
            defaultValue={request.status}
            onValueChange={(value) => onStatusChange(value as MaintenanceRequestStatus)}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}