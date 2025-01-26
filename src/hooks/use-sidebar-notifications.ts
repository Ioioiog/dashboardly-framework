import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { useAuthState } from "./useAuthState";
import { useUserRole } from "./use-user-role";

export interface Notification {
  type: string;
  count: number;
}

export function useSidebarNotifications() {
  const { currentUserId } = useAuthState();
  const { userRole } = useUserRole();
  const queryClient = useQueryClient();

  const fetchNotifications = async (): Promise<Notification[]> => {
    if (!currentUserId) return [];

    console.log("Fetching notifications for user:", currentUserId);

    const notifications: Notification[] = [];

    // Fetch unread messages count
    const { count: messagesCount, error: messagesError } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('receiver_id', currentUserId)
      .eq('read', false);

    if (messagesError) {
      console.error('Error fetching messages count:', messagesError);
    } else {
      notifications.push({ type: 'messages', count: messagesCount || 0 });
    }

    // First, get the property IDs
    const { data: properties } = await supabase
      .from('properties')
      .select('id')
      .eq('landlord_id', currentUserId);

    if (properties) {
      const propertyIds = properties.map(p => p.id);

      // Fetch pending maintenance requests with read status
      const { count: maintenanceCount, error: maintenanceError } = await supabase
        .from('maintenance_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')
        .eq(userRole === 'landlord' ? 'read_by_landlord' : 'read_by_tenant', false)
        .in('property_id', propertyIds);

      if (maintenanceError) {
        console.error('Error fetching maintenance count:', maintenanceError);
      } else {
        notifications.push({ type: 'maintenance', count: maintenanceCount || 0 });
      }

      // Get tenancy IDs for the properties
      const { data: tenancies } = await supabase
        .from('tenancies')
        .select('id')
        .in('property_id', propertyIds);

      if (tenancies) {
        const tenancyIds = tenancies.map(t => t.id);

        // Fetch pending payments with read status
        const { count: paymentsCount, error: paymentsError } = await supabase
          .from('payments')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending')
          .eq(userRole === 'landlord' ? 'read_by_landlord' : 'read_by_tenant', false)
          .in('tenancy_id', tenancyIds);

        if (paymentsError) {
          console.error('Error fetching payments count:', paymentsError);
        } else {
          notifications.push({ type: 'payments', count: paymentsCount || 0 });
        }
      }
    }

    return notifications;
  };

  const markAsRead = async (type: string) => {
    if (!currentUserId || !userRole) return;

    console.log(`Marking ${type} notifications as read for ${userRole}`);

    try {
      switch (type) {
        case 'maintenance':
          const { error: maintenanceError } = await supabase
            .from('maintenance_requests')
            .update({
              [userRole === 'landlord' ? 'read_by_landlord' : 'read_by_tenant']: true
            })
            .eq('status', 'pending');

          if (maintenanceError) throw maintenanceError;
          break;

        case 'payments':
          const { error: paymentsError } = await supabase
            .from('payments')
            .update({
              [userRole === 'landlord' ? 'read_by_landlord' : 'read_by_tenant']: true
            })
            .eq('status', 'pending');

          if (paymentsError) throw paymentsError;
          break;

        case 'messages':
          const { error: messagesError } = await supabase
            .from('messages')
            .update({ read: true })
            .eq('receiver_id', currentUserId)
            .eq('read', false);

          if (messagesError) throw messagesError;
          break;
      }

      // Refresh notifications after marking as read
      queryClient.invalidateQueries({ queryKey: ['sidebarNotifications'] });
    } catch (error) {
      console.error(`Error marking ${type} as read:`, error);
    }
  };

  const { data, refetch } = useQuery({
    queryKey: ['sidebarNotifications', currentUserId],
    queryFn: fetchNotifications,
    enabled: !!currentUserId,
  });

  useEffect(() => {
    if (!currentUserId) return;

    // Subscribe to real-time updates
    const channel = supabase
      .channel('sidebar-notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${currentUserId}`,
        },
        () => {
          console.log('Message received, refetching notifications');
          refetch();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'maintenance_requests',
        },
        () => {
          console.log('Maintenance request updated, refetching notifications');
          refetch();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'payments',
        },
        () => {
          console.log('Payment updated, refetching notifications');
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId, refetch]);

  return { data: data || [], markAsRead };
}