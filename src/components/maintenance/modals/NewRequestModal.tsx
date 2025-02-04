import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Clipboard, User, MessageSquare } from "lucide-react";
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
            <div className="space-y-4">
              <textarea
                className="w-full min-h-[100px] p-3 rounded-md border"
                placeholder="Add notes or instructions for the service provider..."
                value={request.service_provider_notes || ""}
                onChange={(e) => onUpdateRequest({ service_provider_notes: e.target.value })}
              />
              <Button className="w-full">Send Message</Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}