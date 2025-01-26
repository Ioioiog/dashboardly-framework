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
                sender:profiles!messages_profile_id_fkey(
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

            const typedMessage = {
              ...newMessage,
              status: (newMessage.status || 'sent') as 'sent' | 'delivered' | 'read',
              read: newMessage.read || false
            };

            onMessageUpdate(typedMessage);
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

    return () => {
      console.log("Cleaning up subscription");
      supabase.removeChannel(channel);
    };
  }, [conversationId, onMessageDelete, onMessageUpdate, toast]);
}