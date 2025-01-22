import React, { useRef, useState } from "react";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { MessageList } from "@/components/chat/MessageList";
import { MessageInput } from "@/components/chat/MessageInput";
import { useChat } from "@/hooks/useChat";

const Chat = () => {
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { messages, currentUserId, sendMessage } = useChat(selectedTenantId);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendMessage(newMessage);
    setNewMessage("");
  };

  return (
    <div className="flex bg-dashboard-background min-h-screen">
      <DashboardSidebar />
      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md h-[calc(100vh-8rem)]">
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
