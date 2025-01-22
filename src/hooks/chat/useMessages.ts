import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
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
      setMessages(data || []);
    };

    fetchMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          console.log("New message received:", payload);
          const { data: newMessage, error } = await supabase
            .from("messages")
            .select(`
              id,
              sender_id,
              content,
              created_at,
              profile_id,
              conversation_id,
              sender:profiles(first_name, last_name)
            `)
            .eq("id", payload.new.id)
            .single();

          if (error) {
            console.error("Error fetching new message:", error);
            return;
          }

          setMessages((prev) => [...prev, newMessage]);
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

    const { error } = await supabase
      .from("messages")
      .insert({
        content: content.trim(),
        sender_id: currentUserId,
        profile_id: currentUserId,
        conversation_id: conversationId,
      });

    if (error) {
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