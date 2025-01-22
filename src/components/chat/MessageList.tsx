import React, { useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { Check, CheckCheck } from "lucide-react";

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  status?: 'sent' | 'delivered' | 'read';
  sender: {
    first_name: string | null;
    last_name: string | null;
  } | null;
}

interface MessageListProps {
  messages: Message[];
  currentUserId: string | null;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  typingUsers?: string[];
}

export function MessageList({ messages, currentUserId, messagesEndRef, typingUsers = [] }: MessageListProps) {
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, messagesEndRef]);

  const renderMessageStatus = (status?: string) => {
    switch (status) {
      case 'delivered':
        return <Check className="h-4 w-4 text-blue-500" />;
      case 'read':
        return <CheckCheck className="h-4 w-4 text-blue-500" />;
      default:
        return <Check className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <ScrollArea className="flex-1 p-4">
      <div className="space-y-4">
        {messages.map((message) => {
          const senderName = message.sender
            ? `${message.sender.first_name || ''} ${message.sender.last_name || ''}`.trim() || 'Unknown User'
            : 'Unknown User';

          const isCurrentUser = message.sender_id === currentUserId;
          const messageTime = format(new Date(message.created_at), 'HH:mm');

          return (
            <div
              key={message.id}
              className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
            >
              <div className="max-w-[70%]">
                <div
                  className={`rounded-lg p-3 ${
                    isCurrentUser
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 dark:bg-gray-800"
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-sm font-semibold">{senderName}</p>
                    <span className="text-xs opacity-70">{messageTime}</span>
                  </div>
                  <p className="break-words">{message.content}</p>
                </div>
                {isCurrentUser && (
                  <div className="flex justify-end mt-1">
                    {renderMessageStatus(message.status)}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        
        {typingUsers.length > 0 && (
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <div className="flex space-x-1">
              <span className="animate-bounce">.</span>
              <span className="animate-bounce delay-100">.</span>
              <span className="animate-bounce delay-200">.</span>
            </div>
            <span>{typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing</span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
}