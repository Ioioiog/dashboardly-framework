import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useMaintenanceRequest } from "../hooks/useMaintenanceRequest";
import { MaintenanceRequestForm } from "../forms/MaintenanceRequestForm";
import { useToast } from "@/hooks/use-toast";
import { useUserRole } from "@/hooks/use-user-role";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface MaintenanceRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  requestId?: string;
}

export function MaintenanceRequestModal({ isOpen, onClose, requestId }: MaintenanceRequestModalProps) {
  const { existingRequest, updateMutation } = useMaintenanceRequest(requestId);
  const { toast } = useToast();
  const { role } = useUserRole();
  const isServiceProvider = role === "service_provider";

  const handleProviderUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      await updateMutation.mutateAsync({
        ...existingRequest,
        service_provider_notes: formData.get("serviceProviderNotes") as string,
        service_provider_fee: parseFloat(formData.get("serviceFee") as string) || 0,
        service_provider_status: formData.get("serviceStatus") as string,
        cost_estimate: parseFloat(formData.get("costEstimate") as string) || null,
        cost_estimate_notes: formData.get("costEstimateNotes") as string,
        scheduled_date: formData.get("scheduledDate") as string || null,
      });

      toast({
        title: "Success",
        description: "Maintenance request updated successfully",
      });
      onClose();
    } catch (error) {
      console.error("Error updating maintenance request:", error);
      toast({
        title: "Error",
        description: "Failed to update maintenance request",
        variant: "destructive",
      });
    }
  };

  if (!existingRequest && requestId) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {requestId ? "Edit Maintenance Request" : "New Maintenance Request"}
          </DialogTitle>
        </DialogHeader>

        {!requestId ? (
          <MaintenanceRequestForm onClose={onClose} />
        ) : isServiceProvider ? (
          <form onSubmit={handleProviderUpdate} className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="serviceStatus">Service Status</Label>
                <Select name="serviceStatus" defaultValue={existingRequest?.service_provider_status || "pending"}>
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

              <div className="space-y-2">
                <Label htmlFor="scheduledDate">Scheduled Date</Label>
                <Input
                  type="datetime-local"
                  id="scheduledDate"
                  name="scheduledDate"
                  defaultValue={existingRequest?.scheduled_date || ""}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="serviceProviderNotes">Service Notes</Label>
                <Textarea
                  id="serviceProviderNotes"
                  name="serviceProviderNotes"
                  defaultValue={existingRequest?.service_provider_notes || ""}
                  placeholder="Enter your notes about the service"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="serviceFee">Service Fee ($)</Label>
                <Input
                  type="number"
                  id="serviceFee"
                  name="serviceFee"
                  defaultValue={existingRequest?.service_provider_fee || ""}
                  placeholder="Enter the service fee"
                  step="0.01"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="costEstimate">Cost Estimate ($)</Label>
                <Input
                  type="number"
                  id="costEstimate"
                  name="costEstimate"
                  defaultValue={existingRequest?.cost_estimate || ""}
                  placeholder="Enter the estimated cost"
                  step="0.01"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="costEstimateNotes">Cost Estimate Notes</Label>
                <Textarea
                  id="costEstimateNotes"
                  name="costEstimateNotes"
                  defaultValue={existingRequest?.cost_estimate_notes || ""}
                  placeholder="Enter notes about the cost estimate"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <h2>Request Details</h2>
            <p><strong>Title:</strong> {existingRequest.title}</p>
            <p><strong>Description:</strong> {existingRequest.description}</p>
            <p><strong>Status:</strong> {existingRequest.status}</p>
            <p><strong>Created At:</strong> {new Date(existingRequest.created_at).toLocaleString()}</p>
            <p><strong>Updated At:</strong> {new Date(existingRequest.updated_at).toLocaleString()}</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
