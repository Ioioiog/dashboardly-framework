import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { CheckSquare, DollarSign, FileText, MessageSquare } from "lucide-react";
import { MaintenanceRequest } from "../hooks/useMaintenanceRequest";

interface ReviewCompleteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: MaintenanceRequest;
  onUpdateRequest: (request: Partial<MaintenanceRequest>) => void;
}

export function ReviewCompleteModal({
  open,
  onOpenChange,
  request,
  onUpdateRequest,
}: ReviewCompleteModalProps) {
  console.log("Rendering ReviewCompleteModal with request:", request);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Review and Complete Request</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="verification" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="verification" className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4" />
              Verify
            </TabsTrigger>
            <TabsTrigger value="costs" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Costs
            </TabsTrigger>
            <TabsTrigger value="documentation" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Docs
            </TabsTrigger>
            <TabsTrigger value="feedback" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Feedback
            </TabsTrigger>
          </TabsList>

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
                    <p className="font-semibold">Total: ${(request.service_provider_fee || 0) + (request.cost_estimate || 0)}</p>
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

          <TabsContent value="feedback" className="space-y-4 mt-4">
            <div className="space-y-4">
              <textarea
                className="w-full min-h-[100px] p-3 rounded-md border"
                placeholder="Provide feedback on the completed work..."
                value={request.rating_comment || ""}
                onChange={(e) => onUpdateRequest({ rating_comment: e.target.value })}
              />
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Rating</h3>
                {/* Add rating component here */}
              </div>
              <Button className="w-full">Submit Feedback</Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}