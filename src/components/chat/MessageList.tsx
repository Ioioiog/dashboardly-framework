import React, { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { Check, CheckCheck, Trash2, Pencil, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, messagesEndRef]);

  // Update message status when they become visible
  useEffect(() => {
    if (!currentUserId) return;

    const updateMessageStatus = async () => {
      try {
        const unreadMessages = messages.filter(
          msg => msg.sender_id !== currentUserId && (!msg.status || msg.status === 'sent')
        );

        if (unreadMessages.length > 0) {
          const { error } = await supabase
            .from('messages')
            .update({ status: 'read' })
            .in('id', unreadMessages.map(msg => msg.id));

          if (error) throw error;
        }
      } catch (error) {
        console.error('Error updating message status:', error);
      }
    };

    updateMessageStatus();
  }, [messages, currentUserId]);

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

  const handleEditMessage = (messageId: string, content: string) => {
    setEditingMessageId(messageId);
    setEditedContent(content);
  };

  const handleSaveEdit = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ content: editedContent })
        .eq('id', messageId);

      if (error) throw error;

      setEditingMessageId(null);
      toast({
        title: "Message updated",
        description: "Your message has been successfully updated.",
      });
    } catch (error) {
      console.error('Error updating message:', error);
      toast({
        title: "Error",
        description: "Failed to update message. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId);

      if (error) throw error;

      toast({
        title: "Message deleted",
        description: "Your message has been successfully deleted.",
      });
    } catch (error) {
      console.error('Error deleting message:', error);
      toast({
        title: "Error",
        description: "Failed to delete message. Please try again.",
        variant: "destructive",
      });
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
          const isEditing = editingMessageId === message.id;

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
                  {isEditing ? (
                    <div className="flex gap-2">
                      <Input
                        value={editedContent}
                        onChange={(e) => setEditedContent(e.target.value)}
                        className="flex-1 bg-white dark:bg-gray-700"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleSaveEdit(message.id)}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingMessageId(null)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <p className="break-words">{message.content}</p>
                  )}
                </div>
                <div className="flex justify-end mt-1 space-x-2">
                  {isCurrentUser && !isEditing && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => handleEditMessage(message.id, message.content)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => handleDeleteMessage(message.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      {renderMessageStatus(message.status)}
                    </>
                  )}
                </div>
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