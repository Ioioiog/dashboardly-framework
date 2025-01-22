import React, { useState, useEffect } from "react";
import { Send, Paperclip, Smile } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";

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

  const onEmojiClick = (emojiData: EmojiClickData) => {
    setNewMessage(newMessage + emojiData.emoji);
  };

  return (
    <TooltipProvider>
      <form onSubmit={handleSendMessage} className="p-4 border-t dark:border-gray-700 bg-white dark:bg-gray-900">
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9"
              >
                <Paperclip className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Attach file</p>
            </TooltipContent>
          </Tooltip>
          
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1"
          />
          
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9"
              >
                <Smile className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="end">
              <EmojiPicker
                onEmojiClick={onEmojiClick}
                width="100%"
                height={400}
              />
            </PopoverContent>
          </Popover>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                type="submit"
                size="icon"
                className="h-9 w-9"
                disabled={!newMessage.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Send message</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </form>
    </TooltipProvider>
  );
}