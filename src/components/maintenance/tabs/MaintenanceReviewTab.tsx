import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { MaintenanceRequest } from "../hooks/useMaintenanceRequest";
import { FileText } from "lucide-react";

interface MaintenanceReviewTabProps {
  request: MaintenanceRequest;
  onUpdateRequest: (updates: Partial<MaintenanceRequest>) => void;
  userRole?: string;
  canEditStatus?: boolean;
}

export function MaintenanceReviewTab({ request, onUpdateRequest, userRole, canEditStatus }: MaintenanceReviewTabProps) {
  return (
    <div className="space-y-4">
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
              canEditStatus && onUpdateRequest({ status: value })
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
    </div>
  );
}
