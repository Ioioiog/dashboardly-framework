import React, { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Message } from "./Message";
import { TypingIndicator } from "./TypingIndicator";

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  status: 'sent' | 'delivered' | 'read';
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

export function MessageList({ 
  messages, 
  currentUserId, 
  messagesEndRef, 
  typingUsers = [] 
}: MessageListProps) {
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState("");
  const { toast } = useToast();

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    const scrollToBottom = () => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ 
          behavior: "smooth",
          block: "end"
        });
      }
    };

    // Add a small delay to ensure DOM has updated
    const timeoutId = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timeoutId);
  }, [messages, messagesEndRef]);

  // Update message status to read
  useEffect(() => {
    if (!currentUserId) return;

    const updateMessageStatus = async () => {
      try {
        const unreadMessages = messages.filter(
          msg => msg.sender_id !== currentUserId && msg.status !== 'read'
        );

        if (unreadMessages.length > 0) {
          console.log("Updating status for messages:", unreadMessages.map(m => m.id));
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

          return (
            <Message
              key={message.id}
              id={message.id}
              content={message.content}
              senderName={senderName}
              createdAt={message.created_at}
              isCurrentUser={isCurrentUser}
              status={message.status}
              isEditing={editingMessageId === message.id}
              editedContent={editedContent}
              onEditStart={handleEditMessage}
              onEditSave={handleSaveEdit}
              onEditCancel={() => setEditingMessageId(null)}
              onEditChange={setEditedContent}
              onDelete={handleDeleteMessage}
            />
          );
        })}
        
        <TypingIndicator typingUsers={typingUsers} />
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
}