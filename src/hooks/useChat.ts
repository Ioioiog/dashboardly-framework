import { useAuthState } from "./chat/useAuthState";
import { useConversation } from "./chat/useConversation";
import { useMessages } from "./chat/useMessages";

export function useChat(selectedTenantId: string | null) {
  const { currentUserId } = useAuthState();
  const { conversationId, isLoading } = useConversation(currentUserId, selectedTenantId);
  const { messages, sendMessage } = useMessages(conversationId);

  return {
    messages,
    currentUserId,
    sendMessage: (content: string) => sendMessage(content, currentUserId),
    isLoading,
  };
}