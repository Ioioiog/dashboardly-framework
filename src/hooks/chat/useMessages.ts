import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  status: 'sent' | 'delivered' | 'read';
  read: boolean;
  sender: {
    first_name: string | null;
    last_name: string | null;
  } | null;
}

export function useMessages(conversationId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (!conversationId) {
      console.log("No conversation ID yet");
      return;
    }

    console.log("Fetching messages for conversation:", conversationId);

    const fetchMessages = async (retryCount = 0) => {
      try {
        console.log(`Attempting to fetch messages (attempt ${retryCount + 1})`);
        
        const { data, error } = await supabase
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
          .eq('conversation_id', conversationId)
          .order("created_at", { ascending: true });

        if (error) {
          console.error("Error fetching messages:", error);
          if (retryCount < 2) {
            console.log("Retrying fetch...");
            setTimeout(() => fetchMessages(retryCount + 1), 1000 * (retryCount + 1));
            return;
          }
          toast({
            title: "Error",
            description: "Failed to load messages. Please try refreshing the page.",
            variant: "destructive",
          });
          return;
        }

        console.log("Successfully fetched messages:", data?.length || 0, "messages");
        const typedMessages = data?.map(msg => ({
          ...msg,
          status: (msg.status || 'sent') as 'sent' | 'delivered' | 'read',
          read: msg.read || false
        })) || [];
        setMessages(typedMessages);
      } catch (err) {
        console.error("Unexpected error fetching messages:", err);
        if (retryCount < 2) {
          console.log("Retrying after unexpected error...");
          setTimeout(() => fetchMessages(retryCount + 1), 1000 * (retryCount + 1));
          return;
        }
        toast({
          title: "Error",
          description: "Failed to load messages. Please try refreshing the page.",
          variant: "destructive",
        });
      }
    };

    fetchMessages();

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
            setMessages(prev => prev.filter(msg => msg.id !== payload.old.id));
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

            if (payload.eventType === 'INSERT') {
              setMessages(prev => [...prev, typedMessage]);
            } else if (payload.eventType === 'UPDATE') {
              setMessages(prev => 
                prev.map(msg => msg.id === typedMessage.id ? typedMessage : msg)
              );
            }
          } catch (err) {
            console.error("Error processing message change:", err);
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
  }, [conversationId, toast]);

  const sendMessage = async (content: string, currentUserId: string | null) => {
    if (!conversationId || !currentUserId || !content.trim()) {
      console.log("Missing required data for sending message:", {
        conversationId,
        currentUserId,
        contentLength: content?.length
      });
      return;
    }

    console.log("Sending message:", {
      conversationId,
      currentUserId,
      content
    });

    try {
      const { error } = await supabase
        .from("messages")
        .insert({
          content: content.trim(),
          sender_id: currentUserId,
          profile_id: currentUserId,
          conversation_id: conversationId,
          status: 'sent',
          read: false
        });

      if (error) {
        console.error("Error sending message:", error);
        toast({
          title: "Error",
          description: "Failed to send message. Please try again.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Unexpected error sending message:", err);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
        });
    }
  };

  return { messages, sendMessage };
}