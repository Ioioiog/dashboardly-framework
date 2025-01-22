import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useChat(selectedTenantId: string | null) {
  const [messages, setMessages] = useState<any[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Error fetching user:", error);
        return;
      }
      if (user) {
        console.log("Current user ID:", user.id);
        setCurrentUserId(user.id);
      }
    };
    getCurrentUser();
  }, []);

  useEffect(() => {
    if (!currentUserId) {
      console.log("No current user ID yet");
      return;
    }

    const setupConversation = async () => {
      try {
        const { data: userProfile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', currentUserId)
          .maybeSingle();

        if (profileError) {
          console.error("Error fetching user profile:", profileError);
          return;
        }

        console.log("User profile:", userProfile);

        let query = supabase
          .from('conversations')
          .select('id');

        if (userProfile?.role === 'tenant') {
          query = query.eq('tenant_id', currentUserId);
        } else {
          if (!selectedTenantId) {
            console.log("No tenant selected for landlord");
            return;
          }
          query = query
            .eq('landlord_id', currentUserId)
            .eq('tenant_id', selectedTenantId);
        }

        const { data: conversation, error: conversationError } = await query.maybeSingle();

        if (conversationError) {
          throw conversationError;
        }

        if (!conversation) {
          if (userProfile?.role === 'landlord' && selectedTenantId) {
            const { data: newConversation, error: createError } = await supabase
              .from('conversations')
              .insert({
                landlord_id: currentUserId,
                tenant_id: selectedTenantId,
              })
              .select('id')
              .single();

            if (createError) throw createError;
            console.log("Created new conversation:", newConversation.id);
            setConversationId(newConversation.id);
          }
        } else {
          console.log("Found existing conversation:", conversation.id);
          setConversationId(conversation.id);
        }
      } catch (error) {
        console.error("Error setting up conversation:", error);
        toast({
          title: "Error",
          description: "Failed to setup conversation",
          variant: "destructive",
        });
      }
    };

    setupConversation();
  }, [currentUserId, selectedTenantId, toast]);

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
  }, [conversationId]);

  const sendMessage = async (content: string) => {
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

  return {
    messages,
    currentUserId,
    sendMessage,
  };
}