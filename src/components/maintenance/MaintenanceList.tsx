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
import { Eye, Paperclip } from "lucide-react";
import { useUserRole } from "@/hooks/use-user-role";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  const { t } = useTranslation();

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

  const handlePriorityChange = async (requestId: string, newPriority: string) => {
    try {
      console.log('Updating priority:', requestId, newPriority);
      const { error } = await supabase
        .from('maintenance_requests')
        .update({ priority: newPriority })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Priority updated successfully",
      });

      await queryClient.invalidateQueries({ queryKey: ['maintenance-requests'] });
    } catch (error) {
      console.error('Error updating priority:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update priority",
      });
    }
  };

  const handleStatusChange = async (
    requestId: string, 
    newStatus: 'pending' | 'in_progress' | 'completed'
  ) => {
    try {
      console.log('Updating status:', requestId, newStatus);
      const { error } = await supabase
        .from('maintenance_requests')
        .update({ status: newStatus })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Status updated successfully",
      });

      await queryClient.invalidateQueries({ queryKey: ['maintenance-requests'] });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update status",
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
        <p className="text-gray-600">{t('maintenance.noRequests')}</p>
        {userRole === 'tenant' && (
          <p className="text-sm text-gray-500 mt-2">
            {t('maintenance.createRequestPrompt')}
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

  const isUnread = (request: MaintenanceRequest) => {
    if (userRole === 'landlord') {
      return !request.read_by_landlord;
    }
    return !request.read_by_tenant;
  };

  const generateTicketId = (id: string) => {
    return `MR-${id.slice(0, 6)}`.toUpperCase();
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t('maintenance.ticket')}</TableHead>
          <TableHead>{t('maintenance.property')}</TableHead>
          <TableHead>{t('maintenance.title')}</TableHead>
          <TableHead>{t('maintenance.status')}</TableHead>
          <TableHead>{t('maintenance.priority')}</TableHead>
          <TableHead>{t('maintenance.assignee')}</TableHead>
          <TableHead>{t('maintenance.dates')}</TableHead>
          <TableHead>{t('maintenance.actions')}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {requests.map((request) => (
          <TableRow
            key={request.id}
            className={isUnread(request) ? 'bg-red-50' : ''}
          >
            <TableCell className="font-mono">{generateTicketId(request.id)}</TableCell>
            <TableCell>{request.property?.name}</TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                {request.title}
                {request.images && request.images.length > 0 && (
                  <Paperclip className="h-4 w-4 text-gray-400" />
                )}
              </div>
            </TableCell>
            <TableCell>
              {userRole === 'landlord' ? (
                <Select
                  defaultValue={request.status}
                  onValueChange={(value: 'pending' | 'in_progress' | 'completed') => 
                    handleStatusChange(request.id, value)
                  }
                >
                  <SelectTrigger className="w-[130px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">{t('maintenance.status.pending')}</SelectItem>
                    <SelectItem value="in_progress">{t('maintenance.status.in_progress')}</SelectItem>
                    <SelectItem value="completed">{t('maintenance.status.completed')}</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Badge className={getStatusColor(request.status)}>
                  {t(`maintenance.status.${request.status}`)}
                </Badge>
              )}
            </TableCell>
            <TableCell>
              {userRole === 'landlord' ? (
                <Select
                  defaultValue={request.priority?.toLowerCase()}
                  onValueChange={(value) => handlePriorityChange(request.id, value)}
                >
                  <SelectTrigger className="w-[100px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">{t('maintenance.priority.low')}</SelectItem>
                    <SelectItem value="medium">{t('maintenance.priority.medium')}</SelectItem>
                    <SelectItem value="high">{t('maintenance.priority.high')}</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Badge className={getPriorityColor(request.priority || "")}>
                  {t(`maintenance.priority.${request.priority?.toLowerCase()}`)}
                </Badge>
              )}
            </TableCell>
            <TableCell>
              {request.assignee ? 
                `${request.assignee.first_name} ${request.assignee.last_name}` : 
                t('maintenance.unassigned')}
            </TableCell>
            <TableCell>
              <div className="text-sm">
                <div>{t('maintenance.created')}: {format(new Date(request.created_at), "PP")}</div>
                <div className="text-gray-500">{t('maintenance.updated')}: {format(new Date(request.updated_at), "PP")}</div>
              </div>
            </TableCell>
            <TableCell>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onRequestClick(request);
                  if (isUnread(request)) {
                    handleMarkAsRead(request.id);
                  }
                }}
                className="flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                {t('maintenance.viewDetails')}
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
