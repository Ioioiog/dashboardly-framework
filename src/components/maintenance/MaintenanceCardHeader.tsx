import { useQuery } from "@tanstack/react-query";
import { MaintenanceRequest, MaintenanceRequestStatus } from "@/types/maintenance";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface MaintenanceCardHeaderProps {
  request: MaintenanceRequest;
  isLandlord?: boolean;
  onStatusChange: (status: MaintenanceRequestStatus) => void;
}

export function MaintenanceCardHeader({ request, isLandlord, onStatusChange }: MaintenanceCardHeaderProps) {
  const { toast } = useToast();

  // Fetch available maintenance staff/service providers
  const { data: serviceProviders } = useQuery({
    queryKey: ["service-providers"],
    queryFn: async () => {
      console.log("Fetching service providers...");
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("id, first_name, last_name")
        .eq("role", "service_provider");

      if (error) {
        console.error("Error fetching service providers:", error);
        throw error;
      }

      console.log("Fetched service providers:", profiles);
      return profiles;
    },
    enabled: isLandlord,
  });

  const handleAssigneeChange = async (assigneeId: string) => {
    try {
      console.log("Updating assignee:", assigneeId);
      const { error } = await supabase
        .from("maintenance_requests")
        .update({ 
          assigned_to: assigneeId,
          updated_at: new Date().toISOString()
        })
        .eq("id", request.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Request assigned successfully",
      });
    } catch (error) {
      console.error("Error assigning request:", error);
      toast({
        title: "Error",
        description: "Failed to assign request",
        variant: "destructive",
      });
    }
  };

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

          <Select
            value={request.assigned_to || ""}
            onValueChange={handleAssigneeChange}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Assign to..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Unassigned</SelectItem>
              {serviceProviders?.map((provider) => (
                <SelectItem key={provider.id} value={provider.id}>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback>
                        {provider.first_name?.[0]}{provider.last_name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    {provider.first_name} {provider.last_name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}