import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Clipboard, User, MessageSquare } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MaintenanceRequest } from "../hooks/useMaintenanceRequest";
import { LandlordFields } from "../forms/LandlordFields";

interface NewRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: MaintenanceRequest;
  onUpdateRequest: (request: Partial<MaintenanceRequest>) => void;
}

export function NewRequestModal({
  open,
  onOpenChange,
  request,
  onUpdateRequest,
}: NewRequestModalProps) {
  const [messages, setMessages] = React.useState<any[]>([]);
  const [newMessage, setNewMessage] = React.useState("");
  const { toast } = useToast();
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!request.id) return;

    // Fetch existing chat messages
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('maintenance_request_chats')
        .select(`
          *,
          sender:profiles!maintenance_request_chats_sender_id_fkey(
            first_name,
            last_name,
            role
          )
        `)
        .eq('request_id', request.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        return;
      }

      setMessages(data || []);
    };

    fetchMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel(`maintenance_chat_${request.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'maintenance_request_chats',
          filter: `request_id=eq.${request.id}`
        },
        (payload) => {
          console.log('New message received:', payload);
          setMessages(prev => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [request.id]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const { error } = await supabase
        .from('maintenance_request_chats')
        .insert({
          request_id: request.id,
          sender_id: (await supabase.auth.getUser()).data.user?.id,
          message: newMessage.trim()
        });

      if (error) throw error;

      setNewMessage("");
      toast({
        title: "Message sent",
        description: "Your message has been sent successfully.",
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  };

  console.log("Rendering NewRequestModal with request:", request);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[800px]">
        <DialogHeader>
          <DialogTitle>New Maintenance Request Review</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="review" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="review" className="flex items-center gap-2">
              <Clipboard className="h-4 w-4" />
              Initial Review
            </TabsTrigger>
            <TabsTrigger value="assignment" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Provider Assignment
            </TabsTrigger>
            <TabsTrigger value="communication" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Communication
            </TabsTrigger>
          </TabsList>

          <TabsContent value="review" className="space-y-4 mt-4">
            <div className="grid gap-4">
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Request Details</h3>
                <p className="text-sm">{request.description}</p>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Priority Level</h3>
                <p className="text-sm capitalize">{request.priority}</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="assignment" className="space-y-4 mt-4">
            <LandlordFields
              formData={request}
              onFieldChange={(field, value) => onUpdateRequest({ [field]: value })}
              serviceProviders={[]}
              isLoadingProviders={false}
            />
          </TabsContent>

          <TabsContent value="communication" className="space-y-4 mt-4">
            <ScrollArea className="h-[400px] p-4 border rounded-lg">
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      message.sender?.role === 'tenant'
                        ? 'justify-start'
                        : message.sender?.role === 'landlord'
                        ? 'justify-end'
                        : 'justify-center'
                    }`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        message.sender?.role === 'tenant'
                          ? 'bg-blue-100 dark:bg-blue-900'
                          : message.sender?.role === 'landlord'
                          ? 'bg-green-100 dark:bg-green-900'
                          : 'bg-purple-100 dark:bg-purple-900'
                      }`}
                    >
                      <div className="text-xs font-medium mb-1">
                        {message.sender?.first_name} {message.sender?.last_name} ({message.sender?.role})
                      </div>
                      <p className="text-sm">{message.message}</p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
            
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1"
              />
              <Button type="submit" disabled={!newMessage.trim()}>
                Send
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}