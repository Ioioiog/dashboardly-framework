import React, { useRef, useState } from "react";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { MessageList } from "@/components/chat/MessageList";
import { MessageInput } from "@/components/chat/MessageInput";
import { useConversation } from "@/hooks/chat/useConversation";
import { useMessages } from "@/hooks/chat/useMessages";
import { useAuthState } from "@/hooks/useAuthState";
import { Loader2, Search } from "lucide-react";
import { useUserRole } from "@/hooks/use-user-role";
import { TenantSelect } from "@/components/chat/TenantSelect";

const Chat = () => {
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
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

  const handleTenantSelect = (tenantId: string) => {
    setSelectedTenantId(tenantId);
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
        <div className="flex-1 flex items-center justify-center p-8 text-center bg-slate-50 dark:bg-slate-900">
          <div className="max-w-md">
            <h3 className="text-lg font-semibold mb-2">Start a Conversation</h3>
            <p className="text-muted-foreground">
              Select a conversation from the sidebar to start chatting.
            </p>
          </div>
        </div>
      );
    }

    if (!conversationId) {
      return (
        <div className="flex-1 flex items-center justify-center p-8 text-center bg-slate-50 dark:bg-slate-900">
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
    <div className="flex h-screen bg-slate-100 dark:bg-slate-900">
      <DashboardSidebar />
      
      {/* Chat Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Conversations Sidebar */}
        <div className="w-[350px] flex flex-col border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          {/* Search Bar */}
          <div className="p-3 border-b border-slate-200 dark:border-slate-700">
            <div className="relative">
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            <TenantSelect
              onTenantSelect={handleTenantSelect}
              selectedTenantId={selectedTenantId || undefined}
              displayStyle="list"
            />
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-900">
          <ChatHeader 
            onTenantSelect={handleTenantSelect}
            selectedTenantId={selectedTenantId}
          />
          <div className="flex-1 flex flex-col overflow-hidden">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
