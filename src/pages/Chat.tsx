import React, { useRef, useState } from "react";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { MessageList } from "@/components/chat/MessageList";
import { MessageInput } from "@/components/chat/MessageInput";
import { useConversation } from "@/hooks/chat/useConversation";
import { useMessages } from "@/hooks/chat/useMessages";
import { useAuthState } from "@/hooks/useAuthState";
import { Loader2 } from "lucide-react";
import { useUserRole } from "@/hooks/use-user-role";

const Chat = () => {
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { isAuthenticated, currentUserId } = useAuthState();
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
      <main className="flex-1 p-8 animate-fade-in">
        <div className="max-w-4xl mx-auto bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 backdrop-blur-sm h-[calc(100vh-8rem)] transition-all duration-200 hover:shadow-xl">
          <div className="flex flex-col h-full">
            <ChatHeader
              onTenantSelect={setSelectedTenantId}
              selectedTenantId={selectedTenantId}
            />
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Chat;