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

  console.log('[MaintenanceList] Rendering with:', {
    userRole,
    requestsCount: requests?.length,
    isLoading
  });

  const handleMarkAsRead = async (requestId: string) => {
    try {
      console.log('[MaintenanceList] Marking request as read:', requestId);
      const updateData = userRole === 'landlord' 
        ? { read_by_landlord: true }
        : { read_by_tenant: true };

      const { error } = await supabase
        .from('maintenance_requests')
        .update(updateData)
        .eq('id', requestId);

      if (error) {
        console.error('[MaintenanceList] Error marking as read:', error);
        throw error;
      }

      console.log('[MaintenanceList] Successfully marked as read');
      toast({
        title: t('common.success'),
        description: t('maintenance.markedAsRead'),
      });

      await queryClient.invalidateQueries({ queryKey: ['maintenance-requests'] });
      await queryClient.invalidateQueries({ queryKey: ['sidebarNotifications'] });
      
    } catch (error) {
      console.error('[MaintenanceList] Error in handleMarkAsRead:', error);
      toast({
        variant: "destructive",
        title: t('common.error'),
        description: t('maintenance.errorMarkingAsRead'),
      });
    }
  };

  const handlePriorityChange = async (requestId: string, newPriority: string) => {
    try {
      console.log('[MaintenanceList] Updating priority:', { requestId, newPriority });
      const { error } = await supabase
        .from('maintenance_requests')
        .update({ priority: newPriority })
        .eq('id', requestId);

      if (error) {
        console.error('[MaintenanceList] Error updating priority:', error);
        throw error;
      }

      console.log('[MaintenanceList] Priority updated successfully');
      toast({
        title: t('common.success'),
        description: t('maintenance.priorityUpdated'),
      });

      await queryClient.invalidateQueries({ queryKey: ['maintenance-requests'] });
    } catch (error) {
      console.error('[MaintenanceList] Error in handlePriorityChange:', error);
      toast({
        variant: "destructive",
        title: t('common.error'),
        description: t('maintenance.errorUpdatingPriority'),
      });
    }
  };

  const handleStatusChange = async (
    requestId: string, 
    newStatus: 'pending' | 'in_progress' | 'completed'
  ) => {
    try {
      console.log('[MaintenanceList] Updating status:', { requestId, newStatus });
      const { error } = await supabase
        .from('maintenance_requests')
        .update({ status: newStatus })
        .eq('id', requestId);

      if (error) {
        console.error('[MaintenanceList] Error updating status:', error);
        throw error;
      }

      console.log('[MaintenanceList] Status updated successfully');
      toast({
        title: t('common.success'),
        description: t('maintenance.statusUpdated'),
      });

      await queryClient.invalidateQueries({ queryKey: ['maintenance-requests'] });
    } catch (error) {
      console.error('[MaintenanceList] Error in handleStatusChange:', error);
      toast({
        variant: "destructive",
        title: t('common.error'),
        description: t('maintenance.errorUpdatingStatus'),
      });
    }
  };

  if (isLoading) {
    console.log('[MaintenanceList] Showing loading state');
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-100 animate-pulse rounded" />
        <div className="h-12 bg-gray-100 animate-pulse rounded" />
        <div className="h-12 bg-gray-100 animate-pulse rounded" />
        <div className="h-12 bg-gray-100 animate-pulse rounded" />
      </div>
    );
  }

  if (!requests?.length) {
    console.log('[MaintenanceList] No requests found');
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
    console.log('[MaintenanceList] Request clicked:', request.id);
    onRequestClick(request);
    if (isUnread(request)) {
      console.log('[MaintenanceList] Request is unread, marking as read');
      handleMarkAsRead(request.id);
    }
  };

  console.log('[MaintenanceList] Rendering table with requests:', requests.length);

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