import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MaintenanceRequest } from "../hooks/useMaintenanceRequest";
import { useUserRole } from "@/hooks/use-user-role";

interface MaintenanceCostsTabProps {
  request: MaintenanceRequest;
  onUpdateRequest: (updates: Partial<MaintenanceRequest>) => void;
  providedRole?: string;
  isReadOnly?: boolean;
}

export function MaintenanceCostsTab({ request, onUpdateRequest, providedRole, isReadOnly }: MaintenanceCostsTabProps) {
  const { userRole: currentRole } = useUserRole();
  const effectiveRole = providedRole || currentRole;
  const isServiceProvider = effectiveRole === 'service_provider';

  console.log('Current user role:', currentRole);
  console.log('Provided role:', providedRole);
  console.log('Effective role:', effectiveRole);
  console.log('Is service provider:', isServiceProvider);

  return (
    <div className="space-y-4">
      <div>
        <Label>Service Provider Fee</Label>
        <Input
          type="number"
          value={request.service_provider_fee || 0}
          onChange={(e) => onUpdateRequest({ service_provider_fee: parseFloat(e.target.value) })}
          disabled={!isServiceProvider || isReadOnly}
          className="mt-1"
        />
      </div>

      <div>
        <Label>Materials Cost</Label>
        <Input
          type="number"
          value={request.materials_cost || 0}
          onChange={(e) => onUpdateRequest({ materials_cost: parseFloat(e.target.value) })}
          disabled={!isServiceProvider || isReadOnly}
          className="mt-1"
        />
      </div>

      <div>
        <Label>Cost Estimate</Label>
        <Input
          type="number"
          value={request.cost_estimate || 0}
          onChange={(e) => onUpdateRequest({ cost_estimate: parseFloat(e.target.value) })}
          disabled={!isServiceProvider || isReadOnly}
          className="mt-1"
        />
      </div>

      <div>
        <Label>Cost Estimate Notes</Label>
        <Textarea
          value={request.cost_estimate_notes || ''}
          onChange={(e) => onUpdateRequest({ cost_estimate_notes: e.target.value })}
          disabled={!isServiceProvider || isReadOnly}
          className="mt-1"
          placeholder="Add any notes about the cost estimate..."
        />
      </div>
    </div>
  );
}