import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Send, Loader2 } from "lucide-react";
import { useUserRole } from "@/hooks/use-user-role";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useIsMobile } from "@/hooks/use-mobile";

interface Message {
  id: string;
  content: string;
  sender_id: string;
  receiver_id: string | null;
  created_at: string;
  conversation_id?: string;
  status?: string;
  read?: boolean;
  profile_id: string;
  sender: {
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  } | null;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState<string | null>(null);
  const [recipients, setRecipients] = useState<any[]>([]);
  const { toast } = useToast();
  const { userRole } = useUserRole();
  const isMobile = useIsMobile();

  // ... keep existing code (useEffect and fetchRecipients function)

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-4rem)] bg-background">
        {/* Contact List - hidden on mobile when a chat is selected */}
        <div className={`${
          isMobile && selectedRecipient ? 'hidden' : 'w-full md:w-80'
        } border-r bg-background`}>
          <div className="p-4 border-b">
            <h2 className="font-semibold text-lg">
              {userRole === 'tenant' ? 'My Landlord' : 'My Tenants'}
            </h2>
          </div>
          <ScrollArea className="h-[calc(100%-4rem)]">
            <div className="p-2">
              {recipients.map((recipient) => (
                <button
                  key={recipient.id}
                  onClick={() => selectRecipient(recipient.id)}
                  className={`w-full p-3 flex items-center gap-3 rounded-lg hover:bg-accent transition-colors ${
                    selectedRecipient === recipient.id ? 'bg-accent' : ''
                  }`}
                >
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={recipient.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {recipient.first_name?.[0]}
                      {recipient.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <p className="font-medium">
                      {recipient.first_name} {recipient.last_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {recipient.role}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Chat Area */}
        <div className={`${
          isMobile && !selectedRecipient ? 'hidden' : 'flex-1'
        } flex flex-col bg-background`}>
          {selectedRecipient ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b flex items-center gap-3">
                {isMobile && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedRecipient(null)}
                    className="mr-2"
                  >
                    Back
                  </Button>
                )}
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={recipients.find(r => r.id === selectedRecipient)?.avatar_url || undefined}
                  />
                  <AvatarFallback>
                    {recipients.find(r => r.id === selectedRecipient)?.first_name?.[0]}
                    {recipients.find(r => r.id === selectedRecipient)?.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">
                    {recipients.find(r => r.id === selectedRecipient)?.first_name}{' '}
                    {recipients.find(r => r.id === selectedRecipient)?.last_name}
                  </h3>
                </div>
              </div>

              {/* Messages Area */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.sender_id === selectedRecipient ? 'justify-start' : 'justify-end'
                      }`}
                    >
                      <div
                        className={`max-w-[80%] md:max-w-[70%] rounded-2xl px-4 py-2 ${
                          message.sender_id === selectedRecipient
                            ? 'bg-accent text-accent-foreground'
                            : 'bg-primary text-primary-foreground'
                        }`}
                      >
                        <p className="break-words">{message.content}</p>
                        <p className="text-xs opacity-70 mt-1 text-right">
                          {new Date(message.created_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Message Input */}
              <form
                onSubmit={sendMessage}
                className="p-4 border-t flex gap-2 bg-background"
              >
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="rounded-full"
                  disabled={isLoading}
                />
                <Button 
                  type="submit" 
                  size="icon"
                  className="rounded-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              Select a contact to start chatting
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
