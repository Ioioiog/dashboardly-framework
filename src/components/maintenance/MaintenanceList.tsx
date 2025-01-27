import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MaintenanceRequest } from "@/types/maintenance";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { useUserRole } from "@/hooks/use-user-role";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface MaintenanceListProps {
  requests: MaintenanceRequest[];
  isLoading: boolean;
  onRequestClick: (request: MaintenanceRequest) => void;
}

export function MaintenanceList({
  requests,
  isLoading,
  onRequestClick,
}: MaintenanceListProps) {
  const { userRole } = useUserRole();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  console.log('Current user role:', userRole);
  console.log('Maintenance requests:', requests);

  const handleMarkAsRead = async (requestId: string) => {
    try {
      console.log('Marking request as read:', requestId);
      const updateData = userRole === 'landlord' 
        ? { read_by_landlord: true }
        : { read_by_tenant: true };

      const { error } = await supabase
        .from('maintenance_requests')
        .update(updateData)
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Request marked as read",
      });

      await queryClient.invalidateQueries({ queryKey: ['maintenance-requests'] });
      await queryClient.invalidateQueries({ queryKey: ['sidebarNotifications'] });
      
    } catch (error) {
      console.error('Error marking request as read:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to mark request as read",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-100 animate-pulse rounded" />
        <div className="h-12 bg-gray-100 animate-pulse rounded" />
        <div className="h-12 bg-gray-100 animate-pulse rounded" />
        <div className="h-12 bg-gray-100 animate-pulse rounded" />
      </div>
    );
  }

  if (!requests.length) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg">
        <p className="text-gray-600">No maintenance requests found.</p>
        {userRole === 'tenant' && (
          <p className="text-sm text-gray-500 mt-2">
            Click the "New Request" button above to create a maintenance request.
          </p>
        )}
      </div>
    );
  }

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
    switch (priority) {
      case "High":
        return "bg-red-500";
      case "Medium":
        return "bg-orange-500";
      case "Low":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  const isUnread = (request: MaintenanceRequest) => {
    if (userRole === 'landlord') {
      return !request.read_by_landlord;
    }
    return !request.read_by_tenant;
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Property</TableHead>
          <TableHead>Tenant</TableHead>
          <TableHead>Title</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Priority</TableHead>
          <TableHead>Created</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {requests.map((request) => (
          <TableRow
            key={request.id}
            className={`hover:bg-gray-100 ${
              isUnread(request) ? 'bg-red-50' : ''
            }`}
          >
            <TableCell>{request.property?.name}</TableCell>
            <TableCell>
              {request.tenant?.first_name} {request.tenant?.last_name}
            </TableCell>
            <TableCell>{request.title}</TableCell>
            <TableCell>
              <Badge className={getStatusColor(request.status)}>
                {request.status}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge className={getPriorityColor(request.priority || "")}>
                {request.priority}
              </Badge>
            </TableCell>
            <TableCell>
              {format(new Date(request.created_at), "PPP")}
            </TableCell>
            <TableCell>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onRequestClick(request);
                  if (userRole === 'landlord' && !request.read_by_landlord) {
                    handleMarkAsRead(request.id);
                  }
                }}
                className="flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                See Request
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}