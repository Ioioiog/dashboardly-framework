import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  status: 'sent' | 'delivered' | 'read';
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

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select(`
          id,
          sender_id,
          content,
          created_at,
          status,
          profile_id,
          conversation_id,
          sender:profiles(first_name, last_name)
        `)
        .eq('conversation_id', conversationId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching messages:", error);
        toast({
          title: "Error",
          description: "Failed to load messages",
          variant: "destructive",
        });
        return;
      }

      console.log("Fetched messages:", data);
      const typedMessages = data?.map(msg => ({
        ...msg,
        status: (msg.status || 'sent') as 'sent' | 'delivered' | 'read'
      })) || [];
      setMessages(typedMessages);
    };

    fetchMessages();

    // Subscribe to ALL changes (INSERT, UPDATE, DELETE) in the messages table
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

          // For both INSERT and UPDATE, fetch the complete message with sender info
          const { data: newMessage, error } = await supabase
            .from("messages")
            .select(`
              id,
              sender_id,
              content,
              created_at,
              status,
              profile_id,
              conversation_id,
              sender:profiles(first_name, last_name)
            `)
            .eq("id", payload.new.id)
            .single();

          if (error) {
            console.error("Error fetching updated message:", error);
            return;
          }

          console.log("Processed new/updated message:", newMessage);

          const typedMessage = {
            ...newMessage,
            status: (newMessage.status || 'sent') as 'sent' | 'delivered' | 'read'
          };

          setMessages(prev => {
            if (payload.eventType === 'INSERT') {
              return [...prev, typedMessage];
            } else if (payload.eventType === 'UPDATE') {
              return prev.map(msg => msg.id === typedMessage.id ? typedMessage : msg);
            }
            return prev;
          });
        }
      )
      .subscribe((status) => {
        console.log("Subscription status:", status);
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
      const { data, error } = await supabase
        .from("messages")
        .insert({
          content: content.trim(),
          sender_id: currentUserId,
          profile_id: currentUserId,
          conversation_id: conversationId,
          status: 'sent'
        })
        .select(`
          id,
          sender_id,
          content,
          created_at,
          status,
          profile_id,
          conversation_id,
          sender:profiles(first_name, last_name)
        `)
        .single();

      if (error) {
        throw error;
      }

      // Optimistically add the new message to the state
      const typedMessage = {
        ...data,
        status: 'sent' as const
      };
      
      setMessages(prev => [...prev, typedMessage]);
      console.log("Message sent successfully:", typedMessage);

    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };

  return { messages, sendMessage };
}