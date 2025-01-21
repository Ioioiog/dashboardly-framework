import React, { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/use-user-role";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { MessageList } from "@/components/chat/MessageList";
import { MessageInput } from "@/components/chat/MessageInput";

const Chat = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { userRole } = useUserRole();
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Error fetching user:", error);
        return;
      }
      if (user) {
        setCurrentUserId(user.id);
      }
    };
    getCurrentUser();
  }, []);

  useEffect(() => {
    if (!currentUserId || (userRole === 'landlord' && !selectedTenantId)) {
      return;
    }

    const setupConversation = async () => {
      try {
        if (userRole === 'landlord' && selectedTenantId) {
          const { data: conversation, error: conversationError } = await supabase
            .from('conversations')
            .select('id')
            .eq('landlord_id', currentUserId)
            .eq('tenant_id', selectedTenantId)
            .single();

          if (conversationError && conversationError.code !== 'PGRST116') {
            throw conversationError;
          }

          if (!conversation) {
            const { data: newConversation, error: createError } = await supabase
              .from('conversations')
              .insert({
                landlord_id: currentUserId,
                tenant_id: selectedTenantId,
              })
              .select('id')
              .single();

            if (createError) throw createError;
            setConversationId(newConversation.id);
          } else {
            setConversationId(conversation.id);
          }
        } else if (userRole === 'tenant') {
          const { data: conversation, error: conversationError } = await supabase
            .from('conversations')
            .select('id')
            .eq('tenant_id', currentUserId)
            .single();

          if (conversationError) {
            console.error("Error fetching conversation:", conversationError);
            return;
          }

          if (conversation) {
            setConversationId(conversation.id);
          }
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
  }, [currentUserId, selectedTenantId, userRole, toast]);

  useEffect(() => {
    if (!conversationId) return;

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

      setMessages(data);
    };

    fetchMessages();

    const channel = supabase
      .channel("messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
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
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUserId || !conversationId) return;

    const { error } = await supabase
      .from("messages")
      .insert({
        content: newMessage,
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
      return;
    }

    setNewMessage("");
  };

  return (
    <div className="flex bg-dashboard-background min-h-screen">
      <DashboardSidebar />
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md h-[calc(100vh-8rem)]">
          <div className="flex flex-col h-full">
            <ChatHeader
              onTenantSelect={setSelectedTenantId}
              selectedTenantId={selectedTenantId}
            />
            
            {(!selectedTenantId && userRole === "landlord") ? (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-muted-foreground">Select a tenant to start chatting</p>
              </div>
            ) : (
              <>
                <MessageList
                  messages={messages}
                  currentUserId={currentUserId}
                  messagesEndRef={messagesEndRef}
                />
                <MessageInput
                  newMessage={newMessage}
                  setNewMessage={setNewMessage}
                  handleSendMessage={handleSendMessage}
                />
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Chat;