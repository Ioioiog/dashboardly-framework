import React from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MaintenanceRequest } from "../hooks/useMaintenanceRequest";
import { LandlordFields } from "../forms/LandlordFields";
import { ScheduleVisitField } from "../forms/ScheduleVisitField";
import { useUserRole } from "@/hooks/use-user-role";

interface MaintenanceProviderTabProps {
  request: MaintenanceRequest;
  onUpdateRequest: (updates: Partial<MaintenanceRequest>) => void;
}

export function MaintenanceProviderTab({ request, onUpdateRequest }: MaintenanceProviderTabProps) {
  const { userRole } = useUserRole();
  const isLandlord = userRole === 'landlord';
  const canEditNotes = userRole === 'landlord' || userRole === 'service_provider';

  return (
    <div className="space-y-4">
      <LandlordFields
        formData={request}
        onFieldChange={(field, value) => onUpdateRequest({ [field]: value })}
        isLoadingProviders={false}
        isReadOnly={!isLandlord}
        userRole={userRole}
      />

      <div className="space-y-2">
        <Label>Schedule Visit</Label>
        {canEditNotes ? (
          <ScheduleVisitField
            value={request.scheduled_date ? new Date(request.scheduled_date) : undefined}
            onChange={(date) => onUpdateRequest({ scheduled_date: date?.toISOString() })}
            disabled={false}
          />
        ) : (
          <div className="p-3 bg-gray-50 rounded-md border">
            {request.scheduled_date ? new Date(request.scheduled_date).toLocaleDateString() : "Not scheduled"}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label>Service Provider Status</Label>
        {isLandlord ? (
          <Select
            value={request.service_provider_status || ''}
            onValueChange={(value) => onUpdateRequest({ service_provider_status: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        ) : (
          <div className="p-3 bg-gray-50 rounded-md border">
            {request.service_provider_status || "Not set"}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label>Service Provider Notes</Label>
        {canEditNotes ? (
          <Textarea
            value={request.service_provider_notes || ''}
            onChange={(e) => onUpdateRequest({ service_provider_notes: e.target.value })}
            placeholder="Add any notes about the service..."
            className="min-h-[100px]"
          />
        ) : (
          <div className="p-3 bg-gray-50 rounded-md border min-h-[100px]">
            {request.service_provider_notes || "No notes available"}
          </div>
        )}
      </div>
    </div>
  );
}