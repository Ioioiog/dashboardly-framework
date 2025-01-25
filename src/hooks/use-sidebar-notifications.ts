import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { useAuthState } from "./useAuthState";

export interface Notification {
  type: string;
  count: number;
}

export function useSidebarNotifications() {
  const { currentUserId } = useAuthState();

  const fetchNotifications = async (): Promise<Notification[]> => {
    if (!currentUserId) return [];

    console.log("Fetching notifications for user:", currentUserId);

    const notifications: Notification[] = [];

    // Fetch unread messages count
    const { count: messagesCount, error: messagesError } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('receiver_id', currentUserId)
      .eq('status', 'sent');

    if (messagesError) {
      console.error('Error fetching messages count:', messagesError);
    } else {
      notifications.push({ type: 'messages', count: messagesCount || 0 });
    }

    // Fetch pending maintenance requests
    const propertiesQuery = supabase
      .from('properties')
      .select('id')
      .eq('landlord_id', currentUserId);

    const { count: maintenanceCount, error: maintenanceError } = await supabase
      .from('maintenance_requests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')
      .in('property_id', propertiesQuery);

    if (maintenanceError) {
      console.error('Error fetching maintenance count:', maintenanceError);
    } else {
      notifications.push({ type: 'maintenance', count: maintenanceCount || 0 });
    }

    // Fetch pending payments
    const tenanciesQuery = supabase
      .from('tenancies')
      .select('id')
      .in('property_id',
        supabase
          .from('properties')
          .select('id')
          .eq('landlord_id', currentUserId)
      );

    const { count: paymentsCount, error: paymentsError } = await supabase
      .from('payments')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')
      .in('tenancy_id', tenanciesQuery);

    if (paymentsError) {
      console.error('Error fetching payments count:', paymentsError);
    } else {
      notifications.push({ type: 'payments', count: paymentsCount || 0 });
    }

    return notifications;
  };

  const { data, refetch } = useQuery({
    queryKey: ['sidebarNotifications', currentUserId],
    queryFn: fetchNotifications,
    enabled: !!currentUserId,
  });

  useEffect(() => {
    if (!currentUserId) return;

    // Subscribe to real-time updates for messages
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
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId, refetch]);

  return { data: data || [] };
}