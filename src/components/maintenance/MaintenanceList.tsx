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
import { Eye, Check } from "lucide-react";
import { useUserRole } from "@/hooks/use-user-role";
import { useToast } from "@/hooks/use-toast";
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

  console.log('Current user role:', userRole); // Debug log

  const handleMarkAsRead = async (requestId: string) => {
    try {
      console.log('Marking request as read:', requestId);
      const { error } = await supabase
        .from('maintenance_requests')
        .update({ read_by_landlord: true })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Request marked as read",
      });
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
    return <div>Loading...</div>;
  }

  if (!requests.length) {
    return <div>No maintenance requests found.</div>;
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
          {userRole === 'landlord' && (
            <TableHead className="text-right">Mark as Read</TableHead>
          )}
        </TableRow>
      </TableHeader>
      <TableBody>
        {requests.map((request) => (
          <TableRow
            key={request.id}
            className="hover:bg-gray-100"
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
                onClick={() => onRequestClick(request)}
                className="flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                See Request
              </Button>
            </TableCell>
            {userRole === 'landlord' && (
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleMarkAsRead(request.id)}
                  disabled={request.read_by_landlord}
                  className={`flex items-center gap-2 ${
                    request.read_by_landlord ? 'text-gray-400' : 'text-green-600 hover:text-green-700'
                  }`}
                >
                  <Check className="h-4 w-4" />
                  {request.read_by_landlord ? 'Read' : 'Mark as Read'}
                </Button>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}