import React, { useState, useEffect } from "react";
import { Send, Paperclip, Smile } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";

interface MessageInputProps {
  newMessage: string;
  setNewMessage: (message: string) => void;
  handleSendMessage: (e: React.FormEvent) => void;
  onTypingStart?: () => void;
  onTypingStop?: () => void;
}

export function MessageInput({ 
  newMessage, 
  setNewMessage, 
  handleSendMessage,
  onTypingStart,
  onTypingStop 
}: MessageInputProps) {
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeout = 1000; // 1 second

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (newMessage && !isTyping) {
      setIsTyping(true);
      onTypingStart?.();
    }

    if (isTyping) {
      timer = setTimeout(() => {
        setIsTyping(false);
        onTypingStop?.();
      }, typingTimeout);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [newMessage, isTyping, onTypingStart, onTypingStop]);

  return (
    <form onSubmit={handleSendMessage} className="p-4 border-t dark:border-gray-700 bg-white dark:bg-gray-900">
      <div className="flex items-center gap-2">
        <Tooltip content="Attach file">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9"
          >
            <Paperclip className="h-4 w-4" />
          </Button>
        </Tooltip>
        
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-1"
        />
        
        <Tooltip content="Add emoji">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9"
          >
            <Smile className="h-4 w-4" />
          </Button>
        </Tooltip>

        <Tooltip content="Send message">
          <Button 
            type="submit"
            size="icon"
            className="h-9 w-9"
            disabled={!newMessage.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </Tooltip>
      </div>
    </form>
  );
}