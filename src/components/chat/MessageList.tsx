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
  read: boolean;
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, messagesEndRef]);

  useEffect(() => {
    if (!currentUserId) return;

    const updateMessageStatus = async () => {
      try {
        console.log("Checking for unread messages...");
        const unreadMessages = messages.filter(
          msg => msg.sender_id !== currentUserId && !msg.read
        );

        console.log(`Found ${unreadMessages.length} unread messages`);

        if (unreadMessages.length === 0) return;

        // Update messages in smaller batches to avoid URL length issues
        const batchSize = 10;
        for (let i = 0; i < unreadMessages.length; i += batchSize) {
          const batch = unreadMessages.slice(i, i + batchSize);
          console.log(`Processing batch of ${batch.length} messages`);
          
          const { error } = await supabase
            .from('messages')
            .update({ 
              status: 'read', 
              read: true,
              updated_at: new Date().toISOString() // Force update to trigger realtime
            })
            .in('id', batch.map(msg => msg.id));

          if (error) {
            console.error('Error updating message batch:', error);
            throw error;
          }
        }

        console.log("Successfully marked messages as read");
      } catch (error) {
        console.error('Error updating message status:', error);
        toast({
          title: "Error",
          description: "Failed to update message status",
          variant: "destructive",
        });
      }
    };

    // Run immediately when messages change
    updateMessageStatus();
  }, [messages, currentUserId, toast]);

  const handleEditMessage = (messageId: string, content: string) => {
    setEditingMessageId(messageId);
    setEditedContent(content);
  };

  const handleSaveEdit = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ 
          content: editedContent,
          updated_at: new Date().toISOString() // Force update to trigger realtime
        })
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