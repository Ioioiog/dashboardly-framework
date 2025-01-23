import React, { useRef, useState } from "react";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { MessageList } from "@/components/chat/MessageList";
import { MessageInput } from "@/components/chat/MessageInput";
import { useConversation } from "@/hooks/chat/useConversation";
import { useMessages } from "@/hooks/chat/useMessages";
import { useAuthState } from "@/hooks/useAuthState";

const Chat = () => {
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { isAuthenticated, currentUserId } = useAuthState();
  const { conversationId } = useConversation(currentUserId, selectedTenantId);
  const { messages, sendMessage } = useMessages(conversationId);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      await sendMessage(newMessage, currentUserId);
      setNewMessage("");
    }
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
          </div>
        </div>
      </main>
    </div>
  );
};

export default Chat;