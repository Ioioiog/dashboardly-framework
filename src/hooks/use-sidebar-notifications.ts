import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/use-user-role';

export type Notification = {
  type: string;
  count: number;
};

export function useSidebarNotifications() {
  const [data, setData] = useState<Notification[]>([]);
  const { userRole } = useUserRole();

  useEffect(() => {
    const fetchNotifications = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      console.log("Fetching notifications for user:", user.id);

      // Fetch unread messages count
      const { count: messagesCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('read', false)
        .eq('receiver_id', user.id);

      console.log('Unread messages count:', messagesCount);

      // Fetch maintenance requests count
      const { count: maintenanceCount } = await supabase
        .from('maintenance_requests')
        .select('*', { count: 'exact', head: true })
        .eq(userRole === 'landlord' ? 'read_by_landlord' : 'read_by_tenant', false);

      console.log('Unread maintenance requests count:', maintenanceCount);

      // Fetch payments count
      const { count: paymentsCount } = await supabase
        .from('payments')
        .select('*', { count: 'exact', head: true })
        .eq(userRole === 'landlord' ? 'read_by_landlord' : 'read_by_tenant', false);

      console.log('Unread payments count:', paymentsCount);

      setData([
        { type: 'messages', count: messagesCount || 0 },
        { type: 'maintenance', count: maintenanceCount || 0 },
        { type: 'payments', count: paymentsCount || 0 }
      ]);
    };

    fetchNotifications();

    // Subscribe to real-time updates for messages
    const messagesSubscription = supabase
      .channel('messages_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'messages' },
        (payload) => {
          console.log('Messages change detected:', payload);
          fetchNotifications();
        }
      )
      .subscribe();

    // Subscribe to maintenance requests updates
    const maintenanceSubscription = supabase
      .channel('maintenance_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'maintenance_requests' },
        (payload) => {
          console.log('Maintenance change detected:', payload);
          fetchNotifications();
        }
      )
      .subscribe();

    // Subscribe to payments updates
    const paymentsSubscription = supabase
      .channel('payments_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'payments' },
        (payload) => {
          console.log('Payments change detected:', payload);
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesSubscription);
      supabase.removeChannel(maintenanceSubscription);
      supabase.removeChannel(paymentsSubscription);
    };
  }, [userRole]);

  const markAsRead = async (type: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    console.log(`Marking ${type} as read for user:`, user.id);

    try {
      if (type === 'messages') {
        const { error } = await supabase
          .from('messages')
          .update({ read: true })
          .eq('receiver_id', user.id)
          .eq('read', false);

        if (error) throw error;
      } else if (type === 'maintenance') {
        const { error } = await supabase
          .from('maintenance_requests')
          .update({ 
            [userRole === 'landlord' ? 'read_by_landlord' : 'read_by_tenant']: true 
          })
          .eq(userRole === 'landlord' ? 'read_by_landlord' : 'read_by_tenant', false);

        if (error) throw error;
      } else if (type === 'payments') {
        const { error } = await supabase
          .from('payments')
          .update({ 
            [userRole === 'landlord' ? 'read_by_landlord' : 'read_by_tenant']: true 
          })
          .eq(userRole === 'landlord' ? 'read_by_landlord' : 'read_by_tenant', false);

        if (error) throw error;
      }

      // Refresh notifications after marking as read
      const updatedData = data.map(item => 
        item.type === type ? { ...item, count: 0 } : item
      );
      setData(updatedData);
    } catch (error) {
      console.error(`Error marking ${type} as read:`, error);
    }
  };

  return { data, markAsRead };
}