import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MaintenanceRequest } from "../hooks/useMaintenanceRequest";
import { LandlordFields } from "../forms/LandlordFields";
import { ClipboardList, Users, DollarSign, MessageSquare } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

interface MaintenanceRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: MaintenanceRequest;
  onUpdateRequest: (request: Partial<MaintenanceRequest>) => void;
}

export function MaintenanceRequestModal({
  open,
  onOpenChange,
  request,
  onUpdateRequest,
}: MaintenanceRequestModalProps) {
  const [messages, setMessages] = React.useState<any[]>([]);
  const [newMessage, setNewMessage] = React.useState("");
  const { toast } = useToast();
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!request.id) return;

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Maintenance Request Management</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="review" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="review" className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              Initial Review
            </TabsTrigger>
            <TabsTrigger value="provider" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Provider
            </TabsTrigger>
            <TabsTrigger value="costs" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Costs
            </TabsTrigger>
            <TabsTrigger value="communication" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Chat
            </TabsTrigger>
          </TabsList>

          <TabsContent value="review" className="space-y-4 mt-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input 
                  value={request.title} 
                  readOnly 
                  className="bg-muted"
                />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea 
                  value={request.description} 
                  readOnly 
                  className="bg-muted min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label>Priority Level</Label>
                <Input 
                  value={request.priority} 
                  readOnly 
                  className="bg-muted capitalize"
                />
              </div>

              <div className="space-y-2">
                <Label>Contact Phone</Label>
                <Input 
                  value={request.contact_phone || 'Not provided'} 
                  readOnly 
                  className="bg-muted"
                />
              </div>

              <div className="space-y-2">
                <Label>Preferred Service Times</Label>
                <div className="grid grid-cols-3 gap-4">
                  {(request.preferred_times || []).map((time) => (
                    <div key={time} className="flex items-center space-x-2">
                      <Checkbox checked disabled />
                      <span className="capitalize">{time}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Issue Type</Label>
                <Input 
                  value={request.issue_type || 'Not specified'} 
                  readOnly 
                  className="bg-muted"
                />
              </div>

              {request.images && request.images.length > 0 && (
                <div className="space-y-2">
                  <Label>Attached Images</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {request.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Maintenance issue ${index + 1}`}
                        className="w-full h-32 object-cover rounded-md"
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>Status Update</Label>
                <Select 
                  value={request.status} 
                  onValueChange={(value: "pending" | "in_progress" | "completed" | "cancelled") => 
                    onUpdateRequest({ status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="provider" className="space-y-4 mt-4">
            <LandlordFields
              formData={request}
              onFieldChange={(field, value) => onUpdateRequest({ [field]: value })}
              serviceProviders={[]}
              isLoadingProviders={false}
            />
          </TabsContent>

          <TabsContent value="costs" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Service Provider Fee</Label>
                <Input
                  type="number"
                  value={request.service_provider_fee || 0}
                  onChange={(e) => onUpdateRequest({ service_provider_fee: parseFloat(e.target.value) })}
                  className="bg-white"
                />
              </div>

              <div className="space-y-2">
                <Label>Cost Estimate</Label>
                <Input
                  type="number"
                  value={request.cost_estimate || 0}
                  onChange={(e) => onUpdateRequest({ cost_estimate: parseFloat(e.target.value) })}
                  className="bg-white"
                />
              </div>

              <div className="space-y-2">
                <Label>Cost Notes</Label>
                <Textarea
                  value={request.cost_estimate_notes || ''}
                  onChange={(e) => onUpdateRequest({ cost_estimate_notes: e.target.value })}
                  className="bg-white min-h-[100px]"
                  placeholder="Add any notes about costs here..."
                />
              </div>
            </div>
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