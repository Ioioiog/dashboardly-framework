import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Message } from "./types";

export function useMessageSubscription(
  conversationId: string | null,
  onMessageUpdate: (message: Message) => void,
  onMessageDelete: (messageId: string) => void
) {
  const { toast } = useToast();

  useEffect(() => {
    if (!conversationId) {
      console.log("No conversation ID yet");
      return;
    }

    console.log("Setting up message subscription for conversation:", conversationId);

    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          console.log("Message change received:", payload);
          
          if (payload.eventType === 'DELETE') {
            onMessageDelete(payload.old.id);
            return;
          }

          try {
            const { data: newMessage, error } = await supabase
              .from("messages")
              .select(`
                id,
                sender_id,
                content,
                created_at,
                status,
                read,
                profile_id,
                conversation_id,
                profiles!messages_profile_id_fkey (
                  first_name,
                  last_name
                )
              `)
              .eq("id", payload.new.id)
              .maybeSingle();

            if (error) {
              console.error("Error fetching updated message:", error);
              return;
            }

            if (!newMessage) {
              console.log("Message not found or not accessible");
              return;
            }

            // Transform the data to match the Message type
            const typedMessage: Message = {
              ...newMessage,
              sender: newMessage.profiles || null,
              status: (newMessage.status || 'sent') as 'sent' | 'delivered' | 'read',
              read: newMessage.read || false,
              conversation_id: newMessage.conversation_id
            };

            // Cache the message in IndexedDB - prepare data for upsert
            const messageForUpsert = {
              id: typedMessage.id,
              sender_id: typedMessage.sender_id,
              content: typedMessage.content,
              created_at: typedMessage.created_at,
              status: typedMessage.status,
              read: typedMessage.read,
              profile_id: newMessage.profile_id,
              conversation_id: newMessage.conversation_id
            };

            try {
              await supabase
                .from("messages")
                .upsert(messageForUpsert, { onConflict: 'id' });
              console.log("Message cached successfully");
            } catch (cacheError) {
              console.error("Error caching message:", cacheError);
            }

            onMessageUpdate(typedMessage);

            // Show notification if message is from another user
            const { data: { user } } = await supabase.auth.getUser();
            if (newMessage.sender_id !== user?.id) {
              if ('Notification' in window && Notification.permission === 'granted') {
                const sender = typedMessage.sender?.first_name || 'Someone';
                new Notification('New Message', {
                  body: `${sender}: ${newMessage.content}`,
                  icon: '/pwa-192x192.png'
                });
              }
            }
          } catch (err) {
            console.error("Error processing message change:", err);
            toast({
              title: "Error",
              description: "Failed to process message update",
              variant: "destructive",
            });
          }
        }
      )
      .subscribe((status) => {
        console.log("Realtime subscription status:", status);
      });

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      console.log("Cleaning up subscription");
      supabase.removeChannel(channel);
    };
  }, [conversationId, onMessageDelete, onMessageUpdate, toast]);
}