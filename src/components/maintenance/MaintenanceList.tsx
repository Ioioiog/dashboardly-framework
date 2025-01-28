import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MaintenanceRequest } from "@/types/maintenance";
import { useUserRole } from "@/hooks/use-user-role";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";
import { MaintenanceTableRow } from "./table/MaintenanceTableRow";

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

  const isUnread = (request: MaintenanceRequest) => {
    if (userRole === 'landlord') {
      return !request.read_by_landlord;
    }
    return !request.read_by_tenant;
  };

  const handleRequestClick = (request: MaintenanceRequest) => {
    onRequestClick(request);
    if (isUnread(request)) {
      handleMarkAsRead(request.id);
    }
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
          <MaintenanceTableRow
            key={request.id}
            request={request}
            userRole={userRole}
            isUnread={isUnread(request)}
            onRequestClick={handleRequestClick}
            onStatusChange={handleStatusChange}
            onPriorityChange={handlePriorityChange}
          />
        ))}
      </TableBody>
    </Table>
  );
}