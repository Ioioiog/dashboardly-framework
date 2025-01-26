import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useMessageSubscription } from "./useMessageSubscription";
import { useMessageOperations } from "./useMessageOperations";
import { Message } from "./types";

export function useMessages(conversationId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const { toast } = useToast();
  const { sendMessage: sendMessageOperation } = useMessageOperations();

  const handleMessageUpdate = useCallback((newMessage: Message) => {
    setMessages(prev => {
      const messageIndex = prev.findIndex(msg => msg.id === newMessage.id);
      if (messageIndex !== -1) {
        const updatedMessages = [...prev];
        updatedMessages[messageIndex] = newMessage;
        return updatedMessages;
      }
      return [...prev, newMessage];
    });
  }, []);

  const handleMessageDelete = useCallback((messageId: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
  }, []);

  useMessageSubscription(conversationId, handleMessageUpdate, handleMessageDelete);

  const sendMessage = async (content: string, currentUserId: string | null) => {
    await sendMessageOperation(content, currentUserId, conversationId);
  };

  return { messages, sendMessage };
}