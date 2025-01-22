import React, { useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  id: string;
  sender_id: string;
  content: string;
  sender: {
    first_name: string | null;
    last_name: string | null;
  };
}

interface MessageListProps {
  messages: Message[];
  currentUserId: string | null;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

export function MessageList({ messages, currentUserId, messagesEndRef }: MessageListProps) {
  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, messagesEndRef]);

  return (
    <ScrollArea className="flex-1 p-4">
      <div className="space-y-4">
        {messages.map((message) => {
          const senderName =
            message.sender.first_name && message.sender.last_name
              ? `${message.sender.first_name} ${message.sender.last_name}`
              : "Unknown User";

          const isCurrentUser = message.sender_id === currentUserId;

          return (
            <div
              key={message.id}
              className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  isCurrentUser
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100"
                }`}
              >
                <p className="text-sm font-semibold mb-1">{senderName}</p>
                <p className="break-words">{message.content}</p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
}