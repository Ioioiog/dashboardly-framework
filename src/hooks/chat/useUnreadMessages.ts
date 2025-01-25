import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useUnreadMessages(conversationId: string | null, currentUserId: string | null) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!conversationId || !currentUserId) return;

    const fetchUnreadCount = async () => {
      const { count, error } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('conversation_id', conversationId)
        .neq('sender_id', currentUserId)
        .eq('status', 'sent');

      if (error) {
        console.error('Error fetching unread messages:', error);
        return;
      }

      setUnreadCount(count || 0);
    };

    fetchUnreadCount();

    // Subscribe to new messages
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          console.log('Message change received:', payload);
          fetchUnreadCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, currentUserId]);

  return { unreadCount };
}