import React, { useRef, useState } from "react";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { MessageList } from "@/components/chat/MessageList";
import { MessageInput } from "@/components/chat/MessageInput";
import { useConversation } from "@/hooks/chat/useConversation";
import { useMessages } from "@/hooks/chat/useMessages";
import { useAuthState } from "@/hooks/useAuthState";
import { Loader2, MessageSquare } from "lucide-react";
import { useUserRole } from "@/hooks/use-user-role";
import { ConversationContainer } from "@/components/chat/ConversationContainer";

const Chat = () => {
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { currentUserId } = useAuthState();
  const { conversationId, isLoading: isConversationLoading } = useConversation(currentUserId, selectedTenantId);
  const { messages, sendMessage } = useMessages(conversationId);
  const { userRole } = useUserRole();

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      await sendMessage(newMessage, currentUserId);
      setNewMessage("");
    }
  };

  const renderContent = () => {
    if (isConversationLoading) {
      return (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      );
    }

    if (userRole === "landlord" && !selectedTenantId) {
      return (
        <div className="flex-1 flex items-center justify-center p-8 text-center">
          <div className="max-w-md">
            <h3 className="text-lg font-semibold mb-2">Select a Tenant</h3>
            <p className="text-muted-foreground">
              Choose a tenant from the dropdown above to start a conversation.
            </p>
          </div>
        </div>
      );
    }

    if (!conversationId) {
      return (
        <div className="flex-1 flex items-center justify-center p-8 text-center">
          <div className="max-w-md">
            <h3 className="text-lg font-semibold mb-2">No Conversation Found</h3>
            <p className="text-muted-foreground">
              {userRole === "landlord" 
                ? "There seems to be an issue with the conversation. Please try selecting a different tenant."
                : "There seems to be an issue with your conversation. Please contact support if this persists."}
            </p>
          </div>
        </div>
      );
    }

    return (
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
    );
  };

  return (
    <div className="flex bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 min-h-screen">
      <DashboardSidebar />
      <ConversationContainer>
        <div className="p-4 border-b bg-white dark:bg-slate-900 rounded-t-xl backdrop-blur-sm">
          <div className="flex items-center gap-4 mb-2 animate-fade-in">
            <div className="p-3 bg-blue-600 rounded-xl">
              <MessageSquare className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">
              {userRole === "landlord" ? "Chat with Tenants" : "Chat with Landlord"}
            </h1>
          </div>
          {userRole === "landlord" && (
            <div className="mt-3 flex items-center gap-2 animate-fade-in delay-100">
              {/* Tenant select component can be added here */}
            </div>
          )}
        </div>
        {renderContent()}
      </ConversationContainer>
    </div>
  );
};

export default Chat;
