import React, { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { useUserRole } from "@/hooks/use-user-role";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  sender: {
    first_name: string | null;
    last_name: string | null;
  };
}

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { userRole } = useUserRole();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select(`
          id,
          sender_id,
          content,
          created_at,
          sender:profiles(first_name, last_name)
        `)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching messages:", error);
        return;
      }

      setMessages(data as Message[]);
    };

    fetchMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel("messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        async (payload) => {
          const { data: newMessage, error } = await supabase
            .from("messages")
            .select(`
              id,
              sender_id,
              content,
              created_at,
              sender:profiles(first_name, last_name)
            `)
            .eq("id", payload.new.id)
            .single();

          if (error) {
            console.error("Error fetching new message:", error);
            return;
          }

          setMessages((prev) => [...prev, newMessage as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("messages")
      .insert({
        content: newMessage,
        sender_id: user.id,
      });

    if (error) {
      console.error("Error sending message:", error);
      return;
    }

    setNewMessage("");
  };

  return (
    <div className="flex bg-dashboard-background min-h-screen">
      <DashboardSidebar />
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md h-[calc(100vh-8rem)]">
          <div className="flex flex-col h-full">
            <div className="p-4 border-b">
              <h1 className="text-2xl font-semibold">
                {userRole === "landlord" ? "Chat with Tenants" : "Chat with Landlord"}
              </h1>
            </div>
            
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => {
                  const { data: { user } } = supabase.auth.getUser();
                  return (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.sender_id === user?.id
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          message.sender_id === user?.id
                            ? "bg-blue-500 text-white"
                            : "bg-gray-100"
                        }`}
                      >
                        <p className="text-sm font-semibold mb-1">
                          {message.sender.first_name} {message.sender.last_name}
                        </p>
                        <p>{message.content}</p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <form onSubmit={handleSendMessage} className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1"
                />
                <Button type="submit">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Chat;