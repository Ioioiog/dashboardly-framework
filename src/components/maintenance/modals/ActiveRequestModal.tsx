import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { List, User, DollarSign, MessageSquare } from "lucide-react";
import { MaintenanceRequest } from "../hooks/useMaintenanceRequest";
import { Progress } from "@/components/ui/progress";

interface ActiveRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: MaintenanceRequest;
  onUpdateRequest: (request: Partial<MaintenanceRequest>) => void;
}

export function ActiveRequestModal({
  open,
  onOpenChange,
  request,
  onUpdateRequest,
}: ActiveRequestModalProps) {
  console.log("Rendering ActiveRequestModal with request:", request);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Active Request Management</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="progress" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="progress" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              Progress
            </TabsTrigger>
            <TabsTrigger value="provider" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Provider
            </TabsTrigger>
            <TabsTrigger value="costs" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Costs
            </TabsTrigger>
            <TabsTrigger value="communication" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Messages
            </TabsTrigger>
          </TabsList>

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

          <TabsContent value="communication" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg max-h-[200px] overflow-y-auto">
                <h3 className="font-semibold mb-2">Communication History</h3>
                {/* Add communication history here */}
              </div>
              <textarea
                className="w-full min-h-[100px] p-3 rounded-md border"
                placeholder="Type your message..."
              />
              <Button className="w-full">Send Message</Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}