import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { List, User, DollarSign, MessageSquare, Clipboard, FileText, CheckSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MaintenanceRequest } from "../hooks/useMaintenanceRequest";
import { LandlordFields } from "../forms/LandlordFields";

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

  const getModalTitle = () => {
    switch (request.status) {
      case "pending":
        return "New Maintenance Request Review";
      case "in_progress":
        return "Active Request Management";
      case "completed":
      case "cancelled":
        return "Review and Complete Request";
      default:
        return "Maintenance Request";
    }
  };

  const getTabs = () => {
    const commonTabs = [
      { value: "communication", icon: <MessageSquare className="h-4 w-4" />, label: "Messages" }
    ];

    switch (request.status) {
      case "pending":
        return [
          { value: "review", icon: <Clipboard className="h-4 w-4" />, label: "Initial Review" },
          { value: "assignment", icon: <User className="h-4 w-4" />, label: "Provider Assignment" },
          ...commonTabs
        ];
      case "in_progress":
        return [
          { value: "progress", icon: <List className="h-4 w-4" />, label: "Progress" },
          { value: "provider", icon: <User className="h-4 w-4" />, label: "Provider" },
          { value: "costs", icon: <DollarSign className="h-4 w-4" />, label: "Costs" },
          ...commonTabs
        ];
      case "completed":
      case "cancelled":
        return [
          { value: "verification", icon: <CheckSquare className="h-4 w-4" />, label: "Verify" },
          { value: "costs", icon: <DollarSign className="h-4 w-4" />, label: "Costs" },
          { value: "documentation", icon: <FileText className="h-4 w-4" />, label: "Docs" },
          ...commonTabs
        ];
      default:
        return commonTabs;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[800px]">
        <DialogHeader>
          <DialogTitle>{getModalTitle()}</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue={getTabs()[0].value} className="w-full">
          <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${getTabs().length}, 1fr)` }}>
            {getTabs().map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value} className="flex items-center gap-2">
                {tab.icon}
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {request.status === "pending" && (
            <>
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

              <TabsContent value="assignment" className="space-y-4 mt-4">
                <LandlordFields
                  formData={request}
                  onFieldChange={(field, value) => onUpdateRequest({ [field]: value })}
                  serviceProviders={[]}
                  isLoadingProviders={false}
                />
              </TabsContent>
            </>
          )}

          {request.status === "in_progress" && (
            <>
              <TabsContent value="progress" className="space-y-4 mt-4">
                <div className="space-y-4">
                  <div className="bg-muted p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">Progress Status</h3>
                    <Progress value={33} className="h-2" />
                    <p className="text-sm mt-2">Status: {request.status}</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="provider" className="space-y-4 mt-4">
                <div className="bg-muted p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Assigned Provider</h3>
                  <p className="text-sm">{request.assigned_to || "Not assigned"}</p>
                </div>
              </TabsContent>

              <TabsContent value="costs" className="space-y-4 mt-4">
                <div className="space-y-4">
                  <div className="bg-muted p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">Cost Estimate</h3>
                    <p className="text-sm">${request.cost_estimate || "0"}</p>
                  </div>
                  <div className="bg-muted p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">Current Charges</h3>
                    <p className="text-sm">${request.service_provider_fee || "0"}</p>
                  </div>
                </div>
              </TabsContent>
            </>
          )}

          {(request.status === "completed" || request.status === "cancelled") && (
            <>
              <TabsContent value="verification" className="space-y-4 mt-4">
                <div className="space-y-4">
                  <div className="bg-muted p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">Work Completion Report</h3>
                    <p className="text-sm">{request.completion_report || "No report available"}</p>
                  </div>
                  <Button 
                    className="w-full"
                    onClick={() => onUpdateRequest({ status: "completed" })}
                  >
                    Verify & Complete
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="costs" className="space-y-4 mt-4">
                <div className="space-y-4">
                  <div className="bg-muted p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">Final Cost Breakdown</h3>
                    <div className="space-y-2">
                      <p className="text-sm">Service Fee: ${request.service_provider_fee || "0"}</p>
                      <p className="text-sm">Materials: ${request.cost_estimate || "0"}</p>
                      <div className="border-t pt-2 mt-2">
                        <p className="font-semibold">
                          Total: ${(request.service_provider_fee || 0) + (request.cost_estimate || 0)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <Button className="w-full">Approve Costs</Button>
                </div>
              </TabsContent>

              <TabsContent value="documentation" className="space-y-4 mt-4">
                <div className="space-y-4">
                  <div className="bg-muted p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">Attached Documents</h3>
                    {/* Add document list here */}
                  </div>
                  <Button className="w-full">Upload Document</Button>
                </div>
              </TabsContent>
            </>
          )}

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